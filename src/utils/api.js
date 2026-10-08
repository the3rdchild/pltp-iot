import axios from 'axios';
import defaultApiConfig from '../data/apiConfig.json';

// Get API config from localStorage or use default
const getApiConfig = () => {
  try {
    const saved = localStorage.getItem('apiConfig');
    return saved ? JSON.parse(saved) : defaultApiConfig;
  } catch (error) {
    console.error('Error loading API config from localStorage:', error);
    return defaultApiConfig;
  }
};

const apiConfig = getApiConfig();

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: 30000, // 30 seconds (increased for Honeywell API calls)
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor (for adding auth tokens)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (for error handling and expired token redirect)
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Token expired or invalid - force logout
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/test')) {
        window.location.href = '/login';
      }
    }
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
    const response = await apiClient.get(apiConfig.endpoints.dashboard.liveData, {
      params: { source: 'honeywell' }
    });
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
    const response = await getLiveData();
    return {
      success: true,
      data: response.data.metrics[metric]
    };
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
 * @param {string} range - time range (1h, 1d, 7d, 1m, all)
 * @param {string} [endTime] - optional ISO instant to anchor the bucket
 *        window to, instead of the server's own NOW(). Pass the SAME value
 *        for two metrics you intend to overlay on one chart (e.g. a sensor
 *        + its prediction) so both come back on identical bucket
 *        boundaries -- otherwise two separate requests each anchor
 *        independently, and at narrow bucket widths (short ranges) that
 *        drift is enough to visibly misalign the two series.
 */
export const getChartData = async (metric, range = '1d', endTime, startTime) => {
  try {
    const url = buildURL(apiConfig.endpoints.analytics.chartData, { metric });
    const response = await apiClient.get(url, {
      params: {
        range,
        ...(endTime ? { end_time: endTime } : {}),
        // Only meaningful with range='custom' (window = startTime..endTime)
        ...(startTime ? { start_time: startTime } : {})
      }
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

/**
 * Get aggregated daily statistics (min/max/avg/stddev per day)
 * @param {string} metric - metric name
 * @param {object} options - { start_date, end_date } as YYYY-MM-DD, both optional
 */
export const getAggregatedStats = async (metric, options = {}) => {
  try {
    const url = buildURL('/data/stats/{metric}/aggregated', { metric });
    const params = {};
    if (options.start_date) params.start_date = options.start_date;
    if (options.end_date) params.end_date = options.end_date;
    const response = await apiClient.get(url, { params });
    return response;
  } catch (error) {
    console.error(`Error fetching aggregated stats for ${metric}:`, error);
    throw error;
  }
};

// ==================== LAB SAMPLE APIs ====================

/**
 * Get stored lab samples
 * @param {object} params - { limit, offset, start_date, end_date }
 */
export const getLabSamples = async (params = {}) => {
  try {
    const response = await apiClient.get('/data/lab-samples', { params });
    return response;
  } catch (error) {
    console.error('Error fetching lab samples:', error);
    throw error;
  }
};

/**
 * Create or update one lab sample
 * @param {object} sample - { sampled_at, result_at?, pressure, temperature, flow_rate, tds, dryness, ncg, notes? }
 */
export const createLabSample = async (sample) => {
  try {
    const response = await apiClient.post('/data/lab-samples', sample);
    return response;
  } catch (error) {
    console.error('Error creating lab sample:', error);
    throw error;
  }
};

/**
 * Bulk import lab samples from a parsed CSV
 * @param {Array} rows - array of sample objects (same shape as createLabSample)
 * @param {string} sourceFile - original CSV filename
 */
export const importLabSamples = async (rows, sourceFile) => {
  try {
    const response = await apiClient.post('/data/lab-samples/import', {
      rows,
      source_file: sourceFile
    });
    return response;
  } catch (error) {
    console.error('Error importing lab samples:', error);
    throw error;
  }
};

/**
 * Delete one lab sample by id
 * @param {number|string} id
 */
export const deleteLabSample = async (id) => {
  try {
    const response = await apiClient.delete(`/data/lab-samples/${id}`);
    return response;
  } catch (error) {
    console.error(`Error deleting lab sample ${id}:`, error);
    throw error;
  }
};

/**
 * Get lab-vs-sensor comparison series for a metric
 * @param {string} metric - pressure|temperature|flow_rate|tds|dryness|ncg
 * @param {object} params - extra query params
 */
export const getLabComparison = async (metric, params = {}) => {
  try {
    const response = await apiClient.get('/data/lab-samples/comparison', {
      params: { metric, ...params }
    });
    return response;
  } catch (error) {
    console.error(`Error fetching lab comparison for ${metric}:`, error);
    throw error;
  }
};

/**
 * Ask the backend to pull the newest readings from Honeywell into sensor_data.
 *
 * Used as a fallback when a live window comes back empty. The endpoint is
 * throttled server-side and may answer `throttled: true` without contacting
 * PIMS — that is a normal outcome, not a failure.
 */
export const syncHoneywellLiveData = async () => {
  try {
    const response = await apiClient.post('/honeywell/sync-live');
    return response.data;
  } catch (error) {
    console.error('Error syncing Honeywell live data:', error);
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
 * Record a completed major overhaul/Turn Around -- resets the SoH anchor on
 * the failure-forecast chart (real, permanently-logged event, not
 * cosmetic). Admin-only on the backend (authenticateToken +
 * requireRole('admin')); see backend/controllers/externalController.js.
 *
 * @param {string} effectiveDate - 'YYYY-MM-DD', when the overhaul actually finished
 */
export const createFailureForecastOverhaulEvent = async (effectiveDate) => {
  try {
    const response = await apiClient.post('/external/failure-forecast/overhaul-reset', {
      effective_date: effectiveDate
    });
    return response;
  } catch (error) {
    console.error('Error recording overhaul event:', error);
    throw error;
  }
};

/**
 * Undo the most recently recorded active overhaul event (soft-delete only --
 * never removes the row). Admin-only on the backend, same as above.
 */
export const undoFailureForecastOverhaulEvent = async () => {
  try {
    const response = await apiClient.post('/external/failure-forecast/overhaul-undo');
    return response;
  } catch (error) {
    console.error('Error undoing overhaul event:', error);
    throw error;
  }
};

/**
 * Permanently remove an ALREADY-UNDONE overhaul event (test/mistaken-entry
 * cleanup). The backend refuses this for a still-active event (undo it
 * first) -- this call can fail with that 409 by design, not just on a
 * network error. Admin-only on the backend, same as above.
 *
 * @param {string} id
 */
export const deleteFailureForecastOverhaulEvent = async (id) => {
  try {
    const response = await apiClient.delete(`/external/failure-forecast/overhaul/${encodeURIComponent(id)}`);
    return response;
  } catch (error) {
    console.error('Error deleting overhaul event:', error);
    throw error;
  }
};

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

/**
 * Get configured refresh interval
 */
export const getRefreshInterval = () => {
  const currentConfig = getApiConfig();
  return currentConfig.refreshInterval || 3000;
};

// Export axios instance for advanced usage
export { apiClient };

// Default export
export default {
  getLiveData,
  getLiveMetric,
  getDashboardStats,
  getChartData,
  getStatsTable,
  getAggregatedStats,
  syncHoneywellLiveData,
  getLabSamples,
  createLabSample,
  importLabSamples,
  deleteLabSample,
  getLabComparison,
  getTDSPageData,
  getPressurePageData,
  getTemperaturePageData,
  getFlowPageData,
  createFailureForecastOverhaulEvent,
  undoFailureForecastOverhaulEvent,
  deleteFailureForecastOverhaulEvent,
  customAPICall,
  getAPIConfig,
  getAvailableMetrics,
  getAvailableRanges,
  getRefreshInterval,
  apiClient
};
