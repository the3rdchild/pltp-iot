import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getAggregatedStats } from '../utils/api';

/**
 * Hook to fetch aggregated statistics table data from API (production mode)
 * Returns daily aggregated rows: { no, date, minValue, maxValue, average, stdDeviation }
 *
 * @param {string} metric - The metric to fetch data for (e.g., 'pressure', 'tds', 'dryness')
 * @returns {object} { data, loading, error, refetch }
 */
export const useStatsTableData = (metric) => {
  const location = useLocation();
  const isTestEnvironment = location.pathname.startsWith('/test');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTableData = useCallback(async () => {
    if (isTestEnvironment || !metric) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getAggregatedStats(metric);
      if (response.success && Array.isArray(response.data)) {
        setData(response.data);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error('Error fetching stats table data:', err);
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [metric, isTestEnvironment]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  return { data, loading, error, refetch: fetchTableData };
};

export default useStatsTableData;
