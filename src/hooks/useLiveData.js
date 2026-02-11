import { useState, useEffect, useCallback } from 'react';
import { getLiveData, getLiveMetric, getRefreshInterval } from '../utils/api';

/**
 * Custom hook to fetch all live data for dashboard
 * Auto-refreshes based on configured interval (default: 3000ms)
 *
 * @param {number} refreshInterval - Refresh interval in milliseconds (default: from config or 3000)
 * @returns {object} { data, loading, error, refresh }
 *
 * @example
 * const { data, loading, error } = useLiveData();
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * return <div>TDS: {data.metrics.tds.value}</div>;
 */
export const useLiveData = (refreshInterval = null) => {
  // Use configured refresh interval if not explicitly provided
  const configuredInterval = getRefreshInterval();
  const actualInterval = refreshInterval !== null ? refreshInterval : configuredInterval;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Warn if interval is below recommended minimum
  useEffect(() => {
    if (actualInterval < 3000) {
      console.warn(
        `⚠️ Refresh interval (${actualInterval}ms) is below the recommended minimum of 3000ms. ` +
        `This may cause excessive API calls and potential rate limiting from Honeywell API.`
      );
    }
  }, [actualInterval]);

  const fetchData = useCallback(async () => {
    try {
      // Only show loading on first load, not on refresh
      if (isFirstLoad) {
        setLoading(true);
      }
      const response = await getLiveData();
      setData(response.data);
      setError(null);
      if (isFirstLoad) {
        setIsFirstLoad(false);
      }
    } catch (err) {
      setError(err);
      console.error('Error fetching live data:', err);
    } finally {
      if (isFirstLoad) {
        setLoading(false);
      }
    }
  }, [isFirstLoad]);

  useEffect(() => {
    fetchData();

    if (actualInterval > 0) {
      const interval = setInterval(fetchData, actualInterval);
      return () => clearInterval(interval);
    }
  }, [actualInterval, fetchData]);

  return {
    data,
    loading,
    error,
    refresh: fetchData
  };
};

/**
 * Custom hook to fetch single metric live data
 *
 * @param {string} metric - Metric name (tds, pressure, etc.)
 * @param {number} refreshInterval - Refresh interval in milliseconds (default: 3000)
 * @returns {object} { data, loading, error, refresh }
 *
 * @example
 * const { data, loading, error } = useLiveMetric('tds');
 */
export const useLiveMetric = (metric, refreshInterval = 3000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!metric) return;

    try {
      setLoading(true);
      const response = await getLiveMetric(metric);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error(`Error fetching live metric ${metric}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [metric, refreshInterval]);

  return {
    data,
    loading,
    error,
    refresh: fetchData
  };
};

export default useLiveData;
