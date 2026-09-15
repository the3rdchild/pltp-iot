import { useState, useEffect } from 'react';

const FAILURE_FORECAST_HISTORY_URL = '/api/external/failure-forecast/history';

/**
 * Hook to fetch the historical failure-forecast curve (COD 2015-06-29 ->
 * today), the counterpart to useFailureForecastData's forward-looking
 * projection. Same models/columns shape, joins onto the projection at
 * today_failure_pct -- see docs/failure_forecast_contract_for_beFE.md.
 *
 * The table is REPLACEd whole on every job run (~60s cadence, same run as
 * failure_forecast_projection), so `rows` is always "the current history" --
 * every point for every model, already ordered by (model, point_date)
 * server-side. `segment` ('nominal' | 'observed') is carried through as-is
 * for the chart to style, never re-derived from point_date.
 */
export const useFailureForecastHistory = (pollInterval = 60000) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = () => {
      fetch(FAILURE_FORECAST_HISTORY_URL)
        .then((r) => r.json())
        .then((json) => {
          if (cancelled) return;
          if (json.success && Array.isArray(json.data)) {
            setRows(json.data);
            setError(null);
          } else {
            setRows([]);
            setError(json.message || 'failure-forecast history fetch failed');
          }
          setLoading(false);
        })
        .catch((err) => {
          if (cancelled) return;
          console.error('failure-forecast history fetch error:', err);
          setRows([]);
          setError(err.message);
          setLoading(false);
        });
    };

    fetchData();
    const id = setInterval(fetchData, pollInterval);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pollInterval]);

  return { rows, loading, error };
};
