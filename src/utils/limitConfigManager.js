/**
 * Utility to manage Limit.json updates from Chart Reference Configuration
 *
 * This syncs chart reference lines (Min/Max/Avg) with anomaly detection thresholds
 */

import initialLimitData from '../data/Limit.json';

const LIMIT_DATA_KEY = 'limitData';

/**
 * Get current limit data (from localStorage or default)
 */
export const getLimitDataFromStorage = () => {
  try {
    const stored = localStorage.getItem(LIMIT_DATA_KEY);
    return stored ? JSON.parse(stored) : initialLimitData;
  } catch (error) {
    console.error('Error loading limit data:', error);
    return initialLimitData;
  }
};

/**
 * Save limit data to localStorage
 */
export const saveLimitDataToStorage = (limitData) => {
  try {
    localStorage.setItem(LIMIT_DATA_KEY, JSON.stringify(limitData));
    return true;
  } catch (error) {
    console.error('Error saving limit data:', error);
    return false;
  }
};

/**
 * Update Limit.json with new chart reference values
 *
 * Mapping:
 * - config.min → abnormalLow
 * - config.max → abnormalHigh
 * - config.avg → idealLow and idealHigh (creates small range around avg)
 */
export const updateLimitDataFromChartConfig = (chartRefConfig) => {
  const currentLimitData = getLimitDataFromStorage();
  const updatedLimitData = { ...currentLimitData };

  // Metric key mapping (chartRef key → Limit.json key)
  const metricKeyMap = {
    'pressure': 'pressure',
    'temperature': 'temperature',
    'flow_rate': 'flow',
    'ncg': 'ncg',
    'dryness': 'dryness',
    'tds': 'TDS: Overall'
  };

  Object.keys(chartRefConfig).forEach(chartKey => {
    const config = chartRefConfig[chartKey];
    const limitKey = metricKeyMap[chartKey];

    if (!limitKey || !updatedLimitData[limitKey]) {
      console.warn(`Limit key not found for ${chartKey}`);
      return;
    }

    // Only update if manual mode is enabled
    if (config.enabled) {
      // Calculate ideal range (small range around average)
      // For most metrics, use ±0.5 from average
      // For dryness (%), use ±0.2
      const idealRange = chartKey === 'dryness' ? 0.2 : 0.5;

      updatedLimitData[limitKey] = {
        ...updatedLimitData[limitKey],
        abnormalLow: parseFloat(config.min.toFixed(3)),
        abnormalHigh: parseFloat(config.max.toFixed(3)),
        idealLow: parseFloat((config.avg - idealRange).toFixed(3)),
        idealHigh: parseFloat((config.avg + idealRange).toFixed(3))
      };

      console.log(`Updated ${limitKey} thresholds from chart config:`, {
        abnormalLow: config.min,
        abnormalHigh: config.max,
        idealLow: config.avg - idealRange,
        idealHigh: config.avg + idealRange
      });
    }
  });

  // Save updated limit data
  saveLimitDataToStorage(updatedLimitData);

  return updatedLimitData;
};

/**
 * For production: Prepare API payload to update Limit.json on backend
 */
export const prepareLimitUpdatePayload = (chartRefConfig) => {
  const metricKeyMap = {
    'pressure': 'pressure',
    'temperature': 'temperature',
    'flow_rate': 'flow',
    'ncg': 'ncg',
    'dryness': 'dryness',
    'tds': 'TDS: Overall'
  };

  const updates = {};

  Object.keys(chartRefConfig).forEach(chartKey => {
    const config = chartRefConfig[chartKey];
    const limitKey = metricKeyMap[chartKey];

    if (config.enabled && limitKey) {
      const idealRange = chartKey === 'dryness' ? 0.2 : 0.5;

      updates[limitKey] = {
        abnormalLow: parseFloat(config.min.toFixed(3)),
        abnormalHigh: parseFloat(config.max.toFixed(3)),
        idealLow: parseFloat((config.avg - idealRange).toFixed(3)),
        idealHigh: parseFloat((config.avg + idealRange).toFixed(3))
      };
    }
  });

  return updates;
};

export default {
  getLimitDataFromStorage,
  saveLimitDataToStorage,
  updateLimitDataFromChartConfig,
  prepareLimitUpdatePayload
};
