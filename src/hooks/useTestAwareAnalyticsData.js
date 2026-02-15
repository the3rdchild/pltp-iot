import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  useAnalyticsData as useRealAnalyticsData,
  useMultiMetricData as useRealMultiMetricData,
  useChartData as useRealChartData,
  useStatsTable as useRealStatsTable
} from './useAnalyticsData';
import { useTestData } from '../contexts/TestDataContext';

/**
 * Generate mock chart data for testing with realistic variance
 */
const generateMockChartData = (metric, range, currentValue, variance = 0) => {
  const now = new Date();
  const dataPoints = [];
  let numPoints = 24; // default for 1d
  let intervalMs = 3600000; // hourly

  switch (range) {
    case '1h':
      numPoints = 60;
      intervalMs = 60000; // minute
      break;
    case '1d':
      numPoints = 24;
      intervalMs = 3600000; // hourly
      break;
    case '7d':
      numPoints = 168;
      intervalMs = 3600000; // hourly
      break;
    case '1m':
      numPoints = 30;
      intervalMs = 86400000; // daily
      break;
    case 'all':
      numPoints = 60;
      intervalMs = 2592000000; // monthly
      break;
  }

  // Use variance if provided, otherwise use 10% of current value
  const maxVariance = variance || (currentValue * 0.1);

  // Generate data points with realistic variation and trend
  let lastValue = currentValue;
  for (let i = numPoints; i >= 0; i--) {
    const timestamp = new Date(now - i * intervalMs);
    // Add some momentum to make data look more realistic
    const randomChange = (Math.random() - 0.5) * 2 * maxVariance;
    const momentum = (lastValue - currentValue) * 0.1; // 10% momentum
    const newValue = Math.max(0, currentValue + randomChange + momentum);

    dataPoints.push({
      timestamp: timestamp.toISOString(),
      value: parseFloat(newValue.toFixed(3)) // Max 3 decimals
    });

    lastValue = newValue;
  }

  return { data: dataPoints };
};

/**
 * Generate mock stats table data with realistic variance
 */
const generateMockStatsTable = (metric, currentValue, variance = 0, options = {}) => {
  const { limit = 10, offset = 0 } = options;
  const records = [];

  // Use variance if provided, otherwise use 10% of current value
  const maxVariance = variance || (currentValue * 0.1);

  // Generate records with realistic variance and occasional anomalies
  let lastValue = currentValue;
  for (let i = 0; i < limit; i++) {
    const timestamp = new Date(Date.now() - (offset + i) * 3600000);

    // Add momentum for realism
    const randomChange = (Math.random() - 0.5) * 2 * maxVariance;
    const momentum = (lastValue - currentValue) * 0.15;
    const value = Math.max(0, currentValue + randomChange + momentum);

    // Determine status based on deviation from base value
    const deviation = Math.abs(value - currentValue);
    const deviationPercent = (deviation / currentValue) * 100;

    let status = 'normal';
    if (deviationPercent > 15) {
      status = 'critical';
    } else if (deviationPercent > 8) {
      status = 'warning';
    }

    records.push({
      id: offset + i + 1,
      timestamp: timestamp.toISOString(),
      value: parseFloat(value.toFixed(3)), // Max 3 decimals
      status: status
    });

    lastValue = value;
  }

  return {
    data: records,
    total: 1000,
    limit,
    offset
  };
};

/**
 * Test-aware wrapper for useAnalyticsData hook
 */
export const useAnalyticsData = (
  metric,
  chartRange = '1d',
  tableOptions = { limit: 10, offset: 0 },
  refreshInterval = 3000
) => {
  const location = useLocation();
  const isTestEnvironment = location.pathname.startsWith('/test');

  // Get real data hook
  const realData = useRealAnalyticsData(metric, chartRange, tableOptions, refreshInterval);

  // Get test data if in test environment
  const testDataContext = isTestEnvironment ? useTestData() : null;

  // Return test data or real data based on environment
  if (isTestEnvironment && testDataContext) {
    const metricData = testDataContext.mockData.metrics[metric];
    const currentValue = metricData?.value || 0;
    const variance = testDataContext.config?.variance?.[metric] || 0;

    // Format liveData to match expected structure { value, status, change_pct, ... }
    const formattedLiveData = metricData ? {
      value: parseFloat(currentValue.toFixed(3)),
      status: metricData.status || 'normal',
      change_pct: 0,
      unit: metricData.unit || ''
    } : null;

    const mockChartData = generateMockChartData(metric, chartRange, currentValue, variance);
    const mockTableData = generateMockStatsTable(metric, currentValue, variance, tableOptions);

    return {
      liveData: formattedLiveData,
      chartData: {
        chart: mockChartData.data,
        ...mockChartData
      },
      tableData: {
        records: mockTableData.data,
        ...mockTableData
      },
      loading: false,
      error: null,
      refetch: () => {}
    };
  }

  return realData;
};

/**
 * Test-aware wrapper for useMultiMetricData hook
 */
export const useMultiMetricData = (
  metrics = [],
  chartRange = '1d',
  refreshInterval = 3000
) => {
  const location = useLocation();
  const isTestEnvironment = location.pathname.startsWith('/test');

  // Get real data hook
  const realData = useRealMultiMetricData(metrics, chartRange, refreshInterval);

  // Get test data if in test environment
  const testDataContext = isTestEnvironment ? useTestData() : null;

  // Return test data or real data based on environment
  if (isTestEnvironment && testDataContext) {
    const metricsData = {};

    metrics.forEach(metric => {
      const metricData = testDataContext.mockData.metrics[metric];
      const currentValue = metricData?.value || 0;
      const variance = testDataContext.config?.variance?.[metric] || 0;

      // Format live data to match expected structure { value, status, change_pct, ... }
      const formattedLiveData = metricData ? {
        value: parseFloat(currentValue.toFixed(3)),
        status: metricData.status || 'normal',
        change_pct: 0,
        unit: metricData.unit || ''
      } : null;

      metricsData[metric] = {
        live: formattedLiveData,
        chart: generateMockChartData(metric, chartRange, currentValue, variance)
      };
    });

    return {
      metricsData,
      loading: false,
      error: null,
      refetch: () => {}
    };
  }

  return realData;
};

/**
 * Test-aware wrapper for useChartData hook
 */
export const useChartData = (metric, range = '1d', refreshInterval = 0) => {
  const location = useLocation();
  const isTestEnvironment = location.pathname.startsWith('/test');

  // Get real data hook
  const realData = useRealChartData(metric, range, refreshInterval);

  // Get test data if in test environment
  const testDataContext = isTestEnvironment ? useTestData() : null;

  // Return test data or real data based on environment
  if (isTestEnvironment && testDataContext) {
    const metricData = testDataContext.mockData.metrics[metric];
    const currentValue = metricData?.value || 0;
    const variance = testDataContext.config?.variance?.[metric] || 0;

    return {
      data: generateMockChartData(metric, range, currentValue, variance),
      loading: false,
      error: null,
      refetch: () => {}
    };
  }

  return realData;
};

/**
 * Test-aware wrapper for useStatsTable hook
 */
export const useStatsTable = (metric, options = { limit: 10, offset: 0 }) => {
  const location = useLocation();
  const isTestEnvironment = location.pathname.startsWith('/test');

  // Get real data hook
  const realData = useRealStatsTable(metric, options);

  // Get test data if in test environment
  const testDataContext = isTestEnvironment ? useTestData() : null;

  // Return test data or real data based on environment
  if (isTestEnvironment && testDataContext) {
    const metricData = testDataContext.mockData.metrics[metric];
    const currentValue = metricData?.value || 0;
    const variance = testDataContext.config?.variance?.[metric] || 0;

    const mockTableData = generateMockStatsTable(metric, currentValue, variance, options);

    return {
      data: {
        records: mockTableData.data,
        ...mockTableData
      },
      loading: false,
      error: null,
      refetch: () => {}
    };
  }

  return realData;
};

export default useAnalyticsData;
