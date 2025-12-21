import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to fetch statistics table data from API (production mode)
 * In test mode, this hook returns empty array (table will use generator instead)
 *
 * @param {string} metric - The metric to fetch data for (e.g., 'pressure', 'tds', 'dryness')
 * @param {object} options - Query options (limit, offset, date range, etc.)
 * @returns {object} { data, loading, error }
 */
export const useStatsTableData = (metric, options = {}) => {
  const location = useLocation();
  const isTestEnvironment = location.pathname.startsWith('/test');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In test mode, don't fetch from API (use generator instead)
    if (isTestEnvironment) {
      setData([]);
      setLoading(false);
      return;
    }

    // Production: Fetch from API
    const fetchTableData = async () => {
      setLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual API endpoint
        // const response = await fetch(`/api/analytics/${metric}/table?limit=${options.limit || 50}&offset=${options.offset || 0}`);
        // const result = await response.json();

        // Placeholder: Return empty array for now
        // Backend should implement endpoint that returns:
        // [
        //   {
        //     no: 1,
        //     date: '2024-12-21',
        //     minValue: 5.123,
        //     maxValue: 6.789,
        //     average: 5.956,
        //     stdDeviation: 0.234
        //   },
        //   ...
        // ]

        setData([]);
      } catch (err) {
        console.error('Error fetching stats table data:', err);
        setError(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
  }, [metric, isTestEnvironment, options.limit, options.offset]);

  return { data, loading, error };
};

export default useStatsTableData;
