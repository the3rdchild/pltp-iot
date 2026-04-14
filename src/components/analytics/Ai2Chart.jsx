import React, { useEffect, useRef, useState, useCallback } from 'react';
import ApexCharts from 'apexcharts';
import { Box, Typography, Button, ButtonGroup, Popover } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import dayjs from 'dayjs';
import MainCard from '../MainCard';
import PropTypes from 'prop-types';

const AI2_URL = '/api/external/ai2';

const LIMIT_MAP = {
  now: 60,
  '1h': 60,
  '1d': 200,
  '7d': 500,
  '1m': 1000,
  all: 2000
};

const XAXIS_LABEL_MAP = {
  now:    'Real-time',
  '1h':   'Time Range: 1h',
  '1d':   'Time Range: 24 Hours',
  '7d':   'Time Range: 7 Days',
  '1m':   'Time Range: 30 Days',
  all:    'Time Range: All',
  custom: 'Time Range: Custom'
};

const TIME_RANGES = [
  { value: 'now', label: 'Now' },
  { value: '1h', label: '1h' },
  { value: '1d', label: '1d' },
  { value: '7d', label: '7d' },
  { value: '1m', label: '1m' },
  { value: 'all', label: 'All' }
];

/**
 * Ai2Chart — chart for a single ai2 metric (dryness_predict | ncg_predict).
 * - Seeds chart from /api/external/ai2 on mount / range change
 * - In "now" mode, appends liveValue when it changes (kept to 60 points max)
 * - Supports custom date range via date picker
 */
const Ai2Chart = ({
  title = 'Real Time Data',
  subtitle = '',
  metric = 'dryness_predict',
  liveValue = null,
  unit = '%',
  yAxisTitle = 'Value',
  color = '#3b82f6'
}) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const dataRef = useRef([]);
  const timestampsRef = useRef([]);
  const dbFetchedRef = useRef(false);

  const [timeRange, setTimeRange] = useState('now');
  const [chartData, setChartData] = useState([]);
  const [timestamps, setTimestamps] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);

  // Custom date range state
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'month'));
  const [endDate, setEndDate] = useState(dayjs());
  const [isCustomRange, setIsCustomRange] = useState(false);

  const formatTimestamp = useCallback((ts, range) => {
    if (!ts) return '';
    const d = new Date(ts);
    switch (range) {
      case 'now':
      case '1h':
      case '1d':
        return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      case '7d':
      case '1m':
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      default:
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    }
  }, []);

  // Fetch historical data — limit-based or date-range-based
  const fetchHistory = useCallback(async ({ limit, start, end } = {}) => {
    setApiLoading(true);
    try {
      let url;
      if (start && end) {
        const s = encodeURIComponent(start.toISOString());
        const e = encodeURIComponent(end.toISOString());
        url = `${AI2_URL}?start_date=${s}&end_date=${e}`;
      } else {
        url = `${AI2_URL}?limit=${limit ?? 60}`;
      }

      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        const rows = [...json.data].reverse(); // newest-first from DB → chronological
        return {
          values: rows.map(r => (r[metric] != null ? parseFloat(r[metric]) : null)),
          timestamps: rows.map(r => r.processed_at)
        };
      }
      return null;
    } catch (err) {
      console.error('Ai2Chart fetch error:', err);
      return null;
    } finally {
      setApiLoading(false);
    }
  }, [metric]);

  // Fetch on mount, range change, or custom range apply
  useEffect(() => {
    dbFetchedRef.current = false;

    const fetchParams = isCustomRange
      ? { start: startDate.toDate(), end: endDate.toDate() }
      : { limit: LIMIT_MAP[timeRange] || 60 };

    fetchHistory(fetchParams).then(result => {
      if (!result) return;
      dataRef.current = result.values.slice();
      timestampsRef.current = result.timestamps.slice();
      setChartData(result.values);
      setTimestamps(result.timestamps);
      dbFetchedRef.current = true;
    });
  }, [timeRange, isCustomRange, startDate, endDate, fetchHistory]);

  // Direct chart update (bypasses React state cycle — like PTFChart's updateChartSeries)
  const updateChartDirect = useCallback(() => {
    if (!chartInstanceRef.current) return;
    const activeRange = isCustomRange ? 'custom' : timeRange;
    const categories = timestampsRef.current.map(ts => formatTimestamp(ts, activeRange));
    const vals = dataRef.current.filter(v => v != null);
    const minY = vals.length ? Math.min(...vals) : 0;
    const maxY = vals.length ? Math.max(...vals) : 100;

    chartInstanceRef.current.updateOptions(
      {
        xaxis: { categories, title: { text: XAXIS_LABEL_MAP[activeRange] ?? activeRange } },
        yaxis: { min: Math.floor(minY * 0.99), max: Math.ceil(maxY * 1.01) }
      },
      false,
      false
    );
    chartInstanceRef.current.updateSeries([{ name: yAxisTitle, data: dataRef.current }], true);
  }, [isCustomRange, timeRange, yAxisTitle, formatTimestamp]);

  // "Now" mode: append live value and update chart directly (no React state cycle)
  useEffect(() => {
    if (timeRange !== 'now' || isCustomRange) return;
    if (!dbFetchedRef.current) return;
    if (liveValue == null) return;

    const keep = 60;
    const now = new Date().toISOString();
    dataRef.current = [...dataRef.current.slice(-(keep - 1)), liveValue];
    timestampsRef.current = [...timestampsRef.current.slice(-(keep - 1)), now];

    updateChartDirect();
  }, [liveValue, timeRange, isCustomRange, updateChartDirect]);

  // Smooth chart update for range/data changes (API fetch results)
  useEffect(() => {
    if (!chartInstanceRef.current || chartData.length === 0) return;
    updateChartDirect();
  }, [chartData, updateChartDirect]);

  // Initialize chart on mount / timeRange change
  useEffect(() => {
    if (!chartRef.current) return;

    const activeRange = isCustomRange ? 'custom' : timeRange;
    const initialData = chartData.length > 0 ? chartData : Array(60).fill(null);
    const categories =
      timestamps.length > 0
        ? timestamps.map(ts => formatTimestamp(ts, activeRange))
        : Array.from({ length: initialData.length }, (_, i) => `${i + 1}`);

    const vals = initialData.filter(v => v != null);
    const minY = vals.length ? Math.min(...vals) : 0;
    const maxY = vals.length ? Math.max(...vals) : 100;

    const options = {
      chart: {
        type: 'area',
        height: 350,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: timeRange === 'now' && !isCustomRange,
          easing: 'linear',
          dynamicAnimation: { enabled: false, speed: 1000 }
        }
      },
      series: [{ name: yAxisTitle, data: initialData }],
      stroke: { curve: 'smooth', width: 2, colors: [color] },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 90, 100] },
        colors: [color]
      },
      dataLabels: { enabled: false },
      markers: { size: 0, hover: { size: 5 } },
      xaxis: {
        categories,
        labels: {
          show: true,
          rotate: 0,
          style: { colors: '#86868b', fontSize: '11px' },
          formatter: function (value, _ts, index) {
            const total = categories.length;
            if (total <= 20 || index % Math.ceil(total / 10) === 0) return value;
            return '';
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        title: {
          text: XAXIS_LABEL_MAP[activeRange] ?? activeRange,
          style: { color: '#86868b', fontSize: '12px', fontWeight: 400 }
        }
      },
      yaxis: {
        min: Math.floor(minY * 0.99),
        max: Math.ceil(maxY * 1.01),
        labels: {
          style: { colors: '#86868b', fontSize: '11px' },
          formatter: v => (v != null ? v.toFixed(3) + unit : '')
        },
        title: {
          text: yAxisTitle,
          style: { color: '#86868b', fontSize: '12px', fontWeight: 400 }
        }
      },
      grid: {
        borderColor: '#f1f1f1',
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
        padding: { top: 0, right: 20, bottom: 0, left: 10 }
      },
      tooltip: {
        enabled: true,
        theme: 'light',
        x: { show: true },
        y: { formatter: v => (v != null ? v.toFixed(3) + unit : '') },
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
  }, [timeRange, isCustomRange]); // only recreate chart when range or mode changes

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setIsCustomRange(false);
  };

  const handleApplyCustomRange = () => {
    setIsCustomRange(true);
    setTimeRange('custom');
    setDatePickerAnchor(null);
  };

  const openDatePicker = Boolean(datePickerAnchor);

  return (
    <MainCard>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
        </Box>

        {/* Legend — centered */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 15, height: 15, borderRadius: '10%', backgroundColor: color }} />
            <Typography variant="caption" color="textSecondary">
              {yAxisTitle}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CalendarMonthIcon />}
            onClick={e => setDatePickerAnchor(e.currentTarget)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              borderColor: '#d2d2d7',
              color: '#86868b',
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
            onClose={() => setDatePickerAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={v => setStartDate(v)}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={v => setEndDate(v)}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </LocalizationProvider>
              <Button variant="contained" size="small" onClick={handleApplyCustomRange} sx={{ textTransform: 'none' }}>
                Apply
              </Button>
            </Box>
          </Popover>
        </Box>
      </Box>

      {apiLoading && (
        <Box sx={{ textAlign: 'center', py: 1 }}>
          <Typography variant="caption" color="text.secondary">Loading chart data...</Typography>
        </Box>
      )}

      <div ref={chartRef} />

      {/* Time Range Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <ButtonGroup variant="outlined" size="small">
          {TIME_RANGES.map(range => (
            <Button
              key={range.value}
              onClick={() => handleTimeRangeChange(range.value)}
              sx={{
                px: 2,
                textTransform: 'none',
                borderColor: '#d2d2d7',
                color: (timeRange === range.value && !isCustomRange) ? '#fff' : '#86868b',
                backgroundColor: (timeRange === range.value && !isCustomRange) ? color : 'transparent',
                '&:hover': {
                  borderColor: color,
                  backgroundColor: (timeRange === range.value && !isCustomRange) ? color : '#eff6ff'
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

Ai2Chart.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  metric: PropTypes.oneOf(['dryness_predict', 'ncg_predict']),
  liveValue: PropTypes.number,
  unit: PropTypes.string,
  yAxisTitle: PropTypes.string,
  color: PropTypes.string
};

export default Ai2Chart;
