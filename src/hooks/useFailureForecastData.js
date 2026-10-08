import { useState, useEffect, useCallback } from 'react';

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
 *
 * `refetch` (added 2026-09-16) lets a caller force an immediate re-fetch
 * outside the poll interval -- used by OverhaulResetControl after a
 * reset/undo, once its own poll-for-fresh-`generated_at` loop confirms the
 * AI-side worker's on-demand recompute has actually landed (see
 * CONTRACT.md §3.1) -- calling this any earlier would just re-fetch the
 * same stale row the interval was already going to pick up anyway.
 */
export const useFailureForecastData = (pollInterval = 60000) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    return fetch(FAILURE_FORECAST_URL)
      .then((r) => r.json())
      .then((json) => {
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
        console.error('failure-forecast fetch error:', err);
        setRows([]);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    refetch();
    const id = setInterval(refetch, pollInterval);
    return () => clearInterval(id);
  }, [refetch, pollInterval]);

  return { rows, loading, error, refetch };
};
