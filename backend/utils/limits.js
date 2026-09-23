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
  current: 'current',
  dryness: 'dryness',
  ncg: 'ncg'
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
    lowerLimit: 500,
    upperLimit: 45000
  },
  voltage: {
    value: 'voltage',
    min: 0,
    max: 500,
    unit: 'V',
    lowerLimit: 200,
    upperLimit: 440
  },
  reactive_power: {
    value: 'reactive_power',
    min: 0,
    max: 20000,
    unit: 'VAR',
    lowerLimit: 0,
    upperLimit: 10000
  },
  speed_detection: {
    value: 'speed_detection',
    min: 0,
    max: 5000,
    unit: 'RPM',
    lowerLimit: 1000,
    upperLimit: 4000
  },
  current: {
    value: 'current',
    min: 0,
    max: 200,
    unit: 'A',
    lowerLimit: 0,
    upperLimit: 100
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

// Zones derived from lowerLimit/upperLimit. CommonJS twin of
// src/utils/limitZones.js -- keep the two in step.
//
//   min ── abnormal ── redLow ── warning ── lowerLimit ── normal ── upperLimit ── warning ── redHigh ── abnormal ── max
//
// redLow is halfway between min and lowerLimit (redHigh likewise). A limit at
// or beyond the scale edge switches that side off.
const isNum = (v) => typeof v === 'number' && !Number.isNaN(v);

const getLimitZones = (limit) => {
  if (!limit || !isNum(limit.min) || !isNum(limit.max)) return null;
  const { min, max } = limit;
  const lower = isNum(limit.lowerLimit) ? limit.lowerLimit : min;
  const upper = isNum(limit.upperLimit) ? limit.upperLimit : max;
  const hasLow = lower > min;
  const hasHigh = upper < max;
  return {
    min,
    max,
    lower,
    upper,
    hasLow,
    hasHigh,
    redLow: hasLow ? lower - (lower - min) / 2 : null,
    redHigh: hasHigh ? upper + (max - upper) / 2 : null
  };
};

/**
 * Check anomaly status based on value and limits
 * @param {number} value - the value to check
 * @param {Object} limit - limit configuration object
 * @returns {Object} { status: 'normal'|'warning'|'abnormal', details: string }
 */
const checkAnomalyStatus = (value, limit) => {
  const z = getLimitZones(limit);
  if (value === null || value === undefined || !z) {
    return { status: null, details: 'No data or limit available' };
  }

  if (z.hasLow && value < z.lower) {
    return value < z.redLow
      ? { status: 'abnormal', details: `Value ${value} is far below lower limit (${z.lower})` }
      : { status: 'warning', details: `Value ${value} is below lower limit (${z.lower})` };
  }

  if (z.hasHigh && value > z.upper) {
    return value > z.redHigh
      ? { status: 'abnormal', details: `Value ${value} is far above upper limit (${z.upper})` }
      : { status: 'warning', details: `Value ${value} is above upper limit (${z.upper})` };
  }

  return { status: 'normal', details: 'Value is within limits' };
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
      lowerLimit: limit.lowerLimit,
      upperLimit: limit.upperLimit
    } : null
  };
};

module.exports = {
  loadLimits,
  getLimitForMetric,
  getLimitZones,
  checkAnomalyStatus,
  getMetricAnomalyStatus,
  DEFAULT_LIMITS,
  METRIC_TO_LIMIT_KEY
};
