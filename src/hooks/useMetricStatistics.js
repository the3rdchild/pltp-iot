import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Calculate min, max, avg from array of records
 */
const calculateStats = (records) => {
  if (!records || records.length === 0) {
    return { min: 0, max: 0, avg: 0, count: 0 };
  }

  const values = records.map(r => r.value).filter(v => v !== null && v !== undefined);

  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0, count: 0 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

  return {
    min: parseFloat(min.toFixed(3)),
    max: parseFloat(max.toFixed(3)),
    avg: parseFloat(avg.toFixed(3)),
    count: values.length
  };
};

/**
 * Filter records by time window
 */
const filterByTimeWindow = (records, hoursAgo) => {
  const now = Date.now();
  const cutoffTime = now - (hoursAgo * 60 * 60 * 1000);

  return records.filter(record => {
    const recordTime = new Date(record.timestamp).getTime();
    return recordTime > cutoffTime;
  });
};

/**
 * Custom hook for tracking metric statistics (min, max, avg) in real-time
 * Stores history in localStorage for persistence
 *
 * @param {string} metricKey - Metric key (e.g., 'pressure', 'temperature', 'flow')
 * @param {number} currentValue - Current metric value
 * @returns {object} Statistics for different time periods
 */
export const useMetricStatistics = (metricKey, currentValue) => {
  const location = useLocation();
  const isTestEnvironment = location.pathname.startsWith('/test');

  const [stats, setStats] = useState({
    current: 0,
    min12h: 0,
    max12h: 0,
    avg12h: 0,
    min24h: 0,
    max24h: 0,
    avg24h: 0,
    min7d: 0,
    max7d: 0,
    avg7d: 0
  });

  const lastSavedRef = useRef(null);
  const saveIntervalRef = useRef(null);
  const storageKey = `metric_stats_${metricKey}`;

  /**
   * Load history from localStorage
   */
  const loadHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading metric history:', error);
    }
    return [];
  }, [storageKey]);

  /**
   * Save value to history
   */
  const saveValue = useCallback((value, timestamp) => {
    if (value === null || value === undefined || isNaN(value)) return;

    try {
      const history = loadHistory();

      // Add new record
      history.push({
        value: parseFloat(value.toFixed(3)),
        timestamp: timestamp || new Date().toISOString()
      });

      // Keep only last 7 days of data
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const filteredHistory = history.filter(record => {
        return new Date(record.timestamp).getTime() > sevenDaysAgo;
      });

      // Limit to max 10000 records to prevent localStorage overflow
      const limitedHistory = filteredHistory.slice(-10000);

      localStorage.setItem(storageKey, JSON.stringify(limitedHistory));

      return limitedHistory;
    } catch (error) {
      console.error('Error saving metric value:', error);
      return loadHistory();
    }
  }, [storageKey, loadHistory]);

  /**
   * Calculate statistics for all time windows
   */
  const calculateAllStats = useCallback(() => {
    const history = loadHistory();

    // Filter by time windows
    const records12h = filterByTimeWindow(history, 12);
    const records24h = filterByTimeWindow(history, 24);
    const records7d = filterByTimeWindow(history, 168); // 7 days = 168 hours

    // Calculate stats for each window
    const stats12h = calculateStats(records12h);
    const stats24h = calculateStats(records24h);
    const stats7d = calculateStats(records7d);

    // Ensure currentValue is a number
    const numericValue = typeof currentValue === 'number'
      ? currentValue
      : parseFloat(currentValue);

    const safeCurrentValue = !isNaN(numericValue) ? numericValue : 0;

    return {
      current: safeCurrentValue ? parseFloat(safeCurrentValue.toFixed(3)) : 0,
      min12h: stats12h.min,
      max12h: stats12h.max,
      avg12h: stats12h.avg,
      min24h: stats24h.min,
      max24h: stats24h.max,
      avg24h: stats24h.avg,
      min7d: stats7d.min,
      max7d: stats7d.max,
      avg7d: stats7d.avg
    };
  }, [loadHistory, currentValue]);

  /**
   * Track current value and save periodically
   */
  useEffect(() => {
    if (currentValue === null || currentValue === undefined || isNaN(currentValue)) {
      return;
    }

    const numericValue = typeof currentValue === 'number' ? currentValue : parseFloat(currentValue);
    if (isNaN(numericValue)) return;

    // Determine save interval based on environment
    // Test: 10 seconds for faster testing
    // Production: 5 minutes to avoid excessive writes
    const saveIntervalMs = isTestEnvironment ? 10 * 1000 : 5 * 60 * 1000;

    // Save immediately on first call OR if value changed significantly (> 0.1%)
    const shouldSaveNow = lastSavedRef.current === null ||
                          Math.abs(numericValue - lastSavedRef.current) > Math.abs(lastSavedRef.current * 0.001);

    if (shouldSaveNow) {
      saveValue(numericValue);
      const newStats = calculateAllStats();
      setStats(newStats);
      lastSavedRef.current = numericValue;
    }

    // Setup periodic save
    if (!saveIntervalRef.current) {
      saveIntervalRef.current = setInterval(() => {
        const currentNumeric = typeof currentValue === 'number' ? currentValue : parseFloat(currentValue);
        if (!isNaN(currentNumeric) && currentNumeric !== lastSavedRef.current) {
          saveValue(currentNumeric);
          const newStats = calculateAllStats();
          setStats(newStats);
          lastSavedRef.current = currentNumeric;
        }
      }, saveIntervalMs);
    }

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
    };
  }, [currentValue, saveValue, calculateAllStats, isTestEnvironment]);

  /**
   * Recalculate stats periodically (every minute)
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const newStats = calculateAllStats();
      setStats(newStats);
    }, 60000); // Every 1 minute

    // Initial calculation
    const initialStats = calculateAllStats();
    setStats(initialStats);

    return () => clearInterval(interval);
  }, [calculateAllStats]);

  return stats;
};

/**
 * Hook for getting metric statistics from API (production)
 * Fetches min/max/avg for 12h, 24h, 7d from sensor_data via backend
 *
 * @param {string} metricKey - Metric key
 * @returns {object} Statistics from API
 */
export const useMetricStatisticsFromAPI = (metricKey) => {
  const [stats, setStats] = useState({
    current: 0,
    min12h: 0,
    max12h: 0,
    avg12h: 0,
    min24h: 0,
    max24h: 0,
    avg24h: 0,
    min7d: 0,
    max7d: 0,
    avg7d: 0
  });

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/data/metric-stats/${metricKey}`);
      const result = await response.json();

      if (result.success && result.data) {
        setStats(prev => ({
          ...prev,
          ...result.data
        }));
      }
    } catch (error) {
      console.error(`Error fetching stats for ${metricKey}:`, error);
    }
  }, [metricKey]);

  useEffect(() => {
    fetchStats();

    // Refresh stats every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return stats;
};

/**
 * Main hook that chooses between test (localStorage) and production (API)
 *
 * @param {string} metricKey - Metric key
 * @param {number} currentValue - Current metric value (for test environment)
 * @returns {object} Statistics
 */
export const useMetricStats = (metricKey, currentValue = null) => {
  const location = useLocation();
  const isTestEnvironment = location.pathname.startsWith('/test');

  // Test environment: use real-time tracking with localStorage
  const testStats = useMetricStatistics(metricKey, currentValue);

  // Production: use API data
  const apiStats = useMetricStatisticsFromAPI(metricKey);

  if (isTestEnvironment) {
    return testStats;
  } else {
    // In production, use API stats
    // Backend should track metrics 24/7 and store in database
    return apiStats;
  }
};

export default useMetricStatistics;
