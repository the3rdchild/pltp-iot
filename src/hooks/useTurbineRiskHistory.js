import { useState, useEffect, useCallback } from 'react';

const TURBINE_RISK_HISTORY_URL = '/api/external/turbine-risk-history';

// turbine_risk_history writes about one row per minute (same cadence as
// ai1a), so refetching the chart window twice a minute keeps non-'now'
// ranges current without hammering the endpoint.
const POLL_MS = 30000;

// Buckets requested from the API for every range except 'now' -- same
// reasoning as AI1A_CHART_POINTS in prediction.jsx: sized to the chart's
// pixel width, not a round number, since every bucket carries min/avg/max.
const CHART_POINTS = 300;

const RANGE_DURATION_MS = {
  now: 60 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '1m': 30 * 24 * 60 * 60 * 1000,
  '1y': 365 * 24 * 60 * 60 * 1000
  // 'all' has no fixed duration -- handled separately below.
};

/**
 * Range-selectable, server-bucketed fetch for the "Turbine Risk History"
 * chart -- same range-selector + bucketing pattern as the AI1a range-fetch
 * inline in prediction.jsx (see `ai1aSelection`/`fetchRange` there),
 * factored into its own hook now that a second chart needs the identical
 * pattern instead of a second ~50-line copy inside the page.
 *
 * `selection` is `{ range, custom }` in the same shape prediction.jsx
 * already uses for ai1aSelection, so both charts' range-selector buttons
 * wire up identically.
 */
export const useTurbineRiskHistory = ({ range, custom }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRange = useCallback(() => {
    let startIso;
    let endIso;
    if (range === 'custom' && custom?.from && custom?.to) {
      startIso = new Date(custom.from).toISOString();
      endIso = new Date(new Date(custom.to).getTime() + 24 * 60 * 60 * 1000).toISOString();
    } else {
      const end = new Date();
      const ms = range === 'all' ? 5 * 365 * 24 * 60 * 60 * 1000 : (RANGE_DURATION_MS[range] ?? RANGE_DURATION_MS['1d']);
      startIso = new Date(end.getTime() - ms).toISOString();
      endIso = end.toISOString();
    }

    const pointsParam = range === 'now' ? '' : `&points=${CHART_POINTS}`;

    setLoading(true);
    return fetch(
      `${TURBINE_RISK_HISTORY_URL}?start_date=${encodeURIComponent(startIso)}&end_date=${encodeURIComponent(endIso)}${pointsParam}`
    )
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setRows([...json.data].reverse()); // newest-first from DB -> chronological
        } else {
          setRows([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('turbine-risk-history fetch error:', err);
        setRows([]);
        setLoading(false);
      });
  }, [range, custom]);

  // Re-runs on an interval, not just on range change: turbine_risk_history
  // appends a row about once a minute, and without this the chart would
  // only ever show the rows that existed when the range was picked.
  useEffect(() => {
    fetchRange();
    const id = setInterval(fetchRange, POLL_MS);
    return () => clearInterval(id);
  }, [fetchRange]);

  return { rows, loading };
};
