/**
 * Calculate generator current from sensor data
 * Simplified version for three-phase system
 *
 * @param {Object} data - sensor data object
 * @returns {Object} { current, apparent_power, method, error }
 */
const calculateGeneratorCurrent = (data) => {
  // Get active power (gen_output)
  const P_raw = data.gen_output;
  if (P_raw === null || P_raw === undefined) {
    return { current: null, error: 'gen_output missing' };
  }

  // Auto-detect unit: if < 1000, assume kW, else W
  const P = Math.abs(P_raw) < 1000 ? P_raw * 1000 : P_raw;

  // Get voltages (line-to-line)
  const v_VW = typeof data.gen_voltage_v_w === 'number' ? data.gen_voltage_v_w : null;
  const v_WU = typeof data.gen_voltage_w_u === 'number' ? data.gen_voltage_w_u : null;

  // Calculate average voltage
  const voltages = [v_VW, v_WU].filter(v => typeof v === 'number');
  if (voltages.length === 0) {
    return { current: null, error: 'No voltage data available' };
  }
  const Vll = voltages.reduce((sum, v) => sum + v, 0) / voltages.length;

  // Get power factor and reactive power
  const PF = typeof data.gen_power_factor === 'number' ? data.gen_power_factor : null;
  const Q = typeof data.gen_reactive_power === 'number' ? data.gen_reactive_power : null;

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

  // Calculate average voltage
  const v_VW = data.gen_voltage_v_w;
  const v_WU = data.gen_voltage_w_u;
  const voltages = [v_VW, v_WU].filter(v => typeof v === 'number');
  const voltage_avg = voltages.length > 0
    ? parseFloat((voltages.reduce((s, v) => s + v, 0) / voltages.length).toFixed(2))
    : null;

  return {
    ...data,
    // Add calculated fields
    current: currentCalc.current,
    voltage: voltage_avg,
    active_power: data.gen_output,
    speed: data.speed_detection
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
