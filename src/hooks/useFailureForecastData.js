import { useState, useEffect } from 'react';

const FAILURE_FORECAST_URL = '/api/external/failure-forecast';

/**
 * Hook to fetch the failure-forecast projection (turbine State-of-Health /
 * remaining-life curve, linear + weibull_cox models) from the backend.
 *
 * The table is REPLACEd whole on every job run (~60s cadence), so `rows`
 * is always "the current projection" -- every point for every model,
 * already ordered by (model, projection_date) server-side. There is no
 * single "live" row the way ai1a/ai1b have one, so this hook exposes the
 * raw row list rather than a liveData/history split.
 */
export const useFailureForecastData = (pollInterval = 60000) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = () => {
      fetch(FAILURE_FORECAST_URL)
        .then((r) => r.json())
        .then((json) => {
          if (cancelled) return;
          if (json.success && Array.isArray(json.data)) {
            setRows(json.data);
            setError(null);
          } else {
            setRows([]);
            setError(json.message || 'failure-forecast fetch failed');
          }
          setLoading(false);
        })
        .catch((err) => {
          if (cancelled) return;
          console.error('failure-forecast fetch error:', err);
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
