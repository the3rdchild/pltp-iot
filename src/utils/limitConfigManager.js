/**
 * Utility to manage Limit.json updates from Chart Reference Configuration
 *
 * This syncs chart reference lines (Min/Max/Avg) with anomaly detection thresholds
 */

import { getLimitData } from './limitData';

const LIMIT_DATA_KEY = 'limitData';

/**
 * Get current limit data (from localStorage or default)
 */
export const getLimitDataFromStorage = () => {
  try {
    return getLimitData();
  } catch (error) {
    console.error('Error loading limit data:', error);
    return {};
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
 * - config.min → lowerLimit
 * - config.max → upperLimit
 * - config.avg → not stored; it is only a reference line on the chart
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
      updatedLimitData[limitKey] = {
        ...updatedLimitData[limitKey],
        lowerLimit: parseFloat(config.min.toFixed(3)),
        upperLimit: parseFloat(config.max.toFixed(3))
      };
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
      updates[limitKey] = {
        lowerLimit: parseFloat(config.min.toFixed(3)),
        upperLimit: parseFloat(config.max.toFixed(3))
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
