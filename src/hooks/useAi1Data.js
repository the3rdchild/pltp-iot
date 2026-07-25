import { useState, useEffect } from 'react';

const AI1A_URL = '/api/external/ai1a';
const AI1B_URL = '/api/external/ai1b';

// Data older than this is considered stale → liveData becomes null
// (uses created_at, the job execution time - NOT timestamp/generated_at,
// which are the underlying data/forecast time)
const STALE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

const isDataFresh = (row) => {
  if (!row?.created_at) return false;
  return Date.now() - new Date(row.created_at).getTime() < STALE_THRESHOLD_MS;
};

/**
 * Hook to fetch ai1a (anomaly detection / current risk status) from the backend.
 * - `liveData`: latest single row if fresh (< 10 min old, by created_at), otherwise null
 * - `history`: last 60 rows in chronological order (fetched once on mount)
 * - `loading`: true until first live fetch completes
 */
export const useAi1aData = (pollInterval = 3000) => {
  const [liveData, setLiveData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${AI1A_URL}?limit=60`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setHistory([...json.data].reverse());
        }
      })
      .catch(err => console.error('ai1a history fetch error:', err));
  }, []);

  useEffect(() => {
    const poll = () => {
      fetch(`${AI1A_URL}?limit=1`)
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
          console.error('ai1a live fetch error:', err);
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

/**
 * Hook to fetch ai1b (30-day risk forecast) from the backend.
 * - `liveData`: latest forecast row if fresh (< 10 min old, by created_at), otherwise null
 * - `history`: last 10 forecast runs in chronological order (fetched once on mount)
 * - `loading`: true until first live fetch completes
 */
export const useAi1bData = (pollInterval = 30000) => {
  const [liveData, setLiveData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${AI1B_URL}?limit=10`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setHistory([...json.data].reverse());
        }
      })
      .catch(err => console.error('ai1b history fetch error:', err));
  }, []);

  useEffect(() => {
    const poll = () => {
      fetch(`${AI1B_URL}?limit=1`)
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
          console.error('ai1b live fetch error:', err);
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
