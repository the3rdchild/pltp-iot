import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import ApexCharts from 'apexcharts';
import { Box, Typography, Button, ButtonGroup, Popover, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import dayjs from 'dayjs';
import MainCard from '../MainCard';
import PropTypes from 'prop-types';
import { generateRealTimeChartData } from '../../data/simulasi';
import { generateAIData, generateFieldData } from '../../data/chartData';
import { useTestData } from '../../contexts/TestDataContext';
import { useChartReferenceConfig } from '../../hooks/useChartReferenceConfig';
import { getChartData, getLabComparison } from '../../utils/api';
import { alignLabSamplesToTimestamps } from '../../utils/labOverlay';

// Lab comparison overlay color (markers only, opt-in via labMetric)
const LAB_SERIES_COLOR = '#f59e0b';
// Prediction overlay color (dashed line, opt-in via predictionDataType).
// Solid swatch for the legend chip; the line itself is drawn at 50% opacity
// per spec (rgba, not fill.opacity -- that attribute controls the area fill,
// not the stroke, and this overlay has no fill at all).
const PREDICTION_SERIES_COLOR = '#8b5cf6';
const PREDICTION_STROKE_COLOR = 'rgba(139, 92, 246, 0.5)';

const RealTimeDataChart = ({
  title = 'Real Time Data',
  subtitle = 'Dryness level data chart monthly',
  dataType = 'dryness',
  unit = '%',
  yAxisTitle = 'Dryness (%)',
  xAxisTitle = null,   // null = auto-compute from selected time range
  legendItems = [
    { name: 'Trend', color: '#3b82f6' },
    { name: 'Max', color: '#ef4444' },
    { name: 'Average', color: '#9ca3af' },
    { name: 'Min', color: '#22c55e' }
  ],
  thresholds = {
    showMax: true,
    showMin: true,
    showAverage: true
  },
  showComparison = false, // Show AI vs Field comparison (only for dryness/ncg on 1y+ ranges)
  fetchFromApi = false,  // Fetch real data from API instead of simulation
  liveValue = null,      // Current live value to append in 'now' mode (requires fetchFromApi=true)
  labMetric = null,      // Opt-in: overlay lab samples for this metric as markers (requires fetchFromApi=true)
  predictionDataType = null,   // Opt-in: overlay a live model prediction (e.g. 'tds_predicted') as a dashed line, same y-axis
  predictionLiveValue = null,  // Current live predicted value to append in 'now' mode (requires predictionDataType)
  predictionName = 'Prediksi' // Legend label for the prediction series
}) => {
  const location = useLocation();
  const isTestEnvironment = location.pathname.startsWith('/test');
  const testDataContext = isTestEnvironment ? useTestData() : null;

  // Chart reference configuration (manual/auto mode)
  const { config: chartRefConfig } = useChartReferenceConfig();

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const updateIntervalRef = useRef(null);
  const dbFetchedRef = useRef(false);
  // Width of the sliding window in 'now' mode. Taken from the seed fetch
  // rather than hardcoded: /api/data/chart/:metric returns 300 points per
  // series, so a fixed 60 here would visibly snap the chart down to a fifth of
  // its length the instant the first live value landed.
  const nowBufferRef = useRef(60);

  const fetchMetricFromAPI = useCallback(async (metric, range) => {
    try {
      const res = await getChartData(metric, range);
      const chart = res?.data?.chart || [];
      return {
        values: chart.map(p => p.avg ?? p.value ?? 0),
        timestamps: chart.map(p => p.timestamp)
      };
    } catch (err) {
      console.error(`Error fetching chart data for ${metric}:`, err);
      return null;
    }
  }, []);

  const fetchChartFromAPI = useCallback(
    (range) => fetchMetricFromAPI(dataType, range),
    [dataType, fetchMetricFromAPI]
  );

  const [timeRange, setTimeRange] = useState('now');
  const [chartData, setChartData] = useState([]);
  const [apiTimestamps, setApiTimestamps] = useState([]); // real timestamps from API
  const [fieldData, setFieldData] = useState([]);
  const [aiData, setAiData] = useState([]);
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'year'));
  const [endDate, setEndDate] = useState(dayjs());
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [showComparisonData, setShowComparisonData] = useState(false);
  const [labSamples, setLabSamples] = useState([]);
  // Prediction overlay: seeded/aligned to apiTimestamps on fetch, then kept in
  // sync 1:1 with chartData by pushing together in the 'now' live-append effect.
  const [predictionData, setPredictionData] = useState([]);

  // Fetch lab comparison samples for the overlay (opt-in via labMetric).
  // Refetches whenever the chart refetches for a new range.
  useEffect(() => {
    if (!labMetric || isTestEnvironment || !fetchFromApi || timeRange === 'now') return;
    let cancelled = false;
    getLabComparison(labMetric)
      .then((res) => {
        if (!cancelled) setLabSamples(res?.data?.samples || []);
      })
      .catch((err) => console.error(`Error fetching lab comparison for ${labMetric}:`, err));
    return () => { cancelled = true; };
  }, [labMetric, timeRange, isCustomRange, startDate, endDate, isTestEnvironment, fetchFromApi]);

  // Lab overlay only where real API timestamps exist (standard fetched
  // ranges). 'now' mode is live-append based and '1y'/'all'/custom use
  // generated data without matching real timestamps, so those are skipped.
  const labOverlayEnabled = Boolean(
    labMetric && !isTestEnvironment && fetchFromApi &&
    !isCustomRange && ['1h', '1d', '7d', '1m'].includes(timeRange) &&
    apiTimestamps.length > 0
  );
  const labChartData = useMemo(
    () => (labOverlayEnabled ? alignLabSamplesToTimestamps(apiTimestamps, labSamples) : null),
    [labOverlayEnabled, apiTimestamps, labSamples]
  );

  // Helper function to generate test chart data from TestDataContext
  const generateTestChartData = (metric, range, previousData = []) => {
    if (!testDataContext) return [];

    const currentValue = testDataContext.mockData.metrics[metric]?.value ?? 0;
    const variance = testDataContext.config.variance[metric] ?? 0;
    const maxPoints = 60;

    // For 'now' mode - update with one new point
    if (range === 'now' && previousData.length > 0) {
      const randomChange = (Math.random() - 0.5) * 2 * variance;
      const newValue = Math.max(0, currentValue + randomChange);
      const newData = [...previousData.slice(-(maxPoints - 1)), parseFloat(newValue.toFixed(3))];
      return newData;
    }

    // Generate initial data with variance
    const data = [];
    let lastValue = currentValue;
    for (let i = 0; i < maxPoints; i++) {
      const randomChange = (Math.random() - 0.5) * 2 * variance;
      const momentum = (lastValue - currentValue) * 0.1;
      const value = Math.max(0, currentValue + randomChange + momentum);
      data.push(parseFloat(value.toFixed(3)));
      lastValue = value;
    }
    return data;
  };

  // Time range buttons configuration
  const timeRanges = [
    { value: 'now', label: 'Now' },
    { value: '1h', label: '1h' },
    { value: '1d', label: '1d' },
    { value: '7d', label: '7d' },
    { value: '1m', label: '1m' },
    { value: '1y', label: '1y' },
    { value: 'all', label: 'All' }
  ];

  // Determine if we should show comparison (AI vs Field)
  const shouldShowComparison = useMemo(() => {
    const isYearlyRange = ['1y', 'all'].includes(timeRange) || isCustomRange;
    const isComparisonType = ['dryness', 'ncg'].includes(dataType);
    return showComparison && isYearlyRange && isComparisonType;
  }, [timeRange, isCustomRange, dataType, showComparison]);

  // Initialize chart data
  useEffect(() => {
    if (shouldShowComparison) {
      // Generate AI vs Field data for comparison
      const start = isCustomRange ? startDate.toDate() : dayjs().subtract(timeRange === 'all' ? 10 : 1, 'year').toDate();
      const end = isCustomRange ? endDate.toDate() : dayjs().toDate();

      const aiDataPoints = generateAIData(start, end, dataType);
      const fieldDataPoints = generateFieldData(start, end, dataType);

      setAiData(aiDataPoints.map(d => d.value));
      setFieldData(fieldDataPoints.map(d => d.value));
      setShowComparisonData(true);
    } else if (fetchFromApi && !isTestEnvironment && ['now', '1h', '1d', '7d', '1m'].includes(timeRange)) {
      // Fetch real data from API for standard ranges
      dbFetchedRef.current = false;
      setApiTimestamps([]);
      setShowComparisonData(false);
      const rangeToFetch = timeRange === 'now' ? '1h' : timeRange;
      fetchChartFromAPI(rangeToFetch).then(result => {
        if (result && result.values.length > 0) {
          setChartData(result.values);
          setApiTimestamps(result.timestamps);
          nowBufferRef.current = Math.max(result.values.length, 60);
          dbFetchedRef.current = true;

          // Prediction overlay is bucketed independently (its own table), so
          // its timestamps rarely line up 1:1 with the sensor's -- align it
          // onto the sensor's bucket grid with the same nearest-timestamp
          // logic already used for the lab overlay, rather than assuming
          // equal array lengths.
          if (predictionDataType) {
            fetchMetricFromAPI(predictionDataType, rangeToFetch).then(predResult => {
              const samples = (predResult?.values || []).map((v, i) => ({
                sampled_at: predResult.timestamps[i],
                lab_value: v
              }));
              setPredictionData(alignLabSamplesToTimestamps(result.timestamps, samples));
            });
          }
        } else if (predictionDataType) {
          setPredictionData([]);
        }
      });
    } else {
      // Use test data or real-time data for shorter ranges
      let initialData;
      if (isTestEnvironment && testDataContext) {
        initialData = generateTestChartData(dataType, timeRange);
      } else {
        initialData = generateRealTimeChartData(dataType, timeRange);
      }
      setChartData(initialData);
      setShowComparisonData(false);
    }
  }, [timeRange, dataType, isCustomRange, startDate, endDate, shouldShowComparison, isTestEnvironment, testDataContext, fetchFromApi, fetchChartFromAPI, predictionDataType, fetchMetricFromAPI]);

  // Real-time updates for 'Now' mode only
  useEffect(() => {
    if (timeRange === 'now' && !showComparisonData) {
      // When using API data in production, skip simulation interval (live appended via liveValue prop)
      if (fetchFromApi && !isTestEnvironment) return;

      updateIntervalRef.current = setInterval(() => {
        setChartData(prevData => {
          if (isTestEnvironment && testDataContext) {
            return generateTestChartData(dataType, 'now', prevData);
          } else {
            return generateRealTimeChartData(dataType, 'now', prevData);
          }
        });
      }, 1000); // Update every 1 second
    } else {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [timeRange, dataType, showComparisonData, isTestEnvironment, testDataContext, fetchFromApi]);

  // Append live value in 'now' mode when using real API data
  useEffect(() => {
    if (timeRange !== 'now' || !fetchFromApi || isTestEnvironment || !dbFetchedRef.current) return;
    if (liveValue == null) return;

    const now = new Date().toISOString();
    const keep = nowBufferRef.current;
    setChartData(prev => [...prev.slice(-(keep - 1)), liveValue]);
    setApiTimestamps(prev => [...prev.slice(-(keep - 1)), now]);

    // Pushed in the same tick as the sensor point (not re-aligned by
    // timestamp) so predictionData always stays exactly as long as chartData.
    if (predictionDataType) {
      setPredictionData(prev => [...prev.slice(-(keep - 1)), predictionLiveValue ?? null]);
    }
  }, [liveValue, timeRange, fetchFromApi, isTestEnvironment, predictionDataType, predictionLiveValue]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (showComparisonData && aiData.length > 0 && fieldData.length > 0) {
      const aiMax = Math.max(...aiData);
      const aiMin = Math.min(...aiData);
      const aiAvg = aiData.reduce((a, b) => a + b, 0) / aiData.length;

      const fieldMax = Math.max(...fieldData);
      const fieldMin = Math.min(...fieldData);
      const fieldAvg = fieldData.reduce((a, b) => a + b, 0) / fieldData.length;

      return {
        aiMax,
        aiMin,
        aiAvg,
        fieldMax,
        fieldMin,
        fieldAvg,
        maxValue: Math.max(aiMax, fieldMax),
        minValue: Math.min(aiMin, fieldMin),
        avgValue: (aiAvg + fieldAvg) / 2
      };
    } else if (chartData.length > 0) {
      const maxValue = Math.max(...chartData);
      const minValue = Math.min(...chartData);
      const avgValue = chartData.reduce((a, b) => a + b, 0) / chartData.length;

      return { maxValue, minValue, avgValue };
    }

    return {};
  }, [chartData, aiData, fieldData, showComparisonData]);

  // Stats for display cards (only show when comparison is active)
  const statsData = useMemo(() => {
    if (!showComparisonData) return [];

    return [
      {
        title: 'Field Range',
        value: `${stats.fieldMin?.toFixed(3)}${unit} - ${stats.fieldMax?.toFixed(3)}${unit}`
      },
      {
        title: 'Field Average',
        value: `${stats.fieldAvg?.toFixed(3)}${unit}`
      },
      {
        title: 'AI Range',
        value: `${stats.aiMin?.toFixed(3)}${unit} - ${stats.aiMax?.toFixed(3)}${unit}`
      },
      {
        title: 'AI Average',
        value: `${stats.aiAvg?.toFixed(3)}${unit}`
      }
    ];
  }, [stats, unit, showComparisonData]);

  // Map time range to a readable x-axis label
  const XAXIS_LABEL_MAP = {
    now:    'Real-time',
    '1h':   'Time Range: 1h',
    '1d':   'Time Range: 24 Hours',
    '7d':   'Time Range: 7 Days',
    '1m':   'Time Range: 30 Days',
    '1y':   'Time Range: 1 Year',
    all:    'Time Range: All',
    custom: 'Time Range: Custom'
  };
  const computedXAxisTitle = xAxisTitle ?? XAXIS_LABEL_MAP[timeRange] ?? timeRange;

  // Format a timestamp string for x-axis labels based on the active range
  const formatTS = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    switch (timeRange) {
      case 'now':
      case '1h':
        return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      case '1d':
        return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      case '7d':
      case '1m':
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      default:
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    }
  };

  // Initialize ApexCharts (only once or when major config changes)
  useEffect(() => {
    if (!chartRef.current) return;

    // Determine metric key for chart reference config
    // Map dataType to config keys (pressure, temperature, flow_rate, ncg, dryness, tds)
    const metricConfigKey = dataType === 'flow' ? 'flow_rate' : dataType;
    const metricConfig = chartRefConfig[metricConfigKey] || { enabled: false };

    // Use manual values if enabled, otherwise use calculated statistics
    const maxValue = metricConfig.enabled ? metricConfig.max : (stats.maxValue || 100);
    const minValue = metricConfig.enabled ? metricConfig.min : (stats.minValue || 0);
    const avgValue = metricConfig.enabled ? metricConfig.avg : (stats.avgValue || 50);

    // Include overlay values (lab + prediction) so they aren't clipped by the axis range
    const overlayVals = [
      ...(labChartData ? labChartData.filter(v => v != null) : []),
      ...(predictionDataType ? predictionData.filter(v => v != null) : [])
    ];
    const effMaxValue = overlayVals.length ? Math.max(maxValue, ...overlayVals) : maxValue;
    const effMinValue = overlayVals.length ? Math.min(minValue, ...overlayVals) : minValue;

    const initialData = showComparisonData
      ? (fieldData.length > 0 ? fieldData : Array(60).fill(0))
      : (chartData.length > 0 ? chartData : Array(60).fill(0));

    const categories = apiTimestamps.length > 0
      ? apiTimestamps.map(ts => formatTS(ts))
      : Array.from({ length: initialData.length }, (_, i) => `${i + 1}`);

    const annotations = [];
    if (thresholds.showMax && maxValue) {
      annotations.push({
        y: maxValue,
        borderColor: '#ef4444',
        strokeDashArray: 5,
        borderWidth: 2,
        label: { text: '' }
      });
    }
    if (thresholds.showAverage && avgValue) {
      annotations.push({
        y: avgValue,
        borderColor: '#9ca3af',
        strokeDashArray: 5,
        borderWidth: 2,
        label: { text: '' }
      });
    }
    if (thresholds.showMin && minValue) {
      annotations.push({
        y: minValue,
        borderColor: '#22c55e',
        strokeDashArray: 5,
        borderWidth: 2,
        label: { text: '' }
      });
    }

    // Optional overlays beyond the primary series, built generically so any
    // combination (lab markers, prediction line, both) stays index-aligned
    // across series/colors/stroke/fill/markers.
    const overlaySeries = [];
    const overlayColors = [];
    const overlayStrokeWidth = [];
    const overlayDashArray = [];
    const overlayMarkerSize = [];

    if (labChartData) {
      // type: 'line' on the series entry (not a fill.opacity/type array) is
      // what actually suppresses the area fill for this series in a combo
      // chart. A gradient fill's visible alpha comes from
      // gradient.opacityFrom/opacityTo, which apply to every series alike and
      // aren't arrayed -- an earlier fill.opacity: [1, 0] attempt here had no
      // effect for that reason. It only looked right for lab (sparse, mostly
      // null -- nothing to fill) until a dense series (prediction) exposed it
      // as a solid block.
      overlaySeries.push({ name: `Lab ${yAxisTitle}`, type: 'line', data: labChartData });
      overlayColors.push(LAB_SERIES_COLOR);
      overlayStrokeWidth.push(0);
      overlayDashArray.push(0);
      overlayMarkerSize.push(6);
    }
    if (predictionDataType) {
      overlaySeries.push({ name: predictionName, type: 'line', data: predictionData });
      overlayColors.push(PREDICTION_STROKE_COLOR);
      overlayStrokeWidth.push(2);
      overlayDashArray.push(6);
      overlayMarkerSize.push(0);
    }
    const hasOverlay = !showComparisonData && overlaySeries.length > 0;

    const series = showComparisonData
      ? [
          { name: 'Field Data', data: fieldData.length > 0 ? fieldData : Array(60).fill(0) },
          { name: 'AI Data', data: aiData.length > 0 ? aiData : Array(60).fill(0) }
        ]
      : [
          { name: yAxisTitle, type: 'area', data: chartData.length > 0 ? chartData : Array(60).fill(0) },
          ...overlaySeries
        ];

    const colors = showComparisonData
      ? ['#53A1FF', '#8b5cf6']
      : (hasOverlay ? ['#3b82f6', ...overlayColors] : ['#3b82f6']);

    const options = {
      chart: {
        type: 'area',
        height: 350,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: timeRange === 'now' && !showComparisonData,
          easing: 'linear',
          dynamicAnimation: {
            enabled: true,
            speed: 1000
          }
        }
      },
      series: series,
      stroke: {
        curve: 'smooth',
        width: hasOverlay ? [2, ...overlayStrokeWidth] : 2,
        dashArray: hasOverlay ? [0, ...overlayDashArray] : 0,
        colors: colors
      },
      fill: {
        // Only ever paints the primary series -- overlay entries are
        // type: 'line' above, which combo charts never fill regardless of
        // this config.
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 90, 100]
        },
        colors: colors
      },
      dataLabels: { enabled: false },
      markers: {
        size: hasOverlay ? [0, ...overlayMarkerSize] : 0,
        hover: { size: 5 }
      },
      xaxis: {
        categories: categories,
        labels: {
          show: true,
          rotate: 0,
          style: {
            colors: '#86868b',
            fontSize: '11px'
          },
          formatter: function (value, timestamp, index) {
            const totalPoints = categories.length;
            if (totalPoints <= 20 || index % Math.ceil(totalPoints / 10) === 0) {
              return value;
            }
            return '';
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        title: {
          text: computedXAxisTitle,
          style: {
            color: '#86868b',
            fontSize: '12px',
            fontWeight: 400
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#86868b',
            fontSize: '11px'
          },
          formatter: function (value) {
            return value ? value.toFixed(3) + unit : '';
          }
        },
        title: {
          text: yAxisTitle,
          style: {
            color: '#86868b',
            fontSize: '12px',
            fontWeight: 400
          }
        },
        min: effMinValue ? Math.floor(effMinValue * 0.99) : undefined,
        max: effMaxValue ? Math.ceil(effMaxValue * 1.01) : undefined
      },
      grid: {
        borderColor: '#f1f1f1',
        strokeDashArray: 0,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
        padding: {
          top: 0,
          right: 20,
          bottom: 0,
          left: 10
        }
      },
      annotations: {
        yaxis: annotations
      },
      tooltip: {
        enabled: true,
        theme: 'light',
        x: { show: true },
        y: {
          formatter: function (value) {
            return value ? value.toFixed(3) + unit : '';
          },
          title: {
            formatter: (seriesName) => seriesName
          }
        },
        marker: { show: true }
      },
      legend: { show: false }
    };

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const chart = new ApexCharts(chartRef.current, options);
    chart.render();
    chartInstanceRef.current = chart;

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [timeRange, showComparisonData, unit, yAxisTitle, computedXAxisTitle, thresholds, chartRefConfig, dataType, apiTimestamps, labChartData, predictionDataType, predictionData, predictionName]);

  // Update chart data without re-rendering (for smooth updates)
  useEffect(() => {
    if (!chartInstanceRef.current) return;
    if (showComparisonData && (aiData.length === 0 || fieldData.length === 0)) return;
    if (!showComparisonData && chartData.length === 0) return;

    // Determine metric key for chart reference config
    const metricConfigKey = dataType === 'flow' ? 'flow_rate' : dataType;
    const metricConfig = chartRefConfig[metricConfigKey] || { enabled: false };

    // Use manual values if enabled, otherwise use calculated statistics
    const maxValue = metricConfig.enabled ? metricConfig.max : stats.maxValue;
    const minValue = metricConfig.enabled ? metricConfig.min : stats.minValue;
    const avgValue = metricConfig.enabled ? metricConfig.avg : stats.avgValue;

    // Include overlay values (lab + prediction) so they aren't clipped by the axis range
    const labVals = labChartData ? labChartData.filter(v => v != null) : [];
    const predictionVals = predictionDataType ? predictionData.filter(v => v != null) : [];
    const rangeVals = [maxValue, minValue, ...labVals, ...predictionVals].filter(v => v != null);
    const effMaxValue = rangeVals.length ? Math.max(...rangeVals) : undefined;
    const effMinValue = rangeVals.length ? Math.min(...rangeVals) : undefined;

    const annotations = [];
    if (thresholds.showMax && maxValue) {
      annotations.push({
        y: maxValue,
        borderColor: '#ef4444',
        strokeDashArray: 20,
        borderWidth: 1,
        label: { text: '' }
      });
    }
    if (thresholds.showAverage && avgValue) {
      annotations.push({
        y: avgValue,
        borderColor: '#d1d5db',
        strokeDashArray: 20,
        borderWidth: 1,
        label: { text: '' }
      });
    }
    if (thresholds.showMin && minValue) {
      annotations.push({
        y: minValue,
        borderColor: '#10b981',
        strokeDashArray: 20,
        borderWidth: 1,
        label: { text: '' }
      });
    }

    const series = showComparisonData
      ? [
          { name: 'Field Data', data: fieldData },
          { name: 'AI Data', data: aiData }
        ]
      : [
          { name: yAxisTitle, type: 'area', data: chartData },
          // type: 'line' suppresses the area fill for these overlays -- see
          // the matching comment in the chart-init effect above for why the
          // fill.opacity array alone isn't enough for a gradient fill.
          ...(labChartData ? [{ name: `Lab ${yAxisTitle}`, type: 'line', data: labChartData }] : []),
          ...(predictionDataType ? [{ name: predictionName, type: 'line', data: predictionData }] : [])
        ];

    const updatedCategories = apiTimestamps.length > 0
      ? apiTimestamps.map(ts => formatTS(ts))
      : undefined;

    chartInstanceRef.current.updateOptions({
      series: series,
      ...(updatedCategories ? { xaxis: { categories: updatedCategories } } : {}),
      yaxis: {
        min: effMinValue ? Math.floor(effMinValue * 0.99) : undefined,
        max: effMaxValue ? Math.ceil(effMaxValue * 1.01) : undefined
      },
      annotations: {
        yaxis: annotations
      }
    }, false, timeRange === 'now' && !showComparisonData);
  }, [chartData, aiData, fieldData, stats, showComparisonData, timeRange, yAxisTitle, thresholds, chartRefConfig, dataType, apiTimestamps, labChartData, predictionDataType, predictionData, predictionName]);

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
    setIsCustomRange(false);
  };

  const handleDatePickerOpen = (event) => {
    setDatePickerAnchor(event.currentTarget);
  };

  const handleDatePickerClose = () => {
    setDatePickerAnchor(null);
  };

  const handleApplyCustomRange = () => {
    setIsCustomRange(true);
    setTimeRange('custom');
    handleDatePickerClose();
  };

  const openDatePicker = Boolean(datePickerAnchor);

  return (
    <MainCard>
      {/* Header with Title and Date Picker */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: -4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<CalendarMonthIcon />}
          onClick={handleDatePickerOpen}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            borderColor: '#d2d2d7',
            color: '#86868b',
            '&:hover': {
              borderColor: '#86868b',
              backgroundColor: '#f5f5f7'
            }
          }}
        >
          {isCustomRange
            ? `${startDate.format('MMM DD, YYYY')} - ${endDate.format('MMM DD, YYYY')}`
            : 'Select Range'}
        </Button>

        <Popover
          open={openDatePicker}
          anchorEl={datePickerAnchor}
          onClose={handleDatePickerClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
        >
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { size: 'small' } }}
              />
            </LocalizationProvider>
            <Button
              variant="contained"
              size="small"
              onClick={handleApplyCustomRange}
              sx={{ textTransform: 'none' }}
            >
              Apply
            </Button>
          </Box>
        </Popover>
      </Box>

      {/* Legend Box - centered, similar to HistoryComparisonChart */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1 }}>
        {showComparisonData ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 15, height: 15, borderRadius: '10%', backgroundColor: '#53A1FF' }} />
              <Typography variant="caption" color="textSecondary">
                Field Data
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 15, height: 15, borderRadius: '10%', backgroundColor: '#8b5cf6' }} />
              <Typography variant="caption" color="textSecondary">
                AI Data
              </Typography>
            </Box>
          </>
        ) : (
          [
            ...legendItems,
            ...(labChartData ? [{ name: `Lab ${yAxisTitle}`, color: LAB_SERIES_COLOR }] : []),
            ...(predictionDataType ? [{ name: predictionName, color: PREDICTION_SERIES_COLOR }] : [])
          ].map((item) => (
            <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 15, height: 15, borderRadius: '10%', backgroundColor: item.color }} />
              <Typography variant="caption" color="textSecondary">
                {item.name}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      {/* Stats Cards - Only show when comparison is active */}
      {showComparisonData && statsData.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {statsData.map((stat, index) => (
            <Grid size={{ mt: 2, xs: 6, sm:3 }} key={index}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef'
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  {stat.title}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {stat.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Chart */}
      <div ref={chartRef}></div>

      {/* Time Range Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <ButtonGroup variant="outlined" size="small">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              onClick={() => handleTimeRangeChange(range.value)}
              sx={{
                px: 2,
                textTransform: 'none',
                borderColor: '#d2d2d7',
                color: timeRange === range.value ? '#fff' : '#86868b',
                backgroundColor: timeRange === range.value ? '#3b82f6' : 'transparent',
                '&:hover': {
                  borderColor: '#3b82f6',
                  backgroundColor: timeRange === range.value ? '#2563eb' : '#eff6ff'
                }
              }}
            >
              {range.label}
            </Button>
          ))}
        </ButtonGroup>
      </Box>
    </MainCard>
  );
};

RealTimeDataChart.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  dataType: PropTypes.oneOf(['dryness', 'ncg', 'tds', 'pressure', 'temperature', 'flow']),
  unit: PropTypes.string,
  yAxisTitle: PropTypes.string,
  xAxisTitle: PropTypes.string, // null = auto-computed from time range
  legendItems: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired
    })
  ),
  thresholds: PropTypes.shape({
    showMax: PropTypes.bool,
    showMin: PropTypes.bool,
    showAverage: PropTypes.bool
  }),
  showComparison: PropTypes.bool,
  fetchFromApi: PropTypes.bool,
  liveValue: PropTypes.number,
  labMetric: PropTypes.oneOf(['pressure', 'temperature', 'flow_rate', 'tds', 'dryness', 'ncg']),
  predictionDataType: PropTypes.oneOf(['tds_predicted']),
  predictionLiveValue: PropTypes.number,
  predictionName: PropTypes.string
};

export default RealTimeDataChart;
