import React, { useEffect, useRef, useState, useMemo } from 'react';
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

const PTFChart = ({
  title = 'PTF Real Time Data',
  subtitle = 'Pressure, Temperature, Flow data chart'
}) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const updateIntervalRef = useRef(null);
  const visibleCountRef = useRef(60); // number of visible points
  const pressureRef = useRef([]);
  const tempRef = useRef([]);
  const flowRef = useRef([]);

  const [timeRange, setTimeRange] = useState('now');
  const [pressureData, setPressureData] = useState([]);
  const [temperatureData, setTemperatureData] = useState([]);
  const [flowData, setFlowData] = useState([]);
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'year'));
  const [endDate, setEndDate] = useState(dayjs());
  const [isCustomRange, setIsCustomRange] = useState(false);

  // Time range buttons configuration
  const timeRanges = [
    { value: 'now', label: 'Now' },
    { value: '1h', label: '1h' },
    { value: '1d', label: '1d' },
    { value: '7d', label: '7d' },
    { value: '1m', label: '1m' },
    { value: '1y', label: '1y' },
    { value: '10y', label: '10y' }
  ];

  // Generate data based on time range
  useEffect(() => {
    const isYearlyRange = ['1y', '10y'].includes(timeRange) || isCustomRange;

    if (isYearlyRange) {
      // Use AI/Field data for yearly ranges
      const start = isCustomRange ? startDate.toDate() : dayjs().subtract(timeRange === '10y' ? 10 : 2.5, 'year').toDate();
      const end = isCustomRange ? endDate.toDate() : dayjs().toDate();

      const pData = generateAIData(start, end, 'pressure');
      const tData = generateAIData(start, end, 'temperature');
      const fData = generateAIData(start, end, 'flow');

      setPressureData(pData.map(d => d.value));
      setTemperatureData(tData.map(d => d.value));
      setFlowData(fData.map(d => d.value));
    } else if (timeRange !== 'now') {
      // Use real-time data for shorter ranges (1h, 1d, 7d, 1m)
      const pData = generateRealTimeChartData('pressure', timeRange);
      const tData = generateRealTimeChartData('temperature', timeRange);
      const fData = generateRealTimeChartData('flow', timeRange);

      setPressureData(pData);
      setTemperatureData(tData);
      setFlowData(fData);
    }
  }, [timeRange, isCustomRange, startDate, endDate]);

  // Initialize chart data
  useEffect(() => {
    // Clear any existing interval first
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }

    if (timeRange === 'now') {
      // ensure chart exists
      updateIntervalRef.current = setInterval(() => {
        if (!chartInstanceRef.current) return;

        // generate new data (generateRealTimeChartData may return new array or a single value)
        const newP = generateRealTimeChartData('pressure', 'now', pressureRef.current);
        const newT = generateRealTimeChartData('temperature', 'now', tempRef.current);
        const newF = generateRealTimeChartData('flow', 'now', flowRef.current);

        const keep = visibleCountRef.current || 60;

        // normalize returned values - support functions that return entire arrays or single new value
        const nextP = Array.isArray(newP) ? newP.slice(-keep) : [...pressureRef.current.slice(-keep + 1), newP];
        const nextT = Array.isArray(newT) ? newT.slice(-keep) : [...tempRef.current.slice(-keep + 1), newT];
        const nextF = Array.isArray(newF) ? newF.slice(-keep) : [...flowRef.current.slice(-keep + 1), newF];

        // update refs
        pressureRef.current = nextP;
        tempRef.current = nextT;
        flowRef.current = nextF;

        // Calculate dynamic Y-axis ranges based on current data
        const pressureMin = Math.min(...pressureRef.current);
        const pressureMax = Math.max(...pressureRef.current);
        const tempMin = Math.min(...tempRef.current);
        const tempMax = Math.max(...tempRef.current);
        const flowMin = Math.min(...flowRef.current);
        const flowMax = Math.max(...flowRef.current);

        // update chart series (fast, animated)
        chartInstanceRef.current.updateSeries([
          { name: 'Pressure (barg)', data: pressureRef.current },
          { name: 'Temperature (°C)', data: tempRef.current },
          { name: 'Flow (t/h)', data: flowRef.current }
        ], true);

        // update Y-axis ranges dynamically
        chartInstanceRef.current.updateOptions({
          yaxis: [
            {
              seriesName: 'Pressure (barg)',
              min: Math.floor(pressureMin * 0.95),
              max: Math.ceil(pressureMax * 1.05)
            },
            {
              seriesName: 'Temperature (°C)',
              min: Math.floor(tempMin * 0.95),
              max: Math.ceil(tempMax * 1.05)
            },
            {
              seriesName: 'Flow (t/h)',
              opposite: true,
              min: Math.floor(flowMin * 0.95),
              max: Math.ceil(flowMax * 1.05)
            }
          ]
        }, false, false);

        // keep React state in sync for other UI consumers (optional)
        setPressureData(pressureRef.current);
        setTemperatureData(tempRef.current);
        setFlowData(flowRef.current);
      }, 1000);

    } else {
      // not 'now' - leave refs alone (they'll be set by the init effect)
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, [timeRange]);


  // Initialize ApexCharts with dual Y-axes (only once or when config changes)
    useEffect(() => {
    if (!chartRef.current) return;

    const initialPressure = pressureData.length > 0 ? pressureData : Array(60).fill(1400);
    const initialTemp = temperatureData.length > 0 ? temperatureData : Array(60).fill(140);
    const initialFlow = flowData.length > 0 ? flowData : Array(60).fill(270);

    // number of visible points (keep for sliding behavior)
    visibleCountRef.current = initialPressure.length;
    pressureRef.current = initialPressure.slice();
    tempRef.current = initialTemp.slice();
    flowRef.current = initialFlow.slice();

    const categories = Array.from({ length: initialPressure.length }, (_, i) => `${i + 1}`);

    const pressureMin = Math.min(...initialPressure);
    const pressureMax = Math.max(...initialPressure);
    const tempMin = Math.min(...initialTemp);
    const tempMax = Math.max(...initialTemp);
    const flowMin = Math.min(...initialFlow);
    const flowMax = Math.max(...initialFlow);

    const options = {
      chart: {
        type: 'area',
        height: 400,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: timeRange === 'now',
          easing: 'linear',
          dynamicAnimation: {
            enabled: true,
            speed: 1000
          }
        }
      },
      series: [
        {
          name: 'Pressure (barg)',
          data: initialPressure
        },
        {
          name: 'Temperature (°C)',
          data: initialTemp
        },
        {
          name: 'Flow (t/h)',
          data: initialFlow
        }
      ],
      stroke: {
        curve: 'smooth',
        width: 2,
        colors: ['#3b82f6', '#ef4444', '#22c55e']
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 90, 100]
        },
        colors: ['#3b82f6', '#ef4444', '#22c55e']
      },
      dataLabels: { enabled: false },
      markers: {
        size: 0,
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
          text: 'Time x60',
          style: {
            color: '#86868b',
            fontSize: '12px',
            fontWeight: 400
          }
        }
      },
      yaxis: [
        {
          seriesName: 'Pressure (barg)',
          min: Math.floor(pressureMin * 0.95),
          max: Math.ceil(pressureMax * 1.05),
          labels: {
            style: { colors: '#86868b', fontSize: '11px' },
            formatter: function (value) {
              return value ? value.toFixed(0) + ' barg' : '';
            }
          },
          title: {
            text: 'Pressure (barg)',
            style: {
              color: '#3b82f6',
              fontSize: '12px',
              fontWeight: 400
            }
          }
        },
        {
          seriesName: 'Temperature (°C)',
          min: Math.floor(tempMin * 0.95),
          max: Math.ceil(tempMax * 1.05),
          labels: {
            style: { colors: '#86868b', fontSize: '11px' },
            formatter: function (value) {
              return value ? value.toFixed(0) + ' °C' : '';
            }
          },
          title: {
            text: 'Temperature (°C)',
            style: {
              color: '#ef4444',
              fontSize: '12px',
              fontWeight: 400
            }
          }
        },
        {
          seriesName: 'Flow (t/h)',
          opposite: true,
          min: Math.floor(flowMin * 0.95),
          max: Math.ceil(flowMax * 1.05),
          labels: {
            style: { colors: '#86868b', fontSize: '11px' },
            formatter: function (value) {
              return value ? value.toFixed(0) + ' t/h' : '';
            }
          },
          title: {
            text: 'Flow (t/h)',
            style: {
              color: '#22c55e',
              fontSize: '12px',
              fontWeight: 400
            }
          }
        }
      ],
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

      tooltip: {
        enabled: true,
        theme: 'light',
        shared: true,
        intersect: false,
        x: { show: true },
        y: {
          formatter: function (value, { seriesIndex }) {
            if (!value) return '';
            if (seriesIndex === 0) return value.toFixed(1) + ' barg';
            if (seriesIndex === 1) return value.toFixed(1) + ' °C';
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
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, [timeRange]);


  // Update chart data without re-rendering (for smooth updates)
  useEffect(() => {
    if (!chartInstanceRef.current) return;
    if (timeRange === 'now') return; // real-time tick updates handled by interval above
    if (pressureData.length === 0 || temperatureData.length === 0 || flowData.length === 0) return;

    // Update refs so later switching to 'now' has freshest buffer
    pressureRef.current = pressureData.slice();
    tempRef.current = temperatureData.slice();
    flowRef.current = flowData.slice();
    visibleCountRef.current = pressureRef.current.length;

    const pressureMin = Math.min(...pressureData);
    const pressureMax = Math.max(...pressureData);
    const tempMin = Math.min(...temperatureData);
    const tempMax = Math.max(...temperatureData);
    const flowMin = Math.min(...flowData);
    const flowMax = Math.max(...flowData);

    const categories = Array.from({ length: pressureData.length }, (_, i) => `${i + 1}`);

    // lighter update for non-now modes
    chartInstanceRef.current.updateOptions({
      xaxis: { categories },
      yaxis: [
        {
          seriesName: 'Pressure (barg)',
          min: Math.floor(pressureMin * 0.95),
          max: Math.ceil(pressureMax * 1.05)
        },
        {
          seriesName: 'Temperature (°C)',
          min: Math.floor(tempMin * 0.95),
          max: Math.ceil(tempMax * 1.05)
        },
        {
          seriesName: 'Flow (t/h)',
          opposite: true,
          min: Math.floor(flowMin * 0.95),
          max: Math.ceil(flowMax * 1.05)
        }
      ]
    }, false, true);

    chartInstanceRef.current.updateSeries([
      { name: 'Pressure (barg)', data: pressureRef.current },
      { name: 'Temperature (°C)', data: tempRef.current },
      { name: 'Flow (t/h)', data: flowRef.current }
    ], true);
  }, [pressureData, temperatureData, flowData, timeRange]);


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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
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

      {/* Legend */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, borderRadius: '3px', backgroundColor: '#3b82f6' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            Pressure
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, borderRadius: '3px', backgroundColor: '#ef4444' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            Temperature
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, borderRadius: '3px', backgroundColor: '#22c55e' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            Flow
          </Typography>
        </Box>
      </Box>

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

PTFChart.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string
};

export default PTFChart;
