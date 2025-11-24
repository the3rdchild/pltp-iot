const fs = require('fs');
const path = require('path');

// Path to frontend Limit.json
const LIMITS_PATH = path.join(__dirname, '../../src/data/Limit.json');

/**
 * Load limits from frontend Limit.json
 * @returns {Object} limits configuration
 */
const loadLimits = () => {
  try {
    const data = fs.readFileSync(LIMITS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading limits:', error);
    return {};
  }
};

/**
 * Map metric names to Limit.json keys
 */
const METRIC_TO_LIMIT_KEY = {
  tds: 'TDS: Overall',
  pressure: 'pressure',
  temperature: 'temperature',
  flow_rate: 'flow',
  flow: 'flow',
  gen_output: 'gen_output',
  active_power: 'gen_output',
  voltage: 'voltage',
  gen_reactive_power: 'reactive_power',
  reactive_power: 'reactive_power',
  speed_detection: 'speed_detection',
  speed: 'speed_detection',
  current: 'current'
};

/**
 * Default limits for metrics not in Limit.json
 * These can be updated via frontend later
 */
const DEFAULT_LIMITS = {
  gen_output: {
    value: 'gen_output',
    min: 0,
    max: 50000,
    unit: 'W',
    abnormalLow: 100,
    warningLow: 500,
    idealLow: 1000,
    idealHigh: 40000,
    warningHigh: 45000,
    abnormalHigh: 50000
  },
  voltage: {
    value: 'voltage',
    min: 0,
    max: 500,
    unit: 'V',
    abnormalLow: 180,
    warningLow: 200,
    idealLow: 380,
    idealHigh: 420,
    warningHigh: 440,
    abnormalHigh: 460
  },
  reactive_power: {
    value: 'reactive_power',
    min: 0,
    max: 20000,
    unit: 'VAR',
    idealHigh: 5000,
    warningHigh: 10000,
    abnormalHigh: 15000
  },
  speed_detection: {
    value: 'speed_detection',
    min: 0,
    max: 5000,
    unit: 'RPM',
    abnormalLow: 500,
    warningLow: 1000,
    idealLow: 2500,
    idealHigh: 3500,
    warningHigh: 4000,
    abnormalHigh: 4500
  },
  current: {
    value: 'current',
    min: 0,
    max: 200,
    unit: 'A',
    idealHigh: 50,
    warningHigh: 100,
    abnormalHigh: 150
  }
};

/**
 * Get limit configuration for a specific metric
 * @param {string} metric - metric name
 * @returns {Object|null} limit configuration
 */
const getLimitForMetric = (metric) => {
  const limits = loadLimits();
  const limitKey = METRIC_TO_LIMIT_KEY[metric] || metric;

  // Check if exists in Limit.json
  if (limits[limitKey]) {
    return limits[limitKey];
  }

  // Check default limits
  if (DEFAULT_LIMITS[limitKey]) {
    return DEFAULT_LIMITS[limitKey];
  }

  return null;
};

/**
 * Check anomaly status based on value and limits
 * @param {number} value - the value to check
 * @param {Object} limit - limit configuration object
 * @returns {Object} { status: 'normal'|'warning'|'abnormal'|'ideal', details: string }
 */
const checkAnomalyStatus = (value, limit) => {
  if (value === null || value === undefined || limit === null) {
    return { status: null, details: 'No data or limit available' };
  }

  // Check abnormal low (if exists)
  if (limit.abnormalLow !== undefined && value < limit.abnormalLow) {
    return {
      status: 'abnormal',
      details: `Value ${value} is below abnormal low threshold (${limit.abnormalLow})`
    };
  }

  // Check warning low (if exists)
  if (limit.warningLow !== undefined && value < limit.warningLow) {
    return {
      status: 'warning',
      details: `Value ${value} is below warning low threshold (${limit.warningLow})`
    };
  }

  // Check abnormal high (if exists)
  if (limit.abnormalHigh !== undefined && value > limit.abnormalHigh) {
    return {
      status: 'abnormal',
      details: `Value ${value} is above abnormal high threshold (${limit.abnormalHigh})`
    };
  }

  // Check warning high (if exists)
  if (limit.warningHigh !== undefined && value > limit.warningHigh) {
    return {
      status: 'warning',
      details: `Value ${value} is above warning high threshold (${limit.warningHigh})`
    };
  }

  // Check if in ideal range
  const idealLow = limit.idealLow !== undefined ? limit.idealLow : limit.min;
  const idealHigh = limit.idealHigh !== undefined ? limit.idealHigh : limit.max;

  if (value >= idealLow && value <= idealHigh) {
    return { status: 'ideal', details: 'Value is within ideal range' };
  }

  return { status: 'normal', details: 'Value is within normal range' };
};

/**
 * Get anomaly status for a specific metric value
 * @param {string} metric - metric name
 * @param {number} value - the value to check
 * @returns {Object} { status, details, limit }
 */
const getMetricAnomalyStatus = (metric, value) => {
  const limit = getLimitForMetric(metric);
  const anomaly = checkAnomalyStatus(value, limit);

  return {
    ...anomaly,
    limit: limit ? {
      min: limit.min,
      max: limit.max,
      unit: limit.unit,
      warningLow: limit.warningLow,
      warningHigh: limit.warningHigh,
      abnormalLow: limit.abnormalLow,
      abnormalHigh: limit.abnormalHigh
    } : null
  };
};

module.exports = {
  loadLimits,
  getLimitForMetric,
  checkAnomalyStatus,
  getMetricAnomalyStatus,
  DEFAULT_LIMITS,
  METRIC_TO_LIMIT_KEY
};
