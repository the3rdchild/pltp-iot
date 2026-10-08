import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getLimitData } from '../utils/limitData';
import { updateLimitDataFromChartConfig, prepareLimitUpdatePayload } from '../utils/limitConfigManager';

/**
 * Hook to manage chart reference lines configuration (Min/Max/Avg)
 * Links with Limit.json for anomaly detection thresholds
 *
 * When user sets:
 * - Min → updates lowerLimit in Limit.json
 * - Max → updates upperLimit in Limit.json
 * - Avg → chart reference line only, not a limit
 */

const STORAGE_KEY = 'chart_reference_config';

// Default configuration from Limit.json
const getDefaultConfig = () => {
  const limits = getLimitData();

  const ref = (limit, fallbackMin, fallbackMax) => {
    const min = limit?.lowerLimit ?? fallbackMin;
    const max = limit?.upperLimit ?? fallbackMax;
    return { enabled: false, min, max, avg: (min + max) / 2 };
  };

  return {
    pressure: ref(limits.pressure, 4, 8),
    temperature: ref(limits.temperature, 120, 160),
    flow_rate: ref(limits.flow, 240, 300),
    ncg: ref(limits.ncg, 0.5, 2.5),
    dryness: ref(limits.dryness, 97, 100),
    tds: ref(limits['TDS: Overall'], 4, 8)
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
