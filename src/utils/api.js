import axios from 'axios';
import apiConfig from '../data/apiConfig.json';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor (for adding auth tokens if needed)
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (for error handling)
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

/**
 * Replace URL parameters with actual values
 * Example: "/data/live/{metric}" + {metric: "tds"} => "/data/live/tds"
 */
const buildURL = (endpoint, params = {}) => {
  let url = endpoint;
  Object.keys(params).forEach((key) => {
    url = url.replace(`{${key}}`, params[key]);
  });
  return url;
};

// ==================== DASHBOARD APIs ====================

/**
 * Get all live data for dashboard
 */
export const getLiveData = async () => {
  try {
    const response = await apiClient.get(apiConfig.endpoints.dashboard.liveData);
    return response;
  } catch (error) {
    console.error('Error fetching live data:', error);
    throw error;
  }
};

/**
 * Get single live metric
 * @param {string} metric - metric name (tds, pressure, temperature, etc.)
 */
export const getLiveMetric = async (metric) => {
  try {
    const url = buildURL(apiConfig.endpoints.dashboard.liveMetric, { metric });
    const response = await apiClient.get(url);
    return response;
  } catch (error) {
    console.error(`Error fetching live metric ${metric}:`, error);
    throw error;
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get(apiConfig.endpoints.dashboard.stats);
    return response;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// ==================== CHART APIs ====================

/**
 * Get chart data for a metric
 * @param {string} metric - metric name
 * @param {string} range - time range (1h, 1d, 7d, 1m, 10y)
 */
export const getChartData = async (metric, range = '1d') => {
  try {
    const url = buildURL(apiConfig.endpoints.analytics.chartData, { metric });
    const response = await apiClient.get(url, {
      params: { range }
    });
    return response;
  } catch (error) {
    console.error(`Error fetching chart data for ${metric}:`, error);
    throw error;
  }
};

// ==================== STATISTICS TABLE APIs ====================

/**
 * Get statistics table data
 * @param {string} metric - metric name
 * @param {object} options - { limit, offset, start_date, end_date }
 */
export const getStatsTable = async (metric, options = {}) => {
  try {
    const url = buildURL(apiConfig.endpoints.analytics.statsTable, { metric });
    const { limit = 50, offset = 0, start_date, end_date } = options;

    const params = { limit, offset };
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;

    const response = await apiClient.get(url, { params });
    return response;
  } catch (error) {
    console.error(`Error fetching stats table for ${metric}:`, error);
    throw error;
  }
};

// ==================== PAGE-SPECIFIC APIs ====================

/**
 * Get TDS page data
 * @param {string} range - chart range
 * @param {object} statsOptions - stats table options
 */
export const getTDSPageData = async (range = '1d', statsOptions = {}) => {
  try {
    const [live, chart, stats] = await Promise.all([
      apiClient.get(apiConfig.endpoints.tds.live),
      apiClient.get(apiConfig.endpoints.tds.chart, { params: { range } }),
      apiClient.get(apiConfig.endpoints.tds.stats, { params: statsOptions })
    ]);

    return { live, chart, stats };
  } catch (error) {
    console.error('Error fetching TDS page data:', error);
    throw error;
  }
};

/**
 * Get Pressure page data
 */
export const getPressurePageData = async (range = '1d', statsOptions = {}) => {
  try {
    const [live, chart, stats] = await Promise.all([
      apiClient.get(apiConfig.endpoints.pressure.live),
      apiClient.get(apiConfig.endpoints.pressure.chart, { params: { range } }),
      apiClient.get(apiConfig.endpoints.pressure.stats, { params: statsOptions })
    ]);

    return { live, chart, stats };
  } catch (error) {
    console.error('Error fetching Pressure page data:', error);
    throw error;
  }
};

/**
 * Get Temperature page data
 */
export const getTemperaturePageData = async (range = '1d', statsOptions = {}) => {
  try {
    const [live, chart, stats] = await Promise.all([
      apiClient.get(apiConfig.endpoints.temperature.live),
      apiClient.get(apiConfig.endpoints.temperature.chart, { params: { range } }),
      apiClient.get(apiConfig.endpoints.temperature.stats, { params: statsOptions })
    ]);

    return { live, chart, stats };
  } catch (error) {
    console.error('Error fetching Temperature page data:', error);
    throw error;
  }
};

/**
 * Get Flow page data
 */
export const getFlowPageData = async (range = '1d', statsOptions = {}) => {
  try {
    const [live, chart, stats] = await Promise.all([
      apiClient.get(apiConfig.endpoints.flow.live),
      apiClient.get(apiConfig.endpoints.flow.chart, { params: { range } }),
      apiClient.get(apiConfig.endpoints.flow.stats, { params: statsOptions })
    ]);

    return { live, chart, stats };
  } catch (error) {
    console.error('Error fetching Flow page data:', error);
    throw error;
  }
};

// ==================== CUSTOM API BUILDER ====================

/**
 * Generic API call builder
 * Use this for custom endpoints not covered above
 *
 * @param {string} endpoint - API endpoint path
 * @param {object} params - URL parameters {metric: 'tds'}
 * @param {object} queryParams - Query string parameters {range: '1d'}
 * @returns {Promise} API response
 *
 * @example
 * // Get custom metric chart
 * const data = await customAPICall('/data/chart/{metric}', {metric: 'voltage'}, {range: '7d'});
 */
export const customAPICall = async (endpoint, params = {}, queryParams = {}) => {
  try {
    const url = buildURL(endpoint, params);
    const response = await apiClient.get(url, { params: queryParams });
    return response;
  } catch (error) {
    console.error(`Error calling custom API ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Get API configuration
 * Useful for dynamically building UIs based on available endpoints
 */
export const getAPIConfig = () => apiConfig;

/**
 * Get available metrics list
 */
export const getAvailableMetrics = () => apiConfig.metrics.dashboard;

/**
 * Get available time ranges
 */
export const getAvailableRanges = () => apiConfig.metrics.ranges;

// Export axios instance for advanced usage
export { apiClient };

// Default export
export default {
  getLiveData,
  getLiveMetric,
  getDashboardStats,
  getChartData,
  getStatsTable,
  getTDSPageData,
  getPressurePageData,
  getTemperaturePageData,
  getFlowPageData,
  customAPICall,
  getAPIConfig,
  getAvailableMetrics,
  getAvailableRanges,
  apiClient
};
