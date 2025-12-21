import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getLimitData } from '../utils/limitData';
import { updateLimitDataFromChartConfig, prepareLimitUpdatePayload } from '../utils/limitConfigManager';

/**
 * Hook to manage chart reference lines configuration (Min/Max/Avg)
 * Links with Limit.json for anomaly detection thresholds
 *
 * When user sets:
 * - Min → updates abnormalLow in Limit.json
 * - Max → updates abnormalHigh in Limit.json
 * - Avg → updates idealLow and idealHigh in Limit.json
 */

const STORAGE_KEY = 'chart_reference_config';

// Default configuration from Limit.json
const getDefaultConfig = () => {
  const limits = getLimitData();

  return {
    pressure: {
      enabled: false,
      min: limits.pressure?.abnormalLow || 4,
      max: limits.pressure?.abnormalHigh || 8,
      avg: ((limits.pressure?.idealLow || 5.5) + (limits.pressure?.idealHigh || 6.5)) / 2
    },
    temperature: {
      enabled: false,
      min: limits.temperature?.abnormalLow || 120,
      max: limits.temperature?.abnormalHigh || 160,
      avg: ((limits.temperature?.idealLow || 135) + (limits.temperature?.idealHigh || 145)) / 2
    },
    flow_rate: {
      enabled: false,
      min: limits.flow?.abnormalLow || 240,
      max: limits.flow?.abnormalHigh || 300,
      avg: ((limits.flow?.idealLow || 260) + (limits.flow?.idealHigh || 280)) / 2
    },
    ncg: {
      enabled: false,
      min: limits.ncg?.abnormalLow || 0.5,
      max: limits.ncg?.abnormalHigh || 2.5,
      avg: ((limits.ncg?.idealLow || 1.0) + (limits.ncg?.idealHigh || 1.5)) / 2
    },
    dryness: {
      enabled: false,
      min: limits.dryness?.abnormalLow || 97,
      max: limits.dryness?.abnormalHigh || 100,
      avg: ((limits.dryness?.idealLow || 98) + (limits.dryness?.idealHigh || 99.5)) / 2
    },
    tds: {
      enabled: false,
      min: limits['TDS: Overall']?.abnormalLow || 4,
      max: limits['TDS: Overall']?.abnormalHigh || 8,
      avg: ((limits['TDS: Overall']?.idealLow || 5) + (limits['TDS: Overall']?.idealHigh || 7)) / 2
    }
  };
};

export const useChartReferenceConfig = () => {
  const location = useLocation();
  const isTestEnvironment = location.pathname.startsWith('/test');

  const [config, setConfig] = useState(getDefaultConfig());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load configuration on mount
  useEffect(() => {
    loadConfig();
  }, [isTestEnvironment]);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isTestEnvironment) {
        // Test: Load from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setConfig(parsed);
        } else {
          setConfig(getDefaultConfig());
        }
      } else {
        // Production: Load from API
        // TODO: Implement API call
        // const response = await fetch('/api/configuration/chart-references');
        // const data = await response.json();
        // setConfig(data);

        // For now, use default
        setConfig(getDefaultConfig());
      }
    } catch (err) {
      console.error('Error loading chart reference config:', err);
      setError(err);
      setConfig(getDefaultConfig());
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (newConfig) => {
    setLoading(true);
    setError(null);

    try {
      if (isTestEnvironment) {
        // Test: Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
        setConfig(newConfig);

        // Update Limit.json (for test environment)
        updateLimitJson(newConfig);
      } else {
        // Production: Save to API
        // TODO: Implement API call
        // const response = await fetch('/api/configuration/chart-references', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(newConfig)
        // });
        // const data = await response.json();
        // setConfig(data);

        // For now, just update local state
        setConfig(newConfig);

        // Update Limit.json (backend should do this)
        updateLimitJson(newConfig);
      }
    } catch (err) {
      console.error('Error saving chart reference config:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLimitJson = (newConfig) => {
    if (isTestEnvironment) {
      // Test: Update localStorage Limit.json
      updateLimitDataFromChartConfig(newConfig);
      console.log('Limit.json updated in localStorage from chart configuration');
    } else {
      // Production: Send update to backend API
      const payload = prepareLimitUpdatePayload(newConfig);

      // TODO: Implement API call
      // fetch('/api/configuration/limits', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // }).then(response => response.json())
      //   .then(data => console.log('Limit.json updated on backend:', data))
      //   .catch(err => console.error('Error updating Limit.json:', err));

      console.log('Limit.json update payload for backend:', payload);
    }
  };

  const updateMetricConfig = (metric, updates) => {
    const newConfig = {
      ...config,
      [metric]: {
        ...config[metric],
        ...updates
      }
    };
    return saveConfig(newConfig);
  };

  const toggleMetric = (metric, enabled) => {
    return updateMetricConfig(metric, { enabled });
  };

  const resetToDefaults = () => {
    const defaults = getDefaultConfig();
    return saveConfig(defaults);
  };

  return {
    config,
    loading,
    error,
    saveConfig,
    updateMetricConfig,
    toggleMetric,
    resetToDefaults,
    reload: loadConfig
  };
};

export default useChartReferenceConfig;
