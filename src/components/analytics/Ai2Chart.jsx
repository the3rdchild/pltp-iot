import React, { useEffect, useRef, useState, useCallback } from 'react';
import ApexCharts from 'apexcharts';
import { Box, Typography, Button, ButtonGroup } from '@mui/material';
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

const TIME_RANGES = [
  { value: 'now', label: 'Now' },
  { value: '1h', label: '1h' },
  { value: '1d', label: '1d' },
  { value: '7d', label: '7d' },
  { value: '1m', label: '1m' },
  { value: 'all', label: 'All' }
];

/**
 * Ai2Chart — like PTFChart but for a single ai2 metric.
 * - Seeds chart from /api/external/ai2?limit=N on mount / range change
 * - In "now" mode, appends liveValue when it changes (kept to 60 points max)
 */
const Ai2Chart = ({
  title = 'Real Time Data',
  subtitle = '',
  metric = 'dryness_predict', // 'dryness_predict' | 'ncg_predict'
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
      case '1m':
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      default:
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    }
  }, []);

  // Fetch historical data from DB
  const fetchHistory = useCallback(async (limit) => {
    setApiLoading(true);
    try {
      const res = await fetch(`${AI2_URL}?limit=${limit}`);
      const json = await res.json();
      if (json.success && json.data) {
        const rows = [...json.data].reverse(); // DB returns newest first, reverse for chronological
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

  // Fetch on mount and when timeRange changes
  useEffect(() => {
    dbFetchedRef.current = false;
    const limit = LIMIT_MAP[timeRange] || 60;

    fetchHistory(limit).then(result => {
      if (!result) return;
      dataRef.current = result.values.slice();
      timestampsRef.current = result.timestamps.slice();
      setChartData(result.values);
      setTimestamps(result.timestamps);
      dbFetchedRef.current = true;
    });
  }, [timeRange, fetchHistory]);

  // "Now" mode: append live value when it arrives
  useEffect(() => {
    if (timeRange !== 'now') return;
    if (!dbFetchedRef.current) return;
    if (liveValue == null) return;

    const keep = 60;
    const now = new Date().toISOString();
    const nextData = [...dataRef.current.slice(-(keep - 1)), liveValue];
    const nextTs = [...timestampsRef.current.slice(-(keep - 1)), now];

    dataRef.current = nextData;
    timestampsRef.current = nextTs;
    setChartData(nextData);
    setTimestamps(nextTs);
  }, [liveValue, timeRange]);

  // Smooth chart update without destroying instance
  useEffect(() => {
    if (!chartInstanceRef.current || chartData.length === 0) return;

    const categories = timestampsRef.current.map(ts => formatTimestamp(ts, timeRange));
    const vals = dataRef.current.filter(v => v != null);
    const minY = vals.length ? Math.min(...vals) : 0;
    const maxY = vals.length ? Math.max(...vals) : 100;

    chartInstanceRef.current.updateOptions(
      {
        xaxis: { categories },
        yaxis: { min: Math.floor(minY * 0.99), max: Math.ceil(maxY * 1.01) }
      },
      false,
      false
    );
    chartInstanceRef.current.updateSeries([{ name: yAxisTitle, data: dataRef.current }], true);
  }, [chartData, timeRange, yAxisTitle, formatTimestamp]);

  // Initialize chart on mount / timeRange change
  useEffect(() => {
    if (!chartRef.current) return;

    const initialData = chartData.length > 0 ? chartData : Array(60).fill(null);
    const categories =
      timestamps.length > 0
        ? timestamps.map(ts => formatTimestamp(ts, timeRange))
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
          enabled: timeRange === 'now',
          easing: 'linear',
          dynamicAnimation: { enabled: true, speed: 1000 }
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
          formatter: function (value, timestamp, index) {
            const total = categories.length;
            if (total <= 20 || index % Math.ceil(total / 10) === 0) return value;
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
  }, [timeRange]); // only recreate chart when range changes

  return (
    <MainCard>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, borderRadius: '3px', backgroundColor: color }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            {yAxisTitle}
          </Typography>
        </Box>
      </Box>

      {apiLoading && (
        <Box sx={{ textAlign: 'center', py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Loading chart data...
          </Typography>
        </Box>
      )}

      <div ref={chartRef} />

      {/* Time Range Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <ButtonGroup variant="outlined" size="small">
          {TIME_RANGES.map(range => (
            <Button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              sx={{
                px: 2,
                textTransform: 'none',
                borderColor: '#d2d2d7',
                color: timeRange === range.value ? '#fff' : '#86868b',
                backgroundColor: timeRange === range.value ? color : 'transparent',
                '&:hover': {
                  borderColor: color,
                  backgroundColor: timeRange === range.value ? color : '#eff6ff'
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
