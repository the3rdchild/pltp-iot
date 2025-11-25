/**
 * Convert database string/number to float
 * PostgreSQL returns numeric values as strings
 */
const toNumber = (value) => {
  if (value === null || value === undefined) return null;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? null : num;
};

/**
 * Calculate generator current from sensor data
 * Simplified version for three-phase system
 *
 * @param {Object} data - sensor data object
 * @returns {Object} { current, apparent_power, method, error }
 */
const calculateGeneratorCurrent = (data) => {
  // Get active power (gen_output) and convert to number
  const P_raw = toNumber(data.gen_output);
  if (P_raw === null || P_raw === undefined) {
    return { current: null, error: 'gen_output missing' };
  }

  // Auto-detect unit: if < 1000, assume kW, else W
  const P = Math.abs(P_raw) < 1000 ? P_raw * 1000 : P_raw;

  // Get voltages (line-to-line) and convert to numbers
  const v_VW = toNumber(data.gen_voltage_v_w);
  const v_WU = toNumber(data.gen_voltage_w_u);

  // Calculate average voltage
  const voltages = [v_VW, v_WU].filter(v => v !== null);
  if (voltages.length === 0) {
    return { current: null, error: 'No voltage data available' };
  }
  const Vll = voltages.reduce((sum, v) => sum + v, 0) / voltages.length;

  // Get power factor and reactive power, convert to numbers
  const PF = toNumber(data.gen_power_factor);
  const Q = toNumber(data.gen_reactive_power);

  // Calculate apparent power (S)
  let S;
  let usedPF = PF;

  if (PF !== null && PF !== 0) {
    S = Math.abs(P) / Math.abs(PF);
  } else if (Q !== null) {
    S = Math.sqrt(Math.pow(P, 2) + Math.pow(Q, 2));
    usedPF = S !== 0 ? Math.abs(P) / S : 1;
  } else {
    // Assume PF = 1 (purely real power)
    usedPF = 1;
    S = Math.abs(P);
  }

  // Calculate current: I = S / (√3 * V_LL) for three-phase
  const current = S / (Math.sqrt(3) * Math.abs(Vll));

  return {
    current: parseFloat(current.toFixed(2)),
    apparent_power: parseFloat(S.toFixed(2)),
    power_factor: usedPF,
    voltage_avg: parseFloat(Vll.toFixed(2)),
    method: 'three-phase (I = S / (√3 * V_LL))'
  };
};

/**
 * Process raw sensor data and add calculated fields
 *
 * @param {Object} data - raw sensor data from database
 * @returns {Object} processed data with calculated fields
 */
const processSensorData = (data) => {
  if (!data) return null;

  // Calculate current
  const currentCalc = calculateGeneratorCurrent(data);

  // Calculate average voltage (convert to numbers)
  const v_VW = toNumber(data.gen_voltage_v_w);
  const v_WU = toNumber(data.gen_voltage_w_u);
  const voltages = [v_VW, v_WU].filter(v => v !== null);
  const voltage_avg = voltages.length > 0
    ? parseFloat((voltages.reduce((s, v) => s + v, 0) / voltages.length).toFixed(2))
    : null;

  return {
    ...data,
    // Add calculated fields (all as numbers)
    current: currentCalc.current,
    voltage: voltage_avg,
    active_power: toNumber(data.gen_output),
    speed: toNumber(data.speed_detection),
    // Convert all numeric fields to actual numbers
    temperature: toNumber(data.temperature),
    pressure: toNumber(data.pressure),
    flow_rate: toNumber(data.flow_rate),
    tds: toNumber(data.tds),
    gen_reactive_power: toNumber(data.gen_reactive_power),
    gen_output: toNumber(data.gen_output),
    gen_power_factor: toNumber(data.gen_power_factor),
    gen_frequency: toNumber(data.gen_frequency),
    speed_detection: toNumber(data.speed_detection)
  };
};

/**
 * Extract specific metric value from processed sensor data
 *
 * @param {Object} data - processed sensor data
 * @param {string} metric - metric name
 * @returns {number|null} metric value
 */
const getMetricValue = (data, metric) => {
  const metricMap = {
    tds: data.tds,
    pressure: data.pressure,
    temperature: data.temperature,
    flow_rate: data.flow_rate,
    flow: data.flow_rate,
    gen_output: data.gen_output,
    active_power: data.gen_output,
    voltage: data.voltage,
    gen_voltage_v_w: data.gen_voltage_v_w,
    gen_voltage_w_u: data.gen_voltage_w_u,
    gen_reactive_power: data.gen_reactive_power,
    reactive_power: data.gen_reactive_power,
    gen_power_factor: data.gen_power_factor,
    gen_frequency: data.gen_frequency,
    speed_detection: data.speed_detection,
    speed: data.speed_detection,
    current: data.current,
    mcv_l: data.mcv_l,
    mcv_r: data.mcv_r
  };

  return metricMap[metric] !== undefined ? metricMap[metric] : null;
};

/**
 * Get the database column name for a metric
 *
 * @param {string} metric - metric name
 * @returns {string} database column name
 */
const getDbColumnForMetric = (metric) => {
  const columnMap = {
    tds: 'tds',
    pressure: 'pressure',
    temperature: 'temperature',
    flow_rate: 'flow_rate',
    flow: 'flow_rate',
    gen_output: 'gen_output',
    active_power: 'gen_output',
    gen_voltage_v_w: 'gen_voltage_v_w',
    gen_voltage_w_u: 'gen_voltage_w_u',
    gen_reactive_power: 'gen_reactive_power',
    reactive_power: 'gen_reactive_power',
    gen_power_factor: 'gen_power_factor',
    gen_frequency: 'gen_frequency',
    speed_detection: 'speed_detection',
    speed: 'speed_detection',
    mcv_l: 'mcv_l',
    mcv_r: 'mcv_r'
  };

  return columnMap[metric] || metric;
};

module.exports = {
  calculateGeneratorCurrent,
  processSensorData,
  getMetricValue,
  getDbColumnForMetric
};
