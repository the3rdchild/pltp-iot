import { useState, useEffect, useCallback } from 'react';
import { getLiveMetric, getChartData, getStatsTable } from '../utils/api';

/**
 * Custom hook for analytics page data (TDS, Pressure, Temperature, Flow)
 * Fetches live value, chart data, and statistics table
 *
 * @param {string} metric - Metric name (tds, pressure, temperature, flow_rate)
 * @param {string} chartRange - Chart time range (1h, 1d, 7d, 1m, all)
 * @param {object} tableOptions - Table options {limit, offset}
 * @param {number} refreshInterval - Refresh interval in ms (default: 3000)
 * @param {object} include - Which of the three payloads to actually fetch.
 *        Every one of them is re-requested on each refresh tick, so a caller
 *        that only reads `liveData` (e.g. the TDS page, whose chart fetches its
 *        own data) would otherwise re-run a full chart aggregation and a
 *        `COUNT(*)` over sensor_data every 3 seconds and discard both results.
 * @returns {object} { liveData, chartData, tableData, loading, error, refetch }
 *
 * @example
 * const { liveData, chartData, tableData, loading } = useAnalyticsData('tds', '1d', { limit: 10 });
 * // live value only -- no chart/table round-trips:
 * const { liveData } = useAnalyticsData('tds', '1d', undefined, 3000, { chart: false, table: false });
 */
export const useAnalyticsData = (
  metric,
  chartRange = '1d',
  tableOptions = { limit: 10, offset: 0 },
  refreshInterval = 3000,
  include = { live: true, chart: true, table: true }
) => {
  const [liveData, setLiveData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Read off `include` here rather than inside the callback so the memo can
  // depend on plain booleans instead of a fresh object literal each render.
  const wantLive = include?.live !== false;
  const wantChart = include?.chart !== false;
  const wantTable = include?.table !== false;

  const fetchAllData = useCallback(async () => {
    if (!metric) return;

    try {
      // Only show loading on first load
      if (isFirstLoad) {
        setLoading(true);
      }

      // Fetch the requested payloads in parallel
      const [liveResponse, chartResponse, tableResponse] = await Promise.all([
        wantLive ? getLiveMetric(metric) : null,
        wantChart ? getChartData(metric, chartRange) : null,
        wantTable ? getStatsTable(metric, tableOptions) : null
      ]);

      if (liveResponse) setLiveData(liveResponse.data);
      if (chartResponse) setChartData(chartResponse.data);
      if (tableResponse) setTableData(tableResponse.data);
      setError(null);

      if (isFirstLoad) {
        setIsFirstLoad(false);
      }
    } catch (err) {
      setError(err);
      console.error(`Error fetching analytics data for ${metric}:`, err);
    } finally {
      if (isFirstLoad) {
        setLoading(false);
      }
    }
  }, [metric, chartRange, JSON.stringify(tableOptions), isFirstLoad, wantLive, wantChart, wantTable]);

  useEffect(() => {
    fetchAllData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchAllData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchAllData, refreshInterval]);

  return {
    liveData,
    chartData,
    tableData,
    loading,
    error,
    refetch: fetchAllData
  };
};

/**
 * Custom hook for multi-metric analytics (PTF page)
 * Fetches data for multiple metrics simultaneously
 *
 * @param {Array<string>} metrics - Array of metric names
 * @param {string} chartRange - Chart time range
 * @param {number} refreshInterval - Refresh interval in ms
 * @returns {object} { metricsData, loading, error, refetch }
 *
 * @example
 * const { metricsData, loading } = useMultiMetricData(['pressure', 'temperature', 'flow_rate'], '1d');
 * // metricsData = { pressure: {...}, temperature: {...}, flow_rate: {...} }
 */
export const useMultiMetricData = (
  metrics = [],
  chartRange = '1d',
  refreshInterval = 3000
) => {
  const [metricsData, setMetricsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const fetchMultiMetricData = useCallback(async () => {
    if (metrics.length === 0) return;

    try {
      if (isFirstLoad) {
        setLoading(true);
      }

      // Fetch all metrics in parallel
      const promises = metrics.map(async (metric) => {
        const [liveResponse, chartResponse] = await Promise.all([
          getLiveMetric(metric),
          getChartData(metric, chartRange)
        ]);

        return {
          metric,
          live: liveResponse.data,
          chart: chartResponse.data
        };
      });

      const results = await Promise.all(promises);

      // Transform to object keyed by metric name
      const data = {};
      results.forEach(result => {
        data[result.metric] = {
          live: result.live,
          chart: result.chart
        };
      });

      setMetricsData(data);
      setError(null);

      if (isFirstLoad) {
        setIsFirstLoad(false);
      }
    } catch (err) {
      setError(err);
      console.error('Error fetching multi-metric data:', err);
    } finally {
      if (isFirstLoad) {
        setLoading(false);
      }
    }
  }, [JSON.stringify(metrics), chartRange, isFirstLoad]);

  useEffect(() => {
    fetchMultiMetricData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchMultiMetricData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchMultiMetricData, refreshInterval]);

  return {
    metricsData,
    loading,
    error,
    refetch: fetchMultiMetricData
  };
};

/**
 * Custom hook for chart data only (lighter weight)
 *
 * @param {string} metric - Metric name
 * @param {string} range - Time range
 * @param {number} refreshInterval - Refresh interval in ms (0 = no auto-refresh)
 * @returns {object} { data, loading, error, refetch }
 */
export const useChartData = (metric, range = '1d', refreshInterval = 0) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!metric) return;

    try {
      setLoading(true);
      const response = await getChartData(metric, range);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error(`Error fetching chart data for ${metric}:`, err);
    } finally {
      setLoading(false);
    }
  }, [metric, range]);

  useEffect(() => {
    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Custom hook for stats table only
 *
 * @param {string} metric - Metric name
 * @param {object} options - Table options {limit, offset, start_date, end_date}
 * @returns {object} { data, loading, error, refetch }
 */
export const useStatsTable = (metric, options = { limit: 10, offset: 0 }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!metric) return;

    try {
      setLoading(true);
      const response = await getStatsTable(metric, options);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error(`Error fetching stats table for ${metric}:`, err);
    } finally {
      setLoading(false);
    }
  }, [metric, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useAnalyticsData;
