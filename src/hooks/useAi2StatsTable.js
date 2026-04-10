import { useState, useEffect, useCallback } from 'react';

/**
 * Fetches daily aggregated stats for an ai2 metric (ncg_predict | dryness_predict)
 * from GET /api/external/ai2/stats?metric=<metricColumn>
 *
 * Returns rows matching StatisticsTable's column format:
 *   { no, date, minValue, maxValue, average, stdDeviation }
 */
export const useAi2StatsTable = (metricColumn = 'ncg_predict') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/external/ai2/stats?metric=${metricColumn}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setData(json.data);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error('useAi2StatsTable error:', err);
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [metricColumn]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
};

export default useAi2StatsTable;
