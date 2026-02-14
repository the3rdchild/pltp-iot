import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import limitsData from '../data/Limit.json';

/**
 * Detect anomaly status based on value and limits
 * @param {number} value - Current metric value
 * @param {object} limits - Limit thresholds for the metric
 * @returns {string} 'abnormal', 'warning', or 'normal'
 */
const detectAnomalyStatus = (value, limits) => {
  if (!limits || value === null || value === undefined) return 'normal';

  // Check for high thresholds
  if (limits.abnormalHigh !== undefined && value >= limits.abnormalHigh) {
    return 'abnormal';
  }
  if (limits.warningHigh !== undefined && value >= limits.warningHigh) {
    return 'warning';
  }

  // Check for low thresholds
  if (limits.abnormalLow !== undefined && value <= limits.abnormalLow) {
    return 'abnormal';
  }
  if (limits.warningLow !== undefined && value <= limits.warningLow) {
    return 'warning';
  }

  return 'normal';
};

/**
 * Custom hook for tracking anomalies in real-time
 * Stores anomaly history in localStorage for persistence
 *
 * @param {string} metricKey - Metric key (e.g., 'pressure', 'temperature', 'flow')
 * @param {number} currentValue - Current metric value
 * @returns {object} Anomaly counts for different time periods
 */
export const useAnomalyTracker = (metricKey, currentValue) => {
  const location = useLocation();
  const isTestEnvironment = location.pathname.startsWith('/test');

  const [anomalyCounts, setAnomalyCounts] = useState({
    last12h: 0,
    last24h: 0,
    last7d: 0
  });

  const lastStatusRef = useRef('normal');
  const storageKey = `anomaly_history_${metricKey}`;

  // Get limits for the metric
  const limits = limitsData[metricKey] || null;

  /**
   * Load anomaly history from localStorage
   */
  const loadHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading anomaly history:', error);
    }
    return [];
  }, [storageKey]);

  /**
   * Save anomaly to history
   */
  const saveAnomaly = useCallback((status, value, timestamp) => {
    if (status === 'normal') return;

    try {
      const history = loadHistory();

      // Add new anomaly record
      history.push({
        status,
        value,
        timestamp: timestamp || new Date().toISOString()
      });

      // Keep only last 7 days of data
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const filteredHistory = history.filter(record => {
        return new Date(record.timestamp).getTime() > sevenDaysAgo;
      });

      localStorage.setItem(storageKey, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Error saving anomaly:', error);
    }
  }, [storageKey, loadHistory]);

  /**
   * Calculate anomaly counts for different time periods
   */
  const calculateCounts = useCallback(() => {
    const history = loadHistory();
    const now = Date.now();

    const counts = {
      last12h: 0,
      last24h: 0,
      last7d: 0
    };

    history.forEach(record => {
      const recordTime = new Date(record.timestamp).getTime();
      const diffMs = now - recordTime;
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours <= 12) {
        counts.last12h++;
      }
      if (diffHours <= 24) {
        counts.last24h++;
      }
      if (diffHours <= 168) { // 7 days = 168 hours
        counts.last7d++;
      }
    });

    return counts;
  }, [loadHistory]);

  /**
   * Track current value and detect anomalies
   */
  useEffect(() => {
    if (currentValue === null || currentValue === undefined || !limits) {
      return;
    }

    const currentStatus = detectAnomalyStatus(currentValue, limits);

    // Only save when status changes from normal to anomaly (edge detection)
    // This prevents saving the same anomaly multiple times
    if (currentStatus !== 'normal' && lastStatusRef.current === 'normal') {
      saveAnomaly(currentStatus, currentValue);
    }

    lastStatusRef.current = currentStatus;

    // Recalculate counts
    const newCounts = calculateCounts();
    setAnomalyCounts(newCounts);

  }, [currentValue, limits, saveAnomaly, calculateCounts]);

  /**
   * Periodic cleanup and recalculation (every minute)
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const newCounts = calculateCounts();
      setAnomalyCounts(newCounts);
    }, 60000); // Every 1 minute

    return () => clearInterval(interval);
  }, [calculateCounts]);

  return {
    anomalyCounts,
    currentStatus: detectAnomalyStatus(currentValue, limits),
    limits
  };
};

/**
 * Hook for getting anomaly counts from API (production)
 * Fetches anomaly counts based on warning thresholds from metric_limits table
 *
 * @param {string} metricKey - Metric key
 * @returns {object} Anomaly counts from API
 */
export const useAnomalyCountsFromAPI = (metricKey) => {
  const [anomalyCounts, setAnomalyCounts] = useState({
    last12h: 0,
    last24h: 0,
    last7d: 0
  });

  const fetchCounts = useCallback(async () => {
    try {
      const response = await fetch(`/api/data/anomaly-counts/${metricKey}`);
      const result = await response.json();

      if (result.success && result.data) {
        setAnomalyCounts(result.data);
      }
    } catch (error) {
      console.error(`Error fetching anomaly counts for ${metricKey}:`, error);
    }
  }, [metricKey]);

  useEffect(() => {
    fetchCounts();

    // Refresh anomaly counts every 60 seconds
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  return anomalyCounts;
};

/**
 * Main hook that chooses between test (localStorage) and production (API)
 *
 * @param {string} metricKey - Metric key
 * @param {number} currentValue - Current metric value (for test environment)
 * @returns {object} Anomaly counts
 */
export const useAnomalyCounts = (metricKey, currentValue = null) => {
  const location = useLocation();
  const isTestEnvironment = location.pathname.startsWith('/test');

  // Test environment: use real-time tracking with localStorage
  const testTracking = useAnomalyTracker(metricKey, currentValue);

  // Production: use API data
  const apiCounts = useAnomalyCountsFromAPI(metricKey);

  if (isTestEnvironment) {
    return testTracking.anomalyCounts;
  } else {
    // In production, use API counts
    // Backend should track anomalies 24/7 and store in database
    return apiCounts;
  }
};

export default useAnomalyTracker;
