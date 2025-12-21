import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useLiveData as useRealLiveData, useLiveMetric as useRealLiveMetric } from './useLiveData';
import { useTestData } from '../contexts/TestDataContext';

/**
 * Test-aware wrapper for useLiveData hook
 * Returns mock data in test environment, real data in production
 */
export const useLiveData = (refreshInterval = 1000) => {
  const location = useLocation();
  const isTestEnvironment = location.pathname.startsWith('/test');

  // Get real data hook
  const realData = useRealLiveData(refreshInterval);

  // Get test data if in test environment
  const testDataContext = isTestEnvironment ? useTestData() : null;

  // Return test data or real data based on environment
  if (isTestEnvironment && testDataContext) {
    return {
      data: testDataContext.mockData,
      loading: false,
      error: null,
      refresh: () => {} // No need to refresh in test mode
    };
  }

  return realData;
};

/**
 * Test-aware wrapper for useLiveMetric hook
 * Returns mock data in test environment, real data in production
 */
export const useLiveMetric = (metric, refreshInterval = 3000) => {
  const location = useLocation();
  const isTestEnvironment = location.pathname.startsWith('/test');

  // Get real data hook
  const realData = useRealLiveMetric(metric, refreshInterval);

  // Get test data if in test environment
  const testDataContext = isTestEnvironment ? useTestData() : null;

  // Return test data or real data based on environment
  if (isTestEnvironment && testDataContext) {
    const metricData = testDataContext.mockData.metrics[metric];
    return {
      data: metricData ? { [metric]: metricData } : null,
      loading: false,
      error: null,
      refresh: () => {}
    };
  }

  return realData;
};

export default useLiveData;
