import { useState, useEffect, useRef } from 'react';

const AI2_URL = '/api/external/ai2';

// Data older than this is considered stale → liveData becomes null
const STALE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

const isDataFresh = (row) => {
  if (!row?.processed_at) return false;
  return Date.now() - new Date(row.processed_at).getTime() < STALE_THRESHOLD_MS;
};

/**
 * Hook to fetch ai2 predictions (dryness_predict, ncg_predict) from the backend.
 * - `liveData`: latest single row if fresh (< 10 min old), otherwise null
 * - `history`: last 60 rows in chronological order (fetched once on mount)
 * - `loading`: true until first live fetch completes
 */
export const useAi2Data = (pollInterval = 3000) => {
  const [liveData, setLiveData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch 60 rows as historical seed (newest first from DB, reversed to chronological)
  useEffect(() => {
    fetch(`${AI2_URL}?limit=60`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setHistory([...json.data].reverse());
        }
      })
      .catch(err => console.error('ai2 history fetch error:', err));
  }, []);

  // Poll latest row for live gauge value; set null when stale or missing
  useEffect(() => {
    const poll = () => {
      fetch(`${AI2_URL}?limit=1`)
        .then(r => r.json())
        .then(json => {
          if (json.success && json.data?.length > 0) {
            const row = json.data[0];
            setLiveData(isDataFresh(row) ? row : null);
          } else {
            setLiveData(null);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('ai2 live fetch error:', err);
          setLiveData(null);
          setLoading(false);
        });
    };

    poll();
    const id = setInterval(poll, pollInterval);
    return () => clearInterval(id);
  }, [pollInterval]);

  return { liveData, history, loading };
};
