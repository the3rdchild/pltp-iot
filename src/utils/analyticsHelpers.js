/**
 * Analytics Helper Functions
 * Transform API data to component-compatible formats
 */

/**
 * Transform API chart data to RealTimeDataChart format
 * @param {Array} apiChartData - API response chart array
 * @returns {Array} Transformed data for chart component
 */
export const transformChartData = (apiChartData) => {
  if (!apiChartData || !Array.isArray(apiChartData)) return [];

  return apiChartData.map(point => ({
    timestamp: new Date(point.timestamp).getTime(),
    value: point.avg, // Use average for main line
    min: point.min,
    max: point.max,
    dataPoints: point.data_points
  }));
};

/**
 * Transform API stats table data to StatisticsTable format
 * @param {Object} apiTableData - API response table data
 * @returns {Array} Transformed data for table component
 */
export const transformTableData = (apiTableData) => {
  if (!apiTableData?.records) return [];

  return apiTableData.records.map((record, index) => ({
    no: (apiTableData.pagination?.offset || 0) + index + 1,
    date: new Date(record.timestamp).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }),
    time: new Date(record.timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    value: record.value,
    status: record.status,
    // For now, use single value for min/max/avg
    // TODO: Calculate from grouped data if available
    minValue: record.value,
    maxValue: record.value,
    average: record.value,
    stdDev: 0
  }));
};

/**
 * Calculate summary statistics from table data
 * @param {Object} apiTableData - API response table data
 * @returns {Object} Summary stats {min, max, avg, count}
 */
export const getSummaryStats = (apiTableData) => {
  if (!apiTableData?.summary) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      count: 0
    };
  }

  return {
    min: apiTableData.summary.min,
    max: apiTableData.summary.max,
    avg: apiTableData.summary.avg,
    count: apiTableData.summary.count
  };
};

/**
 * Format value with unit
 * @param {number} value - Numeric value
 * @param {string} unit - Unit string (ppm, kPa, °C, t/h)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string
 */
export const formatValueWithUnit = (value, unit = '', decimals = 2) => {
  if (value === null || value === undefined) return '-';
  return `${parseFloat(value).toFixed(decimals)}${unit}`;
};

/**
 * Get anomaly count from API data (placeholder for now)
 * @param {Array} records - Table records
 * @returns {Object} Anomaly counts by time period
 */
export const getAnomalyCount = (records) => {
  if (!records || !Array.isArray(records)) {
    return {
      last12h: 0,
      last24h: 0,
      last7d: 0
    };
  }

  const now = new Date();
  const count12h = records.filter(r => {
    const diff = now - new Date(r.timestamp);
    return diff <= 12 * 60 * 60 * 1000 && (r.status === 'warning' || r.status === 'abnormal');
  }).length;

  const count24h = records.filter(r => {
    const diff = now - new Date(r.timestamp);
    return diff <= 24 * 60 * 60 * 1000 && (r.status === 'warning' || r.status === 'abnormal');
  }).length;

  const count7d = records.filter(r => {
    const diff = now - new Date(r.timestamp);
    return diff <= 7 * 24 * 60 * 60 * 1000 && (r.status === 'warning' || r.status === 'abnormal');
  }).length;

  return {
    last12h: count12h,
    last24h: count24h,
    last7d: count7d
  };
};

/**
 * Calculate percentage change
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Percentage change
 */
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0 || previous === null || previous === undefined) return 0;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
};

/**
 * Get status color based on anomaly status
 * @param {string} status - Status string (ideal, normal, warning, abnormal)
 * @returns {string} Color code
 */
export const getStatusColor = (status) => {
  const colors = {
    ideal: '#22c55e',
    normal: '#3b82f6',
    warning: '#f59e0b',
    abnormal: '#ef4444'
  };
  return colors[status] || colors.normal;
};

/**
 * Transform multi-metric data for PTF chart
 * @param {Object} metricsData - Data for multiple metrics
 * @returns {Object} Transformed data for PTF chart
 */
export const transformPTFChartData = (metricsData) => {
  const pressure = transformChartData(metricsData?.pressure?.chart?.chart || []);
  const temperature = transformChartData(metricsData?.temperature?.chart?.chart || []);
  const flow = transformChartData(metricsData?.flow_rate?.chart?.chart || []);

  return {
    pressure,
    temperature,
    flow
  };
};

export default {
  transformChartData,
  transformTableData,
  getSummaryStats,
  formatValueWithUnit,
  getAnomalyCount,
  calculatePercentageChange,
  getStatusColor,
  transformPTFChartData
};
