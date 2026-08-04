import React, { useEffect, useMemo, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';
import { Box, Typography, Chip, Button, ButtonGroup, Popover, TextField } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PropTypes from 'prop-types';
import MainCard from '../MainCard';

const TIME_RANGES = [
  { value: 'now', label: 'Now', ms: 60 * 60 * 1000 },
  { value: '1h', label: '1h', ms: 60 * 60 * 1000 },
  { value: '1d', label: '1d', ms: 24 * 60 * 60 * 1000 },
  { value: '7d', label: '7d', ms: 7 * 24 * 60 * 60 * 1000 },
  { value: '1m', label: '1m', ms: 30 * 24 * 60 * 60 * 1000 },
  { value: '1y', label: '1y', ms: 365 * 24 * 60 * 60 * 1000 },
  { value: 'all', label: 'All', ms: null }
];

const RANGE_LABEL = {
  now: 'Real-time',
  '1h': 'Time Range: 1h',
  '1d': 'Time Range: 24 Hours',
  '7d': 'Time Range: 7 Days',
  '1m': 'Time Range: 30 Days',
  '1y': 'Time Range: 1 Year',
  all: 'Time Range: All',
  custom: 'Time Range: Custom'
};

const DEFAULT_LEGEND = [
  { name: 'Trend', color: '#3b82f6' },
  { name: 'Max', color: '#ef4444' },
  { name: 'Average', color: '#9ca3af' },
  { name: 'Min', color: '#22c55e' }
];

/**
 * RiskChart - risk-percentage chart shared by both AI risk charts.
 *
 * Deliberately dumb about meaning: it renders whatever series it is handed and
 * the caller owns the title/badge. That separation is the point of the rework -
 * the chart can no longer mislabel its own data as a prediction.
 *
 * Chrome (legend, max/avg/min guide lines, range selector) mirrors
 * RealTimeDataChart so the AI pages read the same as the sensor pages.
 */
const RiskChart = ({
  title,
  subtitle,
  badge,
  badgeColor = 'default',
  series,
  categories,
  timestamps = null,
  showRangeSelector = false,
  legendItems = DEFAULT_LEGEND,
  color = '#3b82f6',
  xAxisTitle,
  chartType = 'area',
  height = 340,
  emptyMessage = 'Belum ada data',
  footnote,
  yAxisMax,
  onRangeChange
}) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  const [range, setRange] = useState(showRangeSelector ? '1d' : 'all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Slice the incoming series down to the selected window. Done here rather
  // than in the page so both charts share one definition of "last 24h" --
  // UNLESS the caller passed onRangeChange, in which case the caller owns
  // fetching the right window itself (see prediction.jsx for ai1a: the old
  // client-side-only slicing here couldn't show more than whatever the
  // parent had already fetched once, so every range button rendered the same
  // ~1h of data regardless of which was selected).
  const view = useMemo(() => {
    if (onRangeChange || !showRangeSelector || !timestamps || timestamps.length !== series.length) {
      return { series, categories };
    }

    const times = timestamps.map((t) => new Date(t).getTime());
    let keep;

    if (range === 'custom') {
      const from = dateFrom ? new Date(dateFrom).getTime() : -Infinity;
      const to = dateTo ? new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 : Infinity;
      keep = (i) => times[i] >= from && times[i] <= to;
    } else {
      const cfg = TIME_RANGES.find((r) => r.value === range);
      if (!cfg?.ms) keep = () => true;
      else {
        // Anchor on the newest row, not Date.now(): the AI jobs run on their own
        // cadence, so a stale-but-valid history would otherwise render empty.
        const newest = Math.max(...times.filter((t) => !Number.isNaN(t)));
        const cutoff = newest - cfg.ms;
        keep = (i) => times[i] >= cutoff;
      }
    }

    const idx = series.map((_, i) => i).filter(keep);
    return { series: idx.map((i) => series[i]), categories: idx.map((i) => categories[i]) };
  }, [series, categories, timestamps, range, dateFrom, dateTo, showRangeSelector, onRangeChange]);

  const stats = useMemo(() => {
    const nums = view.series.filter((v) => v !== null && v !== undefined && !Number.isNaN(v));
    if (nums.length === 0) return null;
    return {
      max: Math.max(...nums),
      min: Math.min(...nums),
      avg: nums.reduce((a, b) => a + b, 0) / nums.length
    };
  }, [view.series]);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const legendColor = (name) => legendItems.find((l) => l.name === name)?.color;
    const guide = (value, name) =>
      value === undefined || value === null
        ? null
        : {
            y: value,
            borderColor: legendColor(name) || '#9ca3af',
            strokeDashArray: 6,
            opacity: 0.9
          };

    const annotations = stats
      ? [guide(stats.max, 'Max'), guide(stats.avg, 'Average'), guide(stats.min, 'Min')].filter(Boolean)
      : [];

    const options = {
      chart: {
        type: chartType,
        height,
        fontFamily: 'inherit',
        toolbar: { show: false },
        animations: { enabled: true, easing: 'easeinout', speed: 400 },
        zoom: { enabled: false }
      },
      series: [{ name: 'Risk %', data: view.series }],
      colors: [color],
      stroke: { curve: 'smooth', width: chartType === 'area' ? 2.5 : 3 },
      fill:
        chartType === 'area'
          ? {
              type: 'gradient',
              gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 95] }
            }
          : { opacity: 1 },
      markers: { size: 0, hover: { size: 5 } },
      dataLabels: { enabled: false },
      legend: { show: false },
      annotations: { yaxis: annotations },
      grid: { borderColor: '#eef0f4', strokeDashArray: 4, padding: { left: 12, right: 16 } },
      xaxis: {
        categories: view.categories,
        title: {
          text: xAxisTitle || RANGE_LABEL[range],
          style: { fontSize: '12px', color: '#8b93a7' }
        },
        labels: {
          rotate: -35,
          rotateAlways: false,
          hideOverlappingLabels: true,
          style: { fontSize: '11px', colors: '#8b93a7' }
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false }
      },
      yaxis: {
        min: 0,
        max: yAxisMax,
        forceNiceScale: yAxisMax === undefined,
        title: { text: 'Risk Percentage (%)', style: { fontSize: '12px', color: '#8b93a7' } },
        labels: {
          formatter: (v) => (v === null || v === undefined ? '' : `${v.toFixed(1)}%`),
          style: { fontSize: '11px', colors: '#8b93a7' }
        }
      },
      tooltip: {
        theme: 'light',
        y: { formatter: (v) => (v === null || v === undefined ? '-' : `${v.toFixed(2)}%`) }
      },
      noData: { text: emptyMessage, style: { color: '#8b93a7', fontSize: '13px' } }
    };

    chartRef.current = new ApexCharts(containerRef.current, options);
    chartRef.current.render();

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // Rebuilding on every change is cheap here: both series are small
    // (<= 60 observed rows, exactly 30 forecast points) and refresh slowly.
  }, [view, stats, color, chartType, height, xAxisTitle, emptyMessage, range, legendItems, yAxisMax]);

  const open = Boolean(anchorEl);

  return (
    <MainCard sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 1.5,
          mb: 1.5
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* legend */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {legendItems.map((item) => (
            <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: item.color }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {item.name}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {badge && <Chip label={badge} size="small" color={badgeColor} variant="outlined" sx={{ fontWeight: 600 }} />}
          {showRangeSelector && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<CalendarMonthIcon />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ textTransform: 'none', color: 'text.secondary', borderColor: '#e0e0e0' }}
            >
              Select Range
            </Button>
          )}
        </Box>
      </Box>

      <Box ref={containerRef} sx={{ width: '100%' }} />

      {showRangeSelector && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <ButtonGroup size="small" sx={{ '& .MuiButton-root': { textTransform: 'none', minWidth: 52 } }}>
            {TIME_RANGES.map((r) => (
              <Button
                key={r.value}
                onClick={() => {
                  setRange(r.value);
                  onRangeChange?.(r.value);
                }}
                variant={range === r.value ? 'contained' : 'outlined'}
                sx={{ color: range === r.value ? '#fff' : 'text.secondary', borderColor: '#e0e0e0' }}
              >
                {r.label}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      )}

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 240 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Rentang Kustom
          </Typography>
          <TextField
            label="Dari"
            type="date"
            size="small"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Sampai"
            type="date"
            size="small"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            variant="contained"
            size="small"
            sx={{ textTransform: 'none' }}
            onClick={() => {
              setRange('custom');
              setAnchorEl(null);
              onRangeChange?.('custom', { from: dateFrom, to: dateTo });
            }}
          >
            Terapkan
          </Button>
        </Box>
      </Popover>

      {footnote && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, lineHeight: 1.5 }}>
          {footnote}
        </Typography>
      )}
    </MainCard>
  );
};

RiskChart.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  badge: PropTypes.string,
  badgeColor: PropTypes.string,
  series: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  timestamps: PropTypes.array,
  showRangeSelector: PropTypes.bool,
  legendItems: PropTypes.array,
  color: PropTypes.string,
  xAxisTitle: PropTypes.string,
  chartType: PropTypes.string,
  height: PropTypes.number,
  emptyMessage: PropTypes.string,
  footnote: PropTypes.node,
  yAxisMax: PropTypes.number,
  onRangeChange: PropTypes.func
};

export default RiskChart;
