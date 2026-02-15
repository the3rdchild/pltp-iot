import React, { useEffect, useRef, useState, useCallback } from 'react';
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
import { getChartData } from '../../utils/api';
import { generateRealTimeChartData } from '../../data/simulasi';
import { generateAIData } from '../../data/chartData';

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

  const [timeRange, setTimeRange] = useState('now');
  const [pressureData, setPressureData] = useState([]);
  const [temperatureData, setTemperatureData] = useState([]);
  const [flowData, setFlowData] = useState([]);
  const [timestamps, setTimestamps] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'year'));
  const [endDate, setEndDate] = useState(dayjs());
  const [isCustomRange, setIsCustomRange] = useState(false);

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
      default:
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    }
  }, []);

  // Fetch chart data from API for a given range
  const fetchChartFromAPI = useCallback(async (range) => {
    setApiLoading(true);
    try {
      const [pRes, tRes, fRes] = await Promise.all([
        getChartData('pressure', range),
        getChartData('temperature', range),
        getChartData('flow_rate', range)
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

  // Fetch data based on time range change
  useEffect(() => {
    // Clear any existing interval
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
    dbFetchedRef.current = false;

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
        const result = await fetchChartFromAPI('1h');
        if (result) {
          setPressureData(result.pressure);
          setTemperatureData(result.temperature);
          setFlowData(result.flow);
          setTimestamps(result.timestamps);
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
        fetchChartFromAPI(timeRange).then(result => {
          if (result) {
            setPressureData(result.pressure);
            setTemperatureData(result.temperature);
            setFlowData(result.flow);
            setTimestamps(result.timestamps);
          }
        });
      }
    } else if (timeRange === '1y' || isCustomRange) {
      // Use AI generated data for 1y/custom ranges
      const start = isCustomRange ? startDate.toDate() : dayjs().subtract(1, 'year').toDate();
      const end = isCustomRange ? endDate.toDate() : dayjs().toDate();

      const pData = generateAIData(start, end, 'pressure');
      const tData = generateAIData(start, end, 'temperature');
      const fData = generateAIData(start, end, 'flow');

      setPressureData(pData.map(d => d.value));
      setTemperatureData(tData.map(d => d.value));
      setFlowData(fData.map(d => d.value));
      setTimestamps(pData.map(d => d.timestamp || d.date));
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

    const keep = 60;
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
      yaxis: [
        { seriesName: 'Pressure (barg)', min: Math.floor(pMin * 0.95), max: Math.ceil(pMax * 1.05) },
        { seriesName: 'Temperature (\u00b0C)', min: Math.floor(tMin * 0.95), max: Math.ceil(tMax * 1.05) },
        { seriesName: 'Flow (t/h)', opposite: true, min: Math.floor(fMin * 0.95), max: Math.ceil(fMax * 1.05) }
      ]
    }, false, false);
  }, []);

  // Initialize/reinitialize ApexCharts when data or range changes
  useEffect(() => {
    if (!chartRef.current) return;
    if (pressureData.length === 0 && temperatureData.length === 0 && flowData.length === 0) return;

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

    const pressureMin = Math.min(...initialPressure.filter(v => v != null));
    const pressureMax = Math.max(...initialPressure.filter(v => v != null));
    const tempMin = Math.min(...initialTemp.filter(v => v != null));
    const tempMax = Math.max(...initialTemp.filter(v => v != null));
    const flowMin = Math.min(...initialFlow.filter(v => v != null));
    const flowMax = Math.max(...initialFlow.filter(v => v != null));

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
        { name: 'Flow (t/h)', data: initialFlow }
      ],
      stroke: {
        curve: 'smooth',
        width: 2,
        colors: ['#3b82f6', '#ef4444', '#22c55e']
      },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] },
        colors: ['#3b82f6', '#ef4444', '#22c55e']
      },
      dataLabels: { enabled: false },
      markers: { size: 0, hover: { size: 5 } },
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
      yaxis: [
        {
          seriesName: 'Pressure (barg)',
          min: Math.floor(pressureMin * 0.95),
          max: Math.ceil(pressureMax * 1.05),
          labels: {
            style: { colors: '#86868b', fontSize: '11px' },
            formatter: (v) => v ? v.toFixed(0) + ' barg' : ''
          },
          title: { text: 'Pressure (barg)', style: { color: '#3b82f6', fontSize: '12px', fontWeight: 400 } }
        },
        {
          seriesName: 'Temperature (\u00b0C)',
          min: Math.floor(tempMin * 0.95),
          max: Math.ceil(tempMax * 1.05),
          labels: {
            style: { colors: '#86868b', fontSize: '11px' },
            formatter: (v) => v ? v.toFixed(0) + ' \u00b0C' : ''
          },
          title: { text: 'Temperature (\u00b0C)', style: { color: '#ef4444', fontSize: '12px', fontWeight: 400 } }
        },
        {
          seriesName: 'Flow (t/h)',
          opposite: true,
          min: Math.floor(flowMin * 0.95),
          max: Math.ceil(flowMax * 1.05),
          labels: {
            style: { colors: '#86868b', fontSize: '11px' },
            formatter: (v) => v ? v.toFixed(0) + ' t/h' : ''
          },
          title: { text: 'Flow (t/h)', style: { color: '#22c55e', fontSize: '12px', fontWeight: 400 } }
        }
      ],
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
        x: { show: true },
        y: {
          formatter: (value, { seriesIndex }) => {
            if (!value) return '';
            if (seriesIndex === 0) return value.toFixed(1) + ' barg';
            if (seriesIndex === 1) return value.toFixed(1) + ' \u00b0C';
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
      // Don't destroy chart here - let the next render handle it
    };
  }, [pressureData, temperatureData, flowData, timestamps, timeRange, formatTimestamp]);

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
    setIsCustomRange(false);
  };

  const handleDatePickerOpen = (event) => setDatePickerAnchor(event.currentTarget);
  const handleDatePickerClose = () => setDatePickerAnchor(null);

  const handleApplyCustomRange = () => {
    setIsCustomRange(true);
    setTimeRange('custom');
    handleDatePickerClose();
  };

  const openDatePicker = Boolean(datePickerAnchor);

  return (
    <MainCard>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
        </Box>
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
              <DatePicker label="Start Date" value={startDate} onChange={(v) => setStartDate(v)} slotProps={{ textField: { size: 'small' } }} />
              <DatePicker label="End Date" value={endDate} onChange={(v) => setEndDate(v)} slotProps={{ textField: { size: 'small' } }} />
            </LocalizationProvider>
            <Button variant="contained" size="small" onClick={handleApplyCustomRange} sx={{ textTransform: 'none' }}>Apply</Button>
          </Box>
        </Popover>
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, borderRadius: '3px', backgroundColor: '#3b82f6' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.875rem' }}>Pressure</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, borderRadius: '3px', backgroundColor: '#ef4444' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.875rem' }}>Temperature</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, borderRadius: '3px', backgroundColor: '#22c55e' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.875rem' }}>Flow</Typography>
        </Box>
      </Box>

      {/* Loading indicator */}
      {apiLoading && (
        <Box sx={{ textAlign: 'center', py: 1 }}>
          <Typography variant="caption" color="text.secondary">Loading chart data...</Typography>
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
