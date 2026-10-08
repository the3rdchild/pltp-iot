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
import { resolveCustomWindow, formatTimestampForSpan } from '../../utils/chartRange';

const AI2_URL = '/api/external/ai2';

// Real calendar lookback per range button, used to build start_date/end_date
// for GET /api/external/ai2 -- NOT a row-count limit. The previous LIMIT_MAP
// (fixed row counts like 200 for '1d') didn't actually cover a real day at
// ai2's ~60s cadence (200 rows is ~3.3h), so "1d" never showed a real day.
// ai2 writes about one row per minute, so refetching twice a minute keeps
// the non-'now' ranges current without hammering the endpoint.
const AI2_POLL_MS = 30000;

// Number of buckets requested from the API for every range except 'now'.
// ai2 writes ~1 row/min, so '1m' used to pull ~43k raw rows (and 'all' pulled
// five years of them) for a chart a few hundred pixels wide -- that download
// plus the ApexCharts render is what made these pages crawl. The server now
// aggregates the window into this many min/avg/max buckets instead.
//
// 'now' is deliberately excluded: that mode is the live data viewer and still
// reads raw rows, exactly as before.
//
// 300 rather than 60: the limit that matters is the chart's pixel width, not a
// round number. At ~2-4 CSS pixels per point a full-width chart resolves about
// this many, and since every bucket carries min/avg/max, more buckets only ever
// means narrower ones — the sampling gets sharper, not blurrier. Still a ~144x
// cut against the 43k raw rows a '1m' window used to ship.
const CHART_POINTS = 300;

// Floor for the sliding buffer in 'now' mode. The seed decides the real size
// (see nowBufferRef); this only matters when the seed came back short.
const NOW_BUFFER_MIN = 60;

const RANGE_DURATION_MS = {
  now: 60 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '1m': 30 * 24 * 60 * 60 * 1000,
  all: 5 * 365 * 24 * 60 * 60 * 1000
};

// Target number of x-axis labels to show per range -- e.g. roughly hourly
// ticks across a 1-day window, roughly daily ticks across a 7-day window.
const TICK_TARGET_MAP = {
  now: 12,
  '1h': 12,
  '1d': 24,
  '7d': 7,
  '1m': 10,
  all: 10,
  custom: 10
};

// Blank out the labels between ticks, keeping the array length (and so the
// data alignment) intact.
//
// This is done to the categories array rather than inside
// xaxis.labels.formatter on purpose: the formatter's third argument is NOT a
// plain index across ApexCharts versions (it's an opts object), so
// index-based thinning inside it silently does nothing and every label
// renders on top of its neighbours. Thinning here is deterministic and
// applies identically on first render and on every later updateOptions call.
// Counts BACKWARDS from the newest point so the latest timestamp always keeps
// its label; anchoring forward left the final points unlabeled, making a
// live chart look like it had stopped updating short of the real latest row.
const thinLabels = (labels, target) => {
  if (labels.length <= target) return labels;
  const step = Math.ceil(labels.length / target);
  const last = labels.length - 1;
  return labels.map((label, i) => ((last - i) % step === 0 ? label : ''));
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

// Every value the y-axis has to fit: the plotted averages plus, on bucketed
// ranges, the true per-bucket extremes. Without the extremes a spike that only
// survives in max_value would be clipped outside the plot area.
const axisSpread = (values, mins, maxs) => [
  ...values.filter(v => v != null),
  ...mins.filter(v => v != null),
  ...maxs.filter(v => v != null)
];

// Rounds `range` to a "nice" leading digit (1, 2, 5, or 10 times a power of
// ten) -- the classic nice-numbers algorithm (Sparkfun/Graphics Gems). Used
// so an auto-scaled axis lands on tick values an operator actually
// recognises (0.05, 0.1, 0.5, 5, ...) instead of whatever raw fraction the
// data happens to produce.
const niceNumber = (range, round) => {
  if (!(range > 0)) return 1;
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / 10 ** exponent;
  let niceFraction;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else if (fraction <= 1) {
    niceFraction = 1;
  } else if (fraction <= 2) {
    niceFraction = 2;
  } else if (fraction <= 5) {
    niceFraction = 5;
  } else {
    niceFraction = 10;
  }
  return niceFraction * 10 ** exponent;
};

// Auto-scaled axis bounds (the "no fixed baseline" case): snaps the observed
// min/max to a nice tick spacing derived from their OWN span, with half a
// tick of headroom on each side -- not a flat +/-1% floored/ceiled to the
// nearest integer (the old behavior), which works for a 0-100 metric but
// rounds a small-magnitude one (e.g. NCG, ~0.2wt%) straight to a [0, 1] axis
// that looks just as flat as no scaling at all. See NCG.jsx, 2026-09-15
// (dosen feedback: NCG's line read as flat because the axis was ~5x wider
// than the data's actual fluctuation).
//
// Known limitation, not currently hit: for data with a span that's a large
// fraction of its own magnitude (e.g. 3-95), the nice-numbers rounding can
// push the axis below 0 or well past the data even for a metric that can't
// go negative. Not worked around here since every OTHER Ai2Chart caller
// passes a fixed yAxisMin/yAxisMax (this path is NCG-only today) -- flag it
// if a future no-baseline caller has that shape of data.
const NICE_TICK_COUNT = 5;
const niceAxisBounds = (dataMin, dataMax) => {
  const min = dataMin ?? 0;
  const max = dataMax ?? 100;
  const rawSpan = max - min;
  // Flat/near-flat data (span 0 -- a single point, or a truly constant
  // reading): synthesize a span from the value's own magnitude instead of a
  // fixed number, so a small-magnitude metric doesn't get a huge axis.
  const span = rawSpan > 0 ? rawSpan : (Math.abs(max) || Math.abs(min) || 1) * 0.1;
  const niceRange = niceNumber(span, false);
  const step = niceNumber(niceRange / (NICE_TICK_COUNT - 1), true);
  const niceMin = Math.floor((min - step * 0.5) / step) * step;
  const niceMax = Math.ceil((max + step * 0.5) / step) * step;
  return { min: niceMin, max: niceMax, tickAmount: Math.round((niceMax - niceMin) / step) };
};

// Given the observed data range, returns the y-axis [min, max] (and, for the
// auto-scaled case, tickAmount) to render. With a fixed baseline given
// (yAxisMin/yAxisMax), the axis sticks to exactly that range -- it only
// grows past the baseline on whichever side the data actually exceeds it,
// so a metric that's normally flat (e.g. dryness hovering near 100%)
// doesn't get a misleadingly zoomed-in axis. With no baseline, the axis
// auto-fits the currently-displayed data via niceAxisBounds above.
const computeYRange = (vals, yAxisMin, yAxisMax) => {
  const dataMin = vals.length ? Math.min(...vals) : null;
  const dataMax = vals.length ? Math.max(...vals) : null;

  if (yAxisMin != null && yAxisMax != null) {
    return {
      min: dataMin != null && dataMin < yAxisMin ? dataMin : yAxisMin,
      max: dataMax != null && dataMax > yAxisMax ? dataMax : yAxisMax,
      tickAmount: undefined
    };
  }

  return niceAxisBounds(dataMin, dataMax);
};

// Chart numbers are capped at 2 decimals app-wide; `decimals` may ask for fewer.
const MAX_DECIMALS = 2;

// Full y-axis object, used at creation AND by every update. updateOptions
// replaces the `yaxis` branch wholesale, so updates that sent only {min, max}
// dropped this formatter and the axis fell back to raw floats
// (e.g. "1.000000000000000000" on the NCG chart).
const buildYAxis = ({ min, max, decimals, unit, yAxisTitle, tickAmount }) => ({
  min,
  max,
  // Only set when niceAxisBounds computed one (the auto-scaled/no-baseline
  // case) -- omitted for a fixed baseline so ApexCharts keeps picking its
  // own tick count there, same as before this change.
  ...(tickAmount != null ? { tickAmount } : {}),
  labels: {
    style: { colors: '#86868b', fontSize: '11px' },
    formatter: v => (v != null && Number.isFinite(v) ? v.toFixed(decimals) + unit : '')
  },
  title: {
    text: yAxisTitle,
    style: { color: '#86868b', fontSize: '12px', fontWeight: 400 }
  }
});

/**
 * Ai2Chart — chart for a single ai2 metric (dryness_predict | ncg_predict).
 * - Seeds chart from /api/external/ai2 on mount / range change
 * - In "now" mode, appends liveValue when it changes (kept to 60 points max)
 * - Supports custom date range via date picker
 * - yAxisMin/yAxisMax: fixed baseline range (e.g. dryness 98-100%); omit for
 *   the old auto-scaled-to-data behavior. decimals: label/tooltip precision
 *   (capped at 2).
 */
const Ai2Chart = ({
  title = 'Real Time Data',
  subtitle = '',
  metric = 'dryness_predict',
  liveValue = null,
  unit = '%',
  yAxisTitle = 'Value',
  color = '#3b82f6',
  yAxisMin = null,
  yAxisMax = null,
  decimals = MAX_DECIMALS
}) => {
  const labelDecimals = Math.min(decimals, MAX_DECIMALS);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const dataRef = useRef([]);
  const timestampsRef = useRef([]);
  // Per-bucket extremes, aligned index-for-index with dataRef. All null on the
  // raw ('now') path, where each point already IS a single reading.
  const minsRef = useRef([]);
  const maxsRef = useRef([]);
  const dbFetchedRef = useRef(false);
  // Width of the sliding window in 'now' mode. Sized from whatever the seed
  // fetch returned rather than hardcoded, so the series never snaps to a
  // shorter length the moment the first live value arrives.
  const nowBufferRef = useRef(NOW_BUFFER_MIN);

  const [timeRange, setTimeRange] = useState('now');
  const [chartData, setChartData] = useState([]);
  const [timestamps, setTimestamps] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);

  // Custom date range state
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'month'));
  const [endDate, setEndDate] = useState(dayjs());
  // Picker values while the popover is open; copied to startDate/endDate on Apply.
  const [draftStartDate, setDraftStartDate] = useState(startDate);
  const [draftEndDate, setDraftEndDate] = useState(endDate);
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
      case 'custom': {
        const win = resolveCustomWindow(startDate, endDate);
        return formatTimestampForSpan(ts, win.end - win.start);
      }
      default:
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    }
  }, [startDate, endDate]);

  // Fetch historical data — limit-based or date-range-based
  const fetchHistory = useCallback(async ({ limit, start, end, points } = {}) => {
    setApiLoading(true);
    try {
      let url;
      if (start && end) {
        const s = encodeURIComponent(start.toISOString());
        const e = encodeURIComponent(end.toISOString());
        url = `${AI2_URL}?start_date=${s}&end_date=${e}`;
        // Omitted for 'now', which keeps the raw-row response.
        if (points) url += `&points=${points}`;
      } else {
        url = `${AI2_URL}?limit=${limit ?? 60}`;
      }

      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        const rows = [...json.data].reverse(); // newest-first from DB → chronological
        const num = (v) => (v != null ? parseFloat(v) : null);
        return {
          values: rows.map(r => num(r[metric])),
          timestamps: rows.map(r => r.processed_at),
          // Present only on the bucketed response; null on the raw path.
          mins: rows.map(r => num(r[`${metric}_min`])),
          maxs: rows.map(r => num(r[`${metric}_max`]))
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

  // Fetch on mount, range change, or custom range apply -- then keep polling.
  // Without the interval these ranges only ever showed the rows that existed
  // when the range was picked, so a page refresh was the only way to see
  // newer ones. 'now' is excluded because the live-value append below already
  // keeps it current, and re-seeding underneath that would fight with it.
  useEffect(() => {
    dbFetchedRef.current = false;

    const load = () => {
      let fetchParams;
      if (isCustomRange) {
        const win = resolveCustomWindow(startDate, endDate);
        fetchParams = { start: win.start, end: win.end, points: CHART_POINTS };
      } else {
        const end = new Date();
        const ms = RANGE_DURATION_MS[timeRange] ?? RANGE_DURATION_MS['1d'];
        fetchParams = {
          start: new Date(end.getTime() - ms),
          end,
          points: timeRange === 'now' ? undefined : CHART_POINTS
        };
      }

      fetchHistory(fetchParams).then(result => {
        if (!result) return;
        dataRef.current = result.values.slice();
        timestampsRef.current = result.timestamps.slice();
        minsRef.current = result.mins.slice();
        maxsRef.current = result.maxs.slice();
        nowBufferRef.current = Math.max(result.values.length, NOW_BUFFER_MIN);
        setChartData(result.values);
        setTimestamps(result.timestamps);
        dbFetchedRef.current = true;
      });
    };

    load();
    if (timeRange === 'now' && !isCustomRange) return undefined;

    const id = setInterval(load, AI2_POLL_MS);
    return () => clearInterval(id);
  }, [timeRange, isCustomRange, startDate, endDate, fetchHistory]);

  // Direct chart update (bypasses React state cycle — like PTFChart's updateChartSeries)
  const updateChartDirect = useCallback(() => {
    if (!chartInstanceRef.current) return;
    const activeRange = isCustomRange ? 'custom' : timeRange;
    const categories = thinLabels(
      timestampsRef.current.map(ts => formatTimestamp(ts, activeRange)),
      TICK_TARGET_MAP[activeRange] ?? 10
    );
    const vals = axisSpread(dataRef.current, minsRef.current, maxsRef.current);
    const { min: minY, max: maxY, tickAmount } = computeYRange(vals, yAxisMin, yAxisMax);

    // redrawPaths true so the x-axis labels actually follow the new
    // categories -- with it false the axis stays frozen at the values from
    // chart creation while the series underneath keeps moving.
    chartInstanceRef.current.updateOptions(
      {
        xaxis: { categories, title: { text: XAXIS_LABEL_MAP[activeRange] ?? activeRange } },
        yaxis: buildYAxis({ min: minY, max: maxY, decimals: labelDecimals, unit, yAxisTitle, tickAmount })
      },
      true,
      false
    );
    chartInstanceRef.current.updateSeries([{ name: yAxisTitle, data: dataRef.current }], true);
  }, [isCustomRange, timeRange, yAxisTitle, formatTimestamp, yAxisMin, yAxisMax, labelDecimals, unit]);

  // "Now" mode: append live value and update chart directly (no React state cycle)
  useEffect(() => {
    if (timeRange !== 'now' || isCustomRange) return;
    if (!dbFetchedRef.current) return;
    if (liveValue == null) return;

    const keep = nowBufferRef.current;
    const now = new Date().toISOString();
    dataRef.current = [...dataRef.current.slice(-(keep - 1)), liveValue];
    timestampsRef.current = [...timestampsRef.current.slice(-(keep - 1)), now];
    // A live reading is its own min and max; pushing null keeps the arrays the
    // same length as dataRef so index lookups in the tooltip stay valid.
    minsRef.current = [...minsRef.current.slice(-(keep - 1)), null];
    maxsRef.current = [...maxsRef.current.slice(-(keep - 1)), null];

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
    const categories = thinLabels(
      timestamps.length > 0
        ? timestamps.map(ts => formatTimestamp(ts, activeRange))
        : Array.from({ length: initialData.length }, (_, i) => `${i + 1}`),
      TICK_TARGET_MAP[activeRange] ?? 10
    );

    const vals = axisSpread(initialData, minsRef.current, maxsRef.current);
    const { min: minY, max: maxY, tickAmount } = computeYRange(vals, yAxisMin, yAxisMax);

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
        // Label thinning happens in thinLabels() on the categories array
        // itself, not here -- see the comment on that helper.
        labels: {
          show: true,
          rotate: 0,
          trim: false,
          hideOverlappingLabels: true,
          style: { colors: '#86868b', fontSize: '11px' }
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        title: {
          text: XAXIS_LABEL_MAP[activeRange] ?? activeRange,
          style: { color: '#86868b', fontSize: '12px', fontWeight: 400 }
        }
      },
      yaxis: buildYAxis({ min: minY, max: maxY, decimals: labelDecimals, unit, yAxisTitle, tickAmount }),
      grid: {
        borderColor: '#f1f1f1',
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
        padding: { top: 0, right: 20, bottom: 0, left: 10 }
      },
      tooltip: {
        enabled: true,
        theme: 'light',
        // Format from timestampsRef rather than letting Apex read the
        // categories array: that array has blanks where labels were thinned
        // out, so hovering a thinned point otherwise showed no time at all.
        x: {
          show: true,
          formatter: (val, opts) => {
            const ts = timestampsRef.current[opts?.dataPointIndex];
            return ts ? formatTimestamp(ts, activeRange) : (val ?? '');
          }
        },
        // On bucketed ranges the line is the bucket average, so the tooltip
        // also reports the bucket's true min-max -- otherwise a short spike
        // inside a wide bucket would be invisible anywhere on the page.
        y: {
          formatter: (v, opts) => {
            if (v == null) return '';
            const label = v.toFixed(labelDecimals) + unit;
            const i = opts?.dataPointIndex;
            const lo = minsRef.current[i];
            const hi = maxsRef.current[i];
            if (lo == null || hi == null) return label;
            return `${label}  (min ${lo.toFixed(labelDecimals)}${unit} · max ${hi.toFixed(labelDecimals)}${unit})`;
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
  }, [timeRange, isCustomRange]); // only recreate chart when range or mode changes

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setIsCustomRange(false);
  };

  const handleDatePickerOpen = (event) => {
    setDraftStartDate(startDate);
    setDraftEndDate(endDate);
    setDatePickerAnchor(event.currentTarget);
  };

  const handleApplyCustomRange = () => {
    setStartDate(draftStartDate);
    setEndDate(draftEndDate);
    setIsCustomRange(true);
    setTimeRange('custom');
    setDatePickerAnchor(null);
  };

  const openDatePicker = Boolean(datePickerAnchor);

  const isDraftRangeValid = Boolean(
    draftStartDate?.isValid?.() && draftEndDate?.isValid?.() && !draftStartDate.isAfter(draftEndDate, 'day')
  );

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
            onClick={handleDatePickerOpen}
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
                  value={draftStartDate}
                  onChange={v => setDraftStartDate(v)}
                  disableFuture
                  slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker
                  label="End Date"
                  value={draftEndDate}
                  onChange={v => setDraftEndDate(v)}
                  disableFuture
                  slotProps={{ textField: { size: 'small' } }}
                />
              </LocalizationProvider>
              <Button variant="contained" size="small" disabled={!isDraftRangeValid} onClick={handleApplyCustomRange} sx={{ textTransform: 'none' }}>
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
  color: PropTypes.string,
  yAxisMin: PropTypes.number,
  yAxisMax: PropTypes.number,
  decimals: PropTypes.number
};

export default Ai2Chart;
