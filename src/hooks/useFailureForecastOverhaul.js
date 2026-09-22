import { useState, useEffect, useCallback } from 'react';

const OVERHAUL_URL = '/api/external/failure-forecast/overhaul';

/**
 * Hook to fetch the overhaul-event log (failure_forecast_overhaul_event --
 * soft-delete only, see docs/failure_forecast_contract_for_beFE.md §3).
 *
 * Unlike useFailureForecastData/useFailureForecastHistory, this does NOT
 * poll -- the log only changes when an admin presses reset/undo through
 * OverhaulResetControl, so there's nothing to catch on a timer. Callers
 * that mutate the log should call `refetch()` themselves right after.
 */
export const useFailureForecastOverhaul = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    setLoading(true);
    return fetch(OVERHAUL_URL)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setEvents(json.data);
          setError(null);
        } else {
          setEvents([]);
          setError(json.message || 'overhaul events fetch failed');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('overhaul events fetch error:', err);
        setEvents([]);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { events, loading, error, refetch };
};
