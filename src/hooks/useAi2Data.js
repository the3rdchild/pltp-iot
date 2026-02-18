import { useState, useEffect, useRef } from 'react';

const AI2_URL = '/api/external/ai2';

/**
 * Hook to fetch ai2 predictions (dryness_predict, ncg_predict) from the backend.
 * - `liveData`: latest single row (refreshed every pollInterval ms)
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

  // Poll latest row for live gauge value
  useEffect(() => {
    const poll = () => {
      fetch(`${AI2_URL}?limit=1`)
        .then(r => r.json())
        .then(json => {
          if (json.success && json.data?.length > 0) {
            setLiveData(json.data[0]);
            setLoading(false);
          }
        })
        .catch(err => console.error('ai2 live fetch error:', err));
    };

    poll();
    const id = setInterval(poll, pollInterval);
    return () => clearInterval(id);
  }, [pollInterval]);

  return { liveData, history, loading };
};
