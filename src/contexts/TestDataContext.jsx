import { createContext, useContext, useState, useEffect } from 'react';

// Preset scenarios
export const PRESET_SCENARIOS = {
  normal: {
    name: 'Normal Operation',
    description: 'All parameters within normal range',
    values: {
      pressure: 5.87,
      temperature: 165.2,
      flow_rate: 245.71,
      tds: 1.0012,
      dryness: 95,
      ncg: 0.45,
      active_power: 32.5,
      reactive_power: 6.22,
      voltage: 13.86,
      speed: 2998,
      current: 1377.45
    }
  },
  warning: {
    name: 'Warning Level',
    description: 'Some parameters approaching thresholds',
    values: {
      pressure: 5.2,
      temperature: 170.5,
      flow_rate: 220.0,
      tds: 2.5,
      dryness: 88,
      ncg: 0.75,
      active_power: 30.0,
      reactive_power: 7.5,
      voltage: 13.2,
      speed: 2950,
      current: 1420.0
    }
  },
  critical: {
    name: 'Critical Anomaly',
    description: 'Multiple parameters in critical range',
    values: {
      pressure: 4.5,
      temperature: 180.0,
      flow_rate: 180.0,
      tds: 4.8,
      dryness: 72,
      ncg: 1.8,
      active_power: 25.0,
      reactive_power: 9.0,
      voltage: 12.5,
      speed: 2850,
      current: 1550.0
    }
  },
  highNCG: {
    name: 'High NCG Event',
    description: 'Elevated non-condensable gas levels',
    values: {
      pressure: 5.5,
      temperature: 167.0,
      flow_rate: 240.0,
      tds: 1.2,
      dryness: 92,
      ncg: 2.2,
      active_power: 31.5,
      reactive_power: 6.5,
      voltage: 13.7,
      speed: 2985,
      current: 1390.0
    }
  },
  lowDryness: {
    name: 'Low Dryness',
    description: 'Steam quality below optimal',
    values: {
      pressure: 5.6,
      temperature: 164.0,
      flow_rate: 235.0,
      tds: 1.5,
      dryness: 78,
      ncg: 0.55,
      active_power: 30.5,
      reactive_power: 6.8,
      voltage: 13.5,
      speed: 2975,
      current: 1400.0
    }
  },
  highTDS: {
    name: 'High TDS',
    description: 'Elevated total dissolved solids',
    values: {
      pressure: 5.75,
      temperature: 166.0,
      flow_rate: 242.0,
      tds: 5.2,
      dryness: 93,
      ncg: 0.48,
      active_power: 32.0,
      reactive_power: 6.3,
      voltage: 13.8,
      speed: 2995,
      current: 1385.0
    }
  }
};

// Default configuration with variance settings
const DEFAULT_CONFIG = {
  dynamicMode: true,
  variance: {
    pressure: 0.1,      // ±0.1 bar
    temperature: 2.0,   // ±2°C
    flow_rate: 5.0,     // ±5 kg/s
    tds: 0.05,          // ±0.05 ppm
    dryness: 2,         // ±2%
    ncg: 0.05,          // ±0.05%
    active_power: 0.5,  // ±0.5 MW
    reactive_power: 0.2, // ±0.2 MVAR
    voltage: 0.2,       // ±0.2 kV
    speed: 20,          // ±20 RPM
    current: 30         // ±30 A
  }
};

// Default mock data structure
const DEFAULT_MOCK_DATA = {
  metrics: {
    pressure: { value: 5.87, timestamp: new Date().toISOString() },
    temperature: { value: 165.2, timestamp: new Date().toISOString() },
    flow_rate: { value: 245.71, timestamp: new Date().toISOString() },
    tds: { value: 1.0012, timestamp: new Date().toISOString() },
    dryness: { value: 95, timestamp: new Date().toISOString() },
    ncg: { value: 0.45, timestamp: new Date().toISOString() },
    active_power: { value: 32.5, timestamp: new Date().toISOString() },
    reactive_power: { value: 6.22, timestamp: new Date().toISOString() },
    voltage: { value: 13.86, timestamp: new Date().toISOString() },
    speed: { value: 2998, timestamp: new Date().toISOString() },
    current: { value: 1377.45, timestamp: new Date().toISOString() }
  },
  status: 'success'
};

const TestDataContext = createContext();

export const useTestData = () => {
  const context = useContext(TestDataContext);
  if (!context) {
    throw new Error('useTestData must be used within TestDataProvider');
  }
  return context;
};

// Helper function to apply variance to a value
const applyVariance = (baseValue, variance, dynamicMode) => {
  if (!dynamicMode) return baseValue;
  const offset = (Math.random() - 0.5) * 2 * variance;
  return Math.max(0, baseValue + offset);
};

export const TestDataProvider = ({ children }) => {
  // Load base values from localStorage or use default
  const [baseValues, setBaseValues] = useState(() => {
    const stored = localStorage.getItem('test_base_values');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored base values:', e);
        return DEFAULT_MOCK_DATA.metrics;
      }
    }
    return DEFAULT_MOCK_DATA.metrics;
  });

  // Load config from localStorage or use default
  const [config, setConfig] = useState(() => {
    const stored = localStorage.getItem('test_config');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored config:', e);
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  // Dynamic data that updates periodically
  const [mockData, setMockData] = useState(() => {
    const metrics = {};
    Object.entries(baseValues).forEach(([key, data]) => {
      metrics[key] = {
        value: data.value,
        timestamp: new Date().toISOString()
      };
    });
    return { metrics, status: 'success' };
  });

  // Save base values to localStorage
  useEffect(() => {
    localStorage.setItem('test_base_values', JSON.stringify(baseValues));
  }, [baseValues]);

  // Save config to localStorage
  useEffect(() => {
    localStorage.setItem('test_config', JSON.stringify(config));
  }, [config]);

  // Update dynamic data with variance
  useEffect(() => {
    if (!config.dynamicMode) return;

    const interval = setInterval(() => {
      setMockData(prev => {
        const newMetrics = {};
        Object.entries(baseValues).forEach(([key, data]) => {
          const variance = config.variance[key] || 0;
          newMetrics[key] = {
            value: applyVariance(data.value, variance, config.dynamicMode),
            timestamp: new Date().toISOString()
          };
        });
        return { metrics: newMetrics, status: 'success' };
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [baseValues, config]);

  // Update a single metric base value
  const updateMetric = (metricName, value) => {
    setBaseValues(prev => ({
      ...prev,
      [metricName]: {
        value: parseFloat(value),
        timestamp: new Date().toISOString()
      }
    }));
  };

  // Update multiple metrics at once
  const updateMultipleMetrics = (updates) => {
    setBaseValues(prev => {
      const newMetrics = { ...prev };
      Object.entries(updates).forEach(([key, value]) => {
        newMetrics[key] = {
          value: parseFloat(value),
          timestamp: new Date().toISOString()
        };
      });
      return newMetrics;
    });
  };

  // Update variance for a metric
  const updateVariance = (metricName, variance) => {
    setConfig(prev => ({
      ...prev,
      variance: {
        ...prev.variance,
        [metricName]: parseFloat(variance)
      }
    }));
  };

  // Toggle dynamic mode
  const toggleDynamicMode = () => {
    setConfig(prev => ({
      ...prev,
      dynamicMode: !prev.dynamicMode
    }));
  };

  // Load preset scenario
  const loadPreset = (presetKey) => {
    const preset = PRESET_SCENARIOS[presetKey];
    if (!preset) return;

    const newMetrics = {};
    Object.entries(preset.values).forEach(([key, value]) => {
      newMetrics[key] = {
        value: parseFloat(value),
        timestamp: new Date().toISOString()
      };
    });
    setBaseValues(newMetrics);
  };

  // Reset to default values
  const resetToDefaults = () => {
    setBaseValues(DEFAULT_MOCK_DATA.metrics);
    setConfig(DEFAULT_CONFIG);
  };

  // Get current metric value (with variance applied)
  const getMetricValue = (metricName) => {
    return mockData.metrics[metricName]?.value;
  };

  // Get base metric value (without variance)
  const getBaseMetricValue = (metricName) => {
    return baseValues[metricName]?.value;
  };

  const value = {
    mockData,
    baseValues,
    config,
    updateMetric,
    updateMultipleMetrics,
    updateVariance,
    toggleDynamicMode,
    loadPreset,
    resetToDefaults,
    getMetricValue,
    getBaseMetricValue
  };

  return (
    <TestDataContext.Provider value={value}>
      {children}
    </TestDataContext.Provider>
  );
};
