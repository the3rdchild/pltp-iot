import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import ApexCharts from 'apexcharts';
import { Box, Typography, Button, ButtonGroup, Popover } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import dayjs from 'dayjs';
import MainCard from '../MainCard';
import PropTypes from 'prop-types';
import { getChartData, getLabComparison, syncHoneywellLiveData } from '../../utils/api';
import { alignLabSamplesToTimestamps } from '../../utils/labOverlay';
import { generateRealTimeChartData } from '../../data/simulasi';
import { generateAIData } from '../../data/chartData';
import { resolveCustomWindow, formatTimestampForSpan, ONE_YEAR_MS } from '../../utils/chartRange';

// Points kept on screen in 'now' mode. The 1h seed arrives at 12-second
// resolution (300 buckets), and only the newest slice of it is wanted here:
// 60 points is about the last twelve minutes, which is the span a real-time
// view is actually about. The live append then slides this same window.
const NOW_WINDOW_POINTS = 60;

// One definition of the three y-axes, used at creation AND on every update.
//
// It has to be shared: updateOptions replaces the `yaxis` branch wholesale, so
// the two update sites used to send bare {seriesName, min, max} objects and
// silently dropped the label formatters set at creation -- which is why the
// axes rendered raw floats like "175.000000" with no unit.
const buildYAxes = ({ labOverlayEnabled, pressure, temperature, flow }) => {
  const axis = (seriesName, color, range, opposite = false) => ({
    seriesName,
    ...(opposite && { opposite: true }),
    min: range.min,
    max: range.max,
    labels: {
      style: { colors: '#86868b', fontSize: '11px' },
      // Unit lives in the axis title, so tick labels carry the number only
      formatter: (v) => (v === null || v === undefined ? '' : v.toFixed(0))
    },
    title: { text: `${seriesName}`, style: { color, fontSize: '12px', fontWeight: 400 } }
  });

  return [
    axis(
      labOverlayEnabled ? ['Pressure (barg)', LAB_PRESSURE_NAME] : 'Pressure (barg)',
      '#3b82f6',
      pressure
    ),
    axis(
      labOverlayEnabled ? ['Temperature (\u00b0C)', LAB_TEMPERATURE_NAME] : 'Temperature (\u00b0C)',
      '#ef4444',
      temperature
    ),
    axis('Flow (t/h)', '#22c55e', flow, true)
  ];
};

// Padded range for one axis. Empty input yields a neutral 0-1 window rather
// than the Infinity that Math.min of an empty array produces.
const paddedRange = (values) => {
  const nums = values.filter((v) => v !== null && v !== undefined && Number.isFinite(v));
  if (nums.length === 0) return { min: 0, max: 1 };
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  return { min: Math.floor(lo * 0.95), max: Math.ceil(hi * 1.05) };
};

// Lab comparison overlay series (ground-truth lab samples, markers only)
const LAB_PRESSURE_NAME = 'Lab Pressure (barg)';
const LAB_TEMPERATURE_NAME = 'Lab Temperature (°C)';
const LAB_PRESSURE_COLOR = '#1e3a8a';
const LAB_TEMPERATURE_COLOR = '#9a3412';

const PTFChart = ({
  title = 'PTF Real Time Data',
  subtitle = 'Pressure, Temperature, Flow data chart',
  liveValues = {}
}) => {
  const location = useLocation();
  const isTestEnvironment = location.pathname.startsWith('/test');

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const updateIntervalRef = useRef(null);
  const visibleCountRef = useRef(60);
  const pressureRef = useRef([]);
  const tempRef = useRef([]);
  const flowRef = useRef([]);
  const timestampsRef = useRef([]);
  const dbFetchedRef = useRef(false);
  // Width of the sliding window in 'now' mode. Taken from the seed fetch
  // rather than hardcoded: /api/data/chart/:metric returns 300 points per
  // series, so a fixed 60 here would visibly snap the chart down to a fifth of
  // its length the instant the first live value landed.
  const nowBufferRef = useRef(NOW_WINDOW_POINTS);
  // Whether the seeded history has been handed to the chart yet. Distinct from
  // dbFetchedRef (the fetch finished) and from the ref being non-empty (the
  // placeholder makes it non-empty immediately).
  const nowSeedAppliedRef = useRef(false);

  const [timeRange, setTimeRange] = useState('now');
  const [pressureData, setPressureData] = useState([]);
  const [temperatureData, setTemperatureData] = useState([]);
  const [flowData, setFlowData] = useState([]);
  const [timestamps, setTimestamps] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'year'));
  const [endDate, setEndDate] = useState(dayjs());
  // Picker values while the popover is open; copied to startDate/endDate on Apply.
  const [draftStartDate, setDraftStartDate] = useState(startDate);
  const [draftEndDate, setDraftEndDate] = useState(endDate);
  const [isCustomRange, setIsCustomRange] = useState(false);
  // A fetched (non-'now') range that came back with no rows.
  const [emptyRange, setEmptyRange] = useState(false);
  const [labPressureSamples, setLabPressureSamples] = useState([]);
  const [labTemperatureSamples, setLabTemperatureSamples] = useState([]);

  const timeRanges = [
    { value: 'now', label: 'Now' },
    { value: '1h', label: '1h' },
    { value: '1d', label: '1d' },
    { value: '7d', label: '7d' },
    { value: '1m', label: '1m' },
    { value: '1y', label: '1y' },
    { value: 'all', label: 'All' }
  ];

  // Format timestamp for x-axis label based on range
  const formatTimestamp = useCallback((ts, range) => {
    if (!ts) return '';
    const d = new Date(ts);
    switch (range) {
      case 'now':
      case '1h':
        return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      case '1d':
        return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      case '7d':
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      case '1m':
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      case '1y':
      case 'all':
        return d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      case 'custom': {
        const win = resolveCustomWindow(startDate, endDate);
        return formatTimestampForSpan(ts, win.end - win.start);
      }
      default:
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    }
  }, [startDate, endDate]);

  // Fetch chart data from API for a given range. All three series share one
  // end_time anchor so their bucket grids line up. `win` {start, end} turns
  // the request into range=custom (1y button and the Select Range picker).
  const fetchChartFromAPI = useCallback(async (range, win) => {
    setApiLoading(true);
    try {
      const endTime = (win?.end ?? new Date()).toISOString();
      const startTime = win?.start?.toISOString();
      const apiRange = win ? 'custom' : range;
      const [pRes, tRes, fRes] = await Promise.all([
        getChartData('pressure', apiRange, endTime, startTime),
        getChartData('temperature', apiRange, endTime, startTime),
        getChartData('flow_rate', apiRange, endTime, startTime)
      ]);

      const pChart = pRes?.data?.chart || [];
      const tChart = tRes?.data?.chart || [];
      const fChart = fRes?.data?.chart || [];

      // Use the longest array's timestamps as reference
      const refChart = [pChart, tChart, fChart].reduce((a, b) => a.length >= b.length ? a : b);
      const ts = refChart.map(p => p.timestamp);

      const pVals = pChart.map(p => p.avg);
      const tVals = tChart.map(p => p.avg);
      const fVals = fChart.map(p => p.avg);

      return { timestamps: ts, pressure: pVals, temperature: tVals, flow: fVals };
    } catch (err) {
      console.error('Error fetching chart data from API:', err);
      return null;
    } finally {
      setApiLoading(false);
    }
  }, []);

  // Fetch lab comparison samples once (production only); overlaid as markers
  // aligned to the chart's sampling-time buckets on non-'now' ranges.
  useEffect(() => {
    if (isTestEnvironment) return;
    let cancelled = false;
    const fetchLabSamples = async () => {
      try {
        const [pRes, tRes] = await Promise.all([
          getLabComparison('pressure'),
          getLabComparison('temperature')
        ]);
        if (cancelled) return;
        setLabPressureSamples(pRes?.data?.samples || []);
        setLabTemperatureSamples(tRes?.data?.samples || []);
      } catch (err) {
        console.error('Error fetching lab comparison data:', err);
      }
    };
    fetchLabSamples();
    return () => { cancelled = true; };
  }, [isTestEnvironment]);

  // Lab overlay is only meaningful for historical ranges; 'now' mode is a
  // live sliding window with no lab data, so it keeps exactly 3 series.
  const labOverlayEnabled = !isTestEnvironment && timeRange !== 'now';

  const labPressureData = useMemo(
    () => (labOverlayEnabled && timestamps.length > 0
      ? alignLabSamplesToTimestamps(timestamps, labPressureSamples)
      : []),
    [labOverlayEnabled, timestamps, labPressureSamples]
  );
  const labTemperatureData = useMemo(
    () => (labOverlayEnabled && timestamps.length > 0
      ? alignLabSamplesToTimestamps(timestamps, labTemperatureSamples)
      : []),
    [labOverlayEnabled, timestamps, labTemperatureSamples]
  );

  // Fetch data based on time range change
  useEffect(() => {
    // Clear any existing interval
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
    dbFetchedRef.current = false;
    nowSeedAppliedRef.current = false;
    setEmptyRange(false);

    // Hand a fetched non-'now' result to the chart, flagging an empty window
    // so the previous range's lines don't stay up as if they belonged to it.
    const applyFetched = (result) => {
      if (!result) return;
      setPressureData(result.pressure);
      setTemperatureData(result.temperature);
      setFlowData(result.flow);
      setTimestamps(result.timestamps);
      setEmptyRange(result.pressure.length === 0 && result.temperature.length === 0 && result.flow.length === 0);
    };

    if (timeRange === 'now') {
      // "Now" mode: fetch latest DB data once, then update with live values
      const initNowMode = async () => {
        if (isTestEnvironment) {
          // Test environment: use simulated data
          const pData = generateRealTimeChartData('pressure', '1h');
          const tData = generateRealTimeChartData('temperature', '1h');
          const fData = generateRealTimeChartData('flow', '1h');
          setPressureData(pData);
          setTemperatureData(tData);
          setFlowData(fData);
          setTimestamps(Array.from({ length: pData.length }, (_, i) => `${i + 1}`));
          return;
        }

        // Production: fetch last 1h data from DB as initial seed
        let result = await fetchChartFromAPI('1h');

        // Nothing in the database for the last hour. Ask the backend to pull
        // the newest readings straight from Honeywell, then try once more.
        //
        // Only ever attempted once per range selection: the sync endpoint is
        // throttled server-side, and a genuinely idle plant would otherwise
        // turn every page view into a retry loop. If it still comes back
        // empty, an empty chart is the honest answer.
        if (!result || result.pressure.length === 0) {
          try {
            await syncHoneywellLiveData();
            result = await fetchChartFromAPI('1h');
          } catch (err) {
            console.error('Honeywell fallback sync failed:', err);
          }
        }

        if (result && result.pressure.length > 0) {
          // Newest slice only. The endpoint returns 300 buckets for an hour;
          // keeping all of them would leave the live append needing hundreds of
          // ticks to work through the history before the window truly moved.
          const tail = (arr) => arr.slice(-NOW_WINDOW_POINTS);
          setPressureData(tail(result.pressure));
          setTemperatureData(tail(result.temperature));
          setFlowData(tail(result.flow));
          setTimestamps(tail(result.timestamps));
          nowBufferRef.current = NOW_WINDOW_POINTS;
          dbFetchedRef.current = true;
        }
      };
      initNowMode();
    } else if (['1h', '1d', '7d', '1m', 'all'].includes(timeRange) && !isCustomRange) {
      // Fetch from API for standard ranges
      if (isTestEnvironment) {
        // Test: use generated data
        const pData = generateRealTimeChartData('pressure', timeRange);
        const tData = generateRealTimeChartData('temperature', timeRange);
        const fData = generateRealTimeChartData('flow', timeRange);
        setPressureData(pData);
        setTemperatureData(tData);
        setFlowData(fData);
        setTimestamps(Array.from({ length: pData.length }, (_, i) => `${i + 1}`));
      } else {
        fetchChartFromAPI(timeRange).then(applyFetched);
      }
    } else if (timeRange === '1y' || isCustomRange) {
      const end = new Date();
      const win = isCustomRange
        ? resolveCustomWindow(startDate, endDate)
        : { start: new Date(end.getTime() - ONE_YEAR_MS), end };

      if (isTestEnvironment) {
        // Test: use generated data
        const pData = generateAIData(win.start, win.end, 'pressure');
        const tData = generateAIData(win.start, win.end, 'temperature');
        const fData = generateAIData(win.start, win.end, 'flow');

        setPressureData(pData.map(d => d.value));
        setTemperatureData(tData.map(d => d.value));
        setFlowData(fData.map(d => d.value));
        setTimestamps(pData.map(d => d.timestamp || d.date));
      } else {
        fetchChartFromAPI(timeRange, win).then(applyFetched);
      }
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, [timeRange, isCustomRange, startDate, endDate, isTestEnvironment, fetchChartFromAPI]);

  // "Now" mode: append live values from HW every ~3s
  useEffect(() => {
    if (timeRange !== 'now') return;
    if (isTestEnvironment) {
      // Test environment: simulate real-time with interval
      updateIntervalRef.current = setInterval(() => {
        if (!chartInstanceRef.current) return;
        const keep = 60;
        const newP = generateRealTimeChartData('pressure', 'now', pressureRef.current);
        const newT = generateRealTimeChartData('temperature', 'now', tempRef.current);
        const newF = generateRealTimeChartData('flow', 'now', flowRef.current);

        const nextP = Array.isArray(newP) ? newP.slice(-keep) : [...pressureRef.current.slice(-keep + 1), newP];
        const nextT = Array.isArray(newT) ? newT.slice(-keep) : [...tempRef.current.slice(-keep + 1), newT];
        const nextF = Array.isArray(newF) ? newF.slice(-keep) : [...flowRef.current.slice(-keep + 1), newF];

        pressureRef.current = nextP;
        tempRef.current = nextT;
        flowRef.current = nextF;

        updateChartSeries();
        setPressureData(nextP);
        setTemperatureData(nextT);
        setFlowData(nextF);
      }, 1000);
      return () => clearInterval(updateIntervalRef.current);
    }

    // Production: no interval needed, live values come via props
    return;
  }, [timeRange, isTestEnvironment]);

  // Production "Now" mode: append live values when they change
  useEffect(() => {
    if (timeRange !== 'now' || isTestEnvironment) return;
    if (!dbFetchedRef.current) return;

    const pVal = liveValues.pressure;
    const tVal = liveValues.temperature;
    const fVal = liveValues.flow_rate;

    if (pVal == null && tVal == null && fVal == null) return;

    const keep = nowBufferRef.current;
    const now = new Date().toISOString();

    const nextP = [...pressureRef.current.slice(-(keep - 1)), pVal ?? pressureRef.current[pressureRef.current.length - 1]];
    const nextT = [...tempRef.current.slice(-(keep - 1)), tVal ?? tempRef.current[tempRef.current.length - 1]];
    const nextF = [...flowRef.current.slice(-(keep - 1)), fVal ?? flowRef.current[flowRef.current.length - 1]];
    const nextTs = [...timestampsRef.current.slice(-(keep - 1)), now];

    pressureRef.current = nextP;
    tempRef.current = nextT;
    flowRef.current = nextF;
    timestampsRef.current = nextTs;

    setPressureData(nextP);
    setTemperatureData(nextT);
    setFlowData(nextF);
    setTimestamps(nextTs);

    updateChartSeries();
  }, [liveValues.pressure, liveValues.temperature, liveValues.flow_rate, timeRange, isTestEnvironment]);

  // Helper to update chart series and y-axis
  const updateChartSeries = useCallback(() => {
    if (!chartInstanceRef.current) return;

    const pMin = Math.min(...pressureRef.current.filter(v => v != null));
    const pMax = Math.max(...pressureRef.current.filter(v => v != null));
    const tMin = Math.min(...tempRef.current.filter(v => v != null));
    const tMax = Math.max(...tempRef.current.filter(v => v != null));
    const fMin = Math.min(...flowRef.current.filter(v => v != null));
    const fMax = Math.max(...flowRef.current.filter(v => v != null));

    chartInstanceRef.current.updateSeries([
      { name: 'Pressure (barg)', data: pressureRef.current },
      { name: 'Temperature (\u00b0C)', data: tempRef.current },
      { name: 'Flow (t/h)', data: flowRef.current }
    ], true);

    chartInstanceRef.current.updateOptions({
      yaxis: buildYAxes({
        // 'now' never carries the lab overlay, and this path only runs there.
        labOverlayEnabled: false,
        pressure: paddedRange(pressureRef.current),
        temperature: paddedRange(tempRef.current),
        flow: paddedRange(flowRef.current)
      })
    }, false, false);
  }, []);

  // Initialize/reinitialize ApexCharts when data or range changes
  useEffect(() => {
    if (!chartRef.current) return;
    // For "now" mode, create chart immediately with placeholder data
    // For other modes, wait for real data before creating chart
    if (timeRange !== 'now' && pressureData.length === 0 && temperatureData.length === 0 && flowData.length === 0) return;

    const initialPressure = pressureData.length > 0 ? pressureData : Array(60).fill(0);
    const initialTemp = temperatureData.length > 0 ? temperatureData : Array(60).fill(0);
    const initialFlow = flowData.length > 0 ? flowData : Array(60).fill(0);

    visibleCountRef.current = initialPressure.length;
    pressureRef.current = initialPressure.slice();
    tempRef.current = initialTemp.slice();
    flowRef.current = initialFlow.slice();
    timestampsRef.current = timestamps.slice();

    const categories = timestamps.length > 0
      ? timestamps.map(ts => formatTimestamp(ts, timeRange))
      : Array.from({ length: initialPressure.length }, (_, i) => `${i + 1}`);

    const labP = labOverlayEnabled ? labPressureData : [];
    const labT = labOverlayEnabled ? labTemperatureData : [];

    const pressureVals = [...initialPressure.filter(v => v != null), ...labP.filter(v => v != null)];
    const tempVals = [...initialTemp.filter(v => v != null), ...labT.filter(v => v != null)];
    const flowVals = initialFlow.filter(v => v != null);
    const pressureMin = pressureVals.length ? Math.min(...pressureVals) : 0;
    const pressureMax = pressureVals.length ? Math.max(...pressureVals) : 0;
    const tempMin = tempVals.length ? Math.min(...tempVals) : 0;
    const tempMax = tempVals.length ? Math.max(...tempVals) : 0;
    const flowMin = flowVals.length ? Math.min(...flowVals) : 0;
    const flowMax = flowVals.length ? Math.max(...flowVals) : 0;

    const options = {
      chart: {
        type: 'area',
        height: 400,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: timeRange === 'now',
          easing: 'linear',
          dynamicAnimation: { enabled: true, speed: 1000 }
        }
      },
      series: [
        { name: 'Pressure (barg)', data: initialPressure },
        { name: 'Temperature (\u00b0C)', data: initialTemp },
        { name: 'Flow (t/h)', data: initialFlow },
        // Lab samples: markers only (stroke width 0), bound to the same y-axes
        ...(labOverlayEnabled
          ? [
              { name: LAB_PRESSURE_NAME, data: labP },
              { name: LAB_TEMPERATURE_NAME, data: labT }
            ]
          : [])
      ],
      stroke: {
        curve: 'smooth',
        width: labOverlayEnabled ? [2, 2, 2, 0, 0] : 2,
        colors: labOverlayEnabled
          ? ['#3b82f6', '#ef4444', '#22c55e', LAB_PRESSURE_COLOR, LAB_TEMPERATURE_COLOR]
          : ['#3b82f6', '#ef4444', '#22c55e']
      },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] },
        colors: labOverlayEnabled
          ? ['#3b82f6', '#ef4444', '#22c55e', LAB_PRESSURE_COLOR, LAB_TEMPERATURE_COLOR]
          : ['#3b82f6', '#ef4444', '#22c55e']
      },
      dataLabels: { enabled: false },
      markers: { size: labOverlayEnabled ? [0, 0, 0, 6, 6] : 0, hover: { size: 5 } },
      xaxis: {
        categories,
        labels: {
          show: true,
          rotate: 0,
          style: { colors: '#86868b', fontSize: '11px' },
          formatter: function (value, timestamp, index) {
            const totalPoints = categories.length;
            if (totalPoints <= 20 || index % Math.ceil(totalPoints / 10) === 0) return value;
            return '';
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        title: {
          text: timeRange === 'now' ? 'Real-time' : `Time Range: ${timeRange}`,
          style: { color: '#86868b', fontSize: '12px', fontWeight: 400 }
        }
      },
      yaxis: buildYAxes({
        labOverlayEnabled,
        pressure: { min: Math.floor(pressureMin * 0.95), max: Math.ceil(pressureMax * 1.05) },
        temperature: { min: Math.floor(tempMin * 0.95), max: Math.ceil(tempMax * 1.05) },
        flow: { min: Math.floor(flowMin * 0.95), max: Math.ceil(flowMax * 1.05) }
      }),
      grid: {
        borderColor: '#f1f1f1',
        strokeDashArray: 0,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
        padding: { top: 0, right: 20, bottom: 0, left: 10 }
      },
      tooltip: {
        enabled: true,
        theme: 'light',
        shared: true,
        intersect: false,
        // Per-series `markers.size` (the array form just below/above, used
        // only while the lab overlay is on) makes ApexCharts anchor the
        // tooltip to a marker, and it then stops tracking the pointer.
        // Confirmed by range: on 'now' the overlay is off, `markers.size` is
        // the scalar 0, and the tooltip tracks correctly; on 1h/1d and wider
        // it is an array and the tooltip sticks. The five charts in this
        // folder that never use the array form were never affected.
        followCursor: true,
        x: { show: true },
        y: {
          formatter: (value, { seriesIndex, w }) => {
            if (!value) return '';
            const seriesName = w?.globals?.seriesNames?.[seriesIndex] || '';
            if (seriesName.includes('Pressure')) return value.toFixed(1) + ' barg';
            if (seriesName.includes('Temperature')) return value.toFixed(1) + ' \u00b0C';
            return value.toFixed(1) + ' t/h';
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
  }, [timeRange]); // Only recreate chart when timeRange changes

  // Separate effect to update data smoothly without destroying chart
  useEffect(() => {
    if (!chartInstanceRef.current) return;
    if (emptyRange) {
      chartInstanceRef.current.updateSeries([
        { name: 'Pressure (barg)', data: [] },
        { name: 'Temperature (\u00b0C)', data: [] },
        { name: 'Flow (t/h)', data: [] }
      ]);
      return;
    }
    if (pressureData.length === 0 || temperatureData.length === 0 || flowData.length === 0) return;

    // For "now" mode the seed must land exactly once, and live updates own the
    // series from then on.
    //
    // This used to test `pressureRef.current.length > 0`, which was already
    // true before the seed arrived: the chart is created up front with a
    // placeholder array and line 'pressureRef.current = initialPressure' copies
    // it straight into the ref. Combined with dbFetchedRef -- set by the seed
    // fetch itself -- the guard fired on the very update meant to apply the
    // seed, so the fetched hour was discarded and the chart kept the
    // placeholder, filling in one live value at a time from the right.
    if (timeRange === 'now' && nowSeedAppliedRef.current) return;

    // Update refs
    pressureRef.current = pressureData.slice();
    tempRef.current = temperatureData.slice();
    flowRef.current = flowData.slice();
    timestampsRef.current = timestamps.slice();

    // Update categories
    const categories = timestamps.length > 0
      ? timestamps.map(ts => formatTimestamp(ts, timeRange))
      : Array.from({ length: pressureData.length }, (_, i) => `${i + 1}`);

    // Calculate dynamic ranges (lab values included so markers aren't clipped)
    const pressureVals = [...pressureData.filter(v => v != null), ...labPressureData.filter(v => v != null)];
    const tempVals = [...temperatureData.filter(v => v != null), ...labTemperatureData.filter(v => v != null)];
    const flowVals = flowData.filter(v => v != null);
    const pressureMin = pressureVals.length ? Math.min(...pressureVals) : 0;
    const pressureMax = pressureVals.length ? Math.max(...pressureVals) : 0;
    const tempMin = tempVals.length ? Math.min(...tempVals) : 0;
    const tempMax = tempVals.length ? Math.max(...tempVals) : 0;
    const flowMin = flowVals.length ? Math.min(...flowVals) : 0;
    const flowMax = flowVals.length ? Math.max(...flowVals) : 0;

    // Smooth update: update series and axis without destroying chart
    chartInstanceRef.current.updateOptions({
      xaxis: { categories },
      yaxis: buildYAxes({
        labOverlayEnabled,
        pressure: paddedRange(pressureVals),
        temperature: paddedRange(tempVals),
        flow: paddedRange(flowVals)
      })
    }, false, false);

    // From here the seed is on screen; live appends own the series after this.
    if (timeRange === 'now') nowSeedAppliedRef.current = true;

    chartInstanceRef.current.updateSeries([
      { name: 'Pressure (barg)', data: pressureData },
      { name: 'Temperature (\u00b0C)', data: temperatureData },
      { name: 'Flow (t/h)', data: flowData },
      ...(labOverlayEnabled
        ? [
            { name: LAB_PRESSURE_NAME, data: labPressureData },
            { name: LAB_TEMPERATURE_NAME, data: labTemperatureData }
          ]
        : [])
    ], true); // animate: true for smooth transition
  }, [pressureData, temperatureData, flowData, timestamps, timeRange, formatTimestamp, labOverlayEnabled, labPressureData, labTemperatureData, emptyRange]);

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
    setIsCustomRange(false);
  };

  const handleDatePickerOpen = (event) => {
    setDraftStartDate(startDate);
    setDraftEndDate(endDate);
    setDatePickerAnchor(event.currentTarget);
  };
  const handleDatePickerClose = () => setDatePickerAnchor(null);

  const handleApplyCustomRange = () => {
    setStartDate(draftStartDate);
    setEndDate(draftEndDate);
    setIsCustomRange(true);
    setTimeRange('custom');
    handleDatePickerClose();
  };

  const isDraftRangeValid = Boolean(
    draftStartDate?.isValid?.() && draftEndDate?.isValid?.() && !draftStartDate.isAfter(draftEndDate, 'day')
  );

  const openDatePicker = Boolean(datePickerAnchor);

  return (
    <MainCard>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
        </Box>

        {/* Legend — centered */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 15, height: 15, borderRadius: '10%', backgroundColor: '#3b82f6' }} />
            <Typography variant="caption" color="textSecondary">Pressure</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 15, height: 15, borderRadius: '10%', backgroundColor: '#ef4444' }} />
            <Typography variant="caption" color="textSecondary">Temperature</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 15, height: 15, borderRadius: '10%', backgroundColor: '#22c55e' }} />
            <Typography variant="caption" color="textSecondary">Flow</Typography>
          </Box>
          {labOverlayEnabled && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 15, height: 15, borderRadius: '10%', backgroundColor: LAB_PRESSURE_COLOR }} />
                <Typography variant="caption" color="textSecondary">Lab Pressure</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 15, height: 15, borderRadius: '10%', backgroundColor: LAB_TEMPERATURE_COLOR }} />
                <Typography variant="caption" color="textSecondary">Lab Temperature</Typography>
              </Box>
            </>
          )}
        </Box>

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CalendarMonthIcon />}
            onClick={handleDatePickerOpen}
            sx={{
              borderRadius: 2, textTransform: 'none', borderColor: '#d2d2d7', color: '#86868b',
              '&:hover': { borderColor: '#86868b', backgroundColor: '#f5f5f7' }
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
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker label="Start Date" value={draftStartDate} onChange={(v) => setDraftStartDate(v)} disableFuture slotProps={{ textField: { size: 'small' } }} />
                <DatePicker label="End Date" value={draftEndDate} onChange={(v) => setDraftEndDate(v)} disableFuture slotProps={{ textField: { size: 'small' } }} />
              </LocalizationProvider>
              <Button variant="contained" size="small" disabled={!isDraftRangeValid} onClick={handleApplyCustomRange} sx={{ textTransform: 'none' }}>Apply</Button>
            </Box>
          </Popover>
        </Box>
      </Box>

      {/* Loading indicator */}
      {apiLoading && (
        <Box sx={{ textAlign: 'center', py: 1 }}>
          <Typography variant="caption" color="text.secondary">Loading chart data...</Typography>
        </Box>
      )}
      {!apiLoading && emptyRange && (
        <Box sx={{ textAlign: 'center', py: 1 }}>
          <Typography variant="caption" color="text.secondary">Tidak ada data pada rentang waktu yang dipilih</Typography>
        </Box>
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
                px: 2, textTransform: 'none', borderColor: '#d2d2d7',
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

PTFChart.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  liveValues: PropTypes.object
};

export default PTFChart;
