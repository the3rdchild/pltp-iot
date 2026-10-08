import { useState, useEffect, useCallback } from 'react';

/**
 * Fetches daily aggregated stats for an ai2 metric (ncg_predict | dryness_predict)
 * from GET /api/external/ai2/stats?metric=<metricColumn>
 *
 * Returns rows matching StatisticsTable's column format:
 *   { no, date, minValue, maxValue, average, stdDeviation }
 *
 * @param {object|null} dateRange - optional { start_date, end_date } (YYYY-MM-DD)
 */
export const useAi2StatsTable = (metricColumn = 'ncg_predict', dateRange = null) => {
  const startDate = dateRange?.start_date;
  const endDate = dateRange?.end_date;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ metric: metricColumn });
      if (startDate) params.set('start_date', startDate);
      if (endDate) params.set('end_date', endDate);
      const res = await fetch(`/api/external/ai2/stats?${params.toString()}`);
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
  }, [metricColumn, startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
};

export default useAi2StatsTable;
