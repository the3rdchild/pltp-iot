import { useState, useEffect } from 'react';
import { getLiveData, getLiveMetric } from '../utils/api';

/**
 * Custom hook to fetch all live data for dashboard
 * Auto-refreshes every 3 seconds by default
 *
 * @param {number} refreshInterval - Refresh interval in milliseconds (default: 3000)
 * @returns {object} { data, loading, error, refresh }
 *
 * @example
 * const { data, loading, error } = useLiveData();
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * return <div>TDS: {data.metrics.tds.value}</div>;
 */
export const useLiveData = (refreshInterval = 3000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getLiveData();
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('Error fetching live data:', err);
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
  }, [refreshInterval]);

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
