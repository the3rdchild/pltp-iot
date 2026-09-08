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
import { getChartData, syncHoneywellLiveData } from '../../utils/api';

// Points kept on screen in 'now' mode. The 1h seed arrives at 12-second
// resolution (300 buckets), and only the newest slice of it is wanted here:
// 60 points is about the last twelve minutes, which is the span a real-time
// view is actually about. The live append then slides this same window.
const NOW_WINDOW_POINTS = 60;

// Series colors: Active Power (blue), Reactive Power (orange), S.T Speed (green)
const ACTIVE_POWER_COLOR = '#3b82f6';
const REACTIVE_POWER_COLOR = '#f97316';
const SPEED_COLOR = '#22c55e';

// One definition of the three y-axes, used at creation AND on every update.
// Shared for the same reason as PTFChart: updateOptions replaces the `yaxis`
// branch wholesale, so update sites must resend the full axis objects or the
// label formatters are silently dropped.
const buildYAxes = ({ activePower, reactivePower, speed }) => {
  const axis = (seriesName, unit, color, range, opposite = false) => ({
    seriesName,
    ...(opposite && { opposite: true }),
    min: range.min,
    max: range.max,
    labels: {
      style: { colors: '#86868b', fontSize: '11px' },
      formatter: (v) => (v === null || v === undefined ? '' : `${v.toFixed(0)} ${unit}`)
    },
    title: { text: `${seriesName}`, style: { color, fontSize: '12px', fontWeight: 400 } }
  });

  return [
    axis('Active Power (MW)', 'MW', ACTIVE_POWER_COLOR, activePower),
    axis('Reactive Power (MVAR)', 'MVAR', REACTIVE_POWER_COLOR, reactivePower),
    axis('S.T Speed (RPM)', 'RPM', SPEED_COLOR, speed, true)
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

const PowerChart = ({
  title = 'Power Real Time Data',
  subtitle = 'Active Power, Reactive Power, S.T Speed data chart',
  liveValues = {}
}) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const activePowerRef = useRef([]);
  const reactivePowerRef = useRef([]);
  const speedRef = useRef([]);
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
  const [activePowerData, setActivePowerData] = useState([]);
  const [reactivePowerData, setReactivePowerData] = useState([]);
  const [speedData, setSpeedData] = useState([]);
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

  // Fetch chart data from API for a given range. All three series share one
  // end_time anchor so their bucket grids line up on the same boundaries
  // (three independent requests would each anchor to their own NOW()).
  // `dateFilter` {start, end} slices the returned series client-side for the
  // 1y/custom views, which the backend cannot express (widest range is 'all').
  const fetchChartFromAPI = useCallback(async (range, dateFilter) => {
    setApiLoading(true);
    try {
      const anchorTime = new Date().toISOString();
      const [aRes, rRes, sRes] = await Promise.all([
        getChartData('active_power', range, anchorTime),
        getChartData('reactive_power', range, anchorTime),
        getChartData('speed', range, anchorTime)
      ]);

      const aChart = aRes?.data?.chart || [];
      const rChart = rRes?.data?.chart || [];
      const sChart = sRes?.data?.chart || [];

      // Use the longest array's timestamps as reference
      const refChart = [aChart, rChart, sChart].reduce((a, b) => (a.length >= b.length ? a : b));
      let ts = refChart.map((p) => p.timestamp);

      let aVals = aChart.map((p) => p.avg);
      let rVals = rChart.map((p) => p.avg);
      let sVals = sChart.map((p) => p.avg);

      if (dateFilter) {
        const lo = dateFilter.start.getTime();
        const hi = dateFilter.end.getTime();
        const keep = ts
          .map((t, i) => {
            const v = new Date(t).getTime();
            return v >= lo && v <= hi ? i : -1;
          })
          .filter((i) => i >= 0);
        ts = keep.map((i) => ts[i]);
        aVals = keep.map((i) => aVals[i]);
        rVals = keep.map((i) => rVals[i]);
        sVals = keep.map((i) => sVals[i]);
      }

      return { timestamps: ts, activePower: aVals, reactivePower: rVals, speed: sVals };
    } catch (err) {
      console.error('Error fetching power chart data from API:', err);
      return null;
    } finally {
      setApiLoading(false);
    }
  }, []);

  // Fetch data based on time range change
  useEffect(() => {
    dbFetchedRef.current = false;
    nowSeedAppliedRef.current = false;

    if (timeRange === 'now') {
      // "Now" mode: fetch latest DB data once, then update with live values
      const initNowMode = async () => {
        // Fetch last 1h data from DB as initial seed
        let result = await fetchChartFromAPI('1h');

        // Nothing in the database for the last hour. Ask the backend to pull
        // the newest readings straight from Honeywell, then try once more.
        //
        // Only ever attempted once per range selection: the sync endpoint is
        // throttled server-side, and a genuinely idle plant would otherwise
        // turn every page view into a retry loop. If it still comes back
        // empty, an empty chart is the honest answer.
        if (!result || result.activePower.length === 0) {
          try {
            await syncHoneywellLiveData();
            result = await fetchChartFromAPI('1h');
          } catch (err) {
            console.error('Honeywell fallback sync failed:', err);
          }
        }

        if (result && result.activePower.length > 0) {
          // Newest slice only. The endpoint returns 300 buckets for an hour;
          // keeping all of them would leave the live append needing hundreds of
          // ticks to work through the history before the window truly moved.
          const tail = (arr) => arr.slice(-NOW_WINDOW_POINTS);
          setActivePowerData(tail(result.activePower));
          setReactivePowerData(tail(result.reactivePower));
          setSpeedData(tail(result.speed));
          setTimestamps(tail(result.timestamps));
          nowBufferRef.current = NOW_WINDOW_POINTS;
          dbFetchedRef.current = true;
        }
      };
      initNowMode();
    } else if (['1h', '1d', '7d', '1m', 'all'].includes(timeRange) && !isCustomRange) {
      // Fetch from API for standard ranges
      fetchChartFromAPI(timeRange).then((result) => {
        if (result) {
          setActivePowerData(result.activePower);
          setReactivePowerData(result.reactivePower);
          setSpeedData(result.speed);
          setTimestamps(result.timestamps);
        }
      });
    } else if (timeRange === '1y' || isCustomRange) {
      // The backend tops out at 'all' and takes no start/end, so fetch the
      // widest window once and slice it to the requested dates client-side.
      const end = isCustomRange ? endDate.toDate() : dayjs().toDate();
      const start = isCustomRange ? startDate.toDate() : dayjs().subtract(1, 'year').toDate();

      fetchChartFromAPI('all', { start, end }).then((result) => {
        if (result) {
          setActivePowerData(result.activePower);
          setReactivePowerData(result.reactivePower);
          setSpeedData(result.speed);
          setTimestamps(result.timestamps);
        }
      });
    }
  }, [timeRange, isCustomRange, startDate, endDate, fetchChartFromAPI]);

  // "Now" mode: append live values when they change (production-only chart,
  // values arrive via props from the page's live polling)
  useEffect(() => {
    if (timeRange !== 'now') return;
    if (!dbFetchedRef.current) return;

    const aVal = liveValues.active_power;
    const rVal = liveValues.reactive_power;
    const sVal = liveValues.speed;

    if (aVal == null && rVal == null && sVal == null) return;

    const keep = nowBufferRef.current;
    const now = new Date().toISOString();

    const nextA = [...activePowerRef.current.slice(-(keep - 1)), aVal ?? activePowerRef.current[activePowerRef.current.length - 1]];
    const nextR = [...reactivePowerRef.current.slice(-(keep - 1)), rVal ?? reactivePowerRef.current[reactivePowerRef.current.length - 1]];
    const nextS = [...speedRef.current.slice(-(keep - 1)), sVal ?? speedRef.current[speedRef.current.length - 1]];
    const nextTs = [...timestampsRef.current.slice(-(keep - 1)), now];

    activePowerRef.current = nextA;
    reactivePowerRef.current = nextR;
    speedRef.current = nextS;
    timestampsRef.current = nextTs;

    setActivePowerData(nextA);
    setReactivePowerData(nextR);
    setSpeedData(nextS);
    setTimestamps(nextTs);

    updateChartSeries();
  }, [liveValues.active_power, liveValues.reactive_power, liveValues.speed, timeRange]);

  // Helper to update chart series and y-axis
  const updateChartSeries = useCallback(() => {
    if (!chartInstanceRef.current) return;

    chartInstanceRef.current.updateSeries(
      [
        { name: 'Active Power (MW)', data: activePowerRef.current },
        { name: 'Reactive Power (MVAR)', data: reactivePowerRef.current },
        { name: 'S.T Speed (RPM)', data: speedRef.current }
      ],
      true
    );

    chartInstanceRef.current.updateOptions(
      {
        yaxis: buildYAxes({
          activePower: paddedRange(activePowerRef.current),
          reactivePower: paddedRange(reactivePowerRef.current),
          speed: paddedRange(speedRef.current)
        })
      },
      false,
      false
    );
  }, []);

  // Initialize/reinitialize ApexCharts when range changes
  useEffect(() => {
    if (!chartRef.current) return;
    // For "now" mode, create chart immediately with placeholder data
    // For other modes, wait for real data before creating chart
    if (timeRange !== 'now' && activePowerData.length === 0 && reactivePowerData.length === 0 && speedData.length === 0) return;

    const initialActivePower = activePowerData.length > 0 ? activePowerData : Array(60).fill(0);
    const initialReactivePower = reactivePowerData.length > 0 ? reactivePowerData : Array(60).fill(0);
    const initialSpeed = speedData.length > 0 ? speedData : Array(60).fill(0);

    activePowerRef.current = initialActivePower.slice();
    reactivePowerRef.current = initialReactivePower.slice();
    speedRef.current = initialSpeed.slice();
    timestampsRef.current = timestamps.slice();

    const categories =
      timestamps.length > 0
        ? timestamps.map((ts) => formatTimestamp(ts, timeRange))
        : Array.from({ length: initialActivePower.length }, (_, i) => `${i + 1}`);

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
        { name: 'Active Power (MW)', data: initialActivePower },
        { name: 'Reactive Power (MVAR)', data: initialReactivePower },
        { name: 'S.T Speed (RPM)', data: initialSpeed }
      ],
      stroke: {
        curve: 'smooth',
        width: 2,
        colors: [ACTIVE_POWER_COLOR, REACTIVE_POWER_COLOR, SPEED_COLOR]
      },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] },
        colors: [ACTIVE_POWER_COLOR, REACTIVE_POWER_COLOR, SPEED_COLOR]
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
      yaxis: buildYAxes({
        activePower: paddedRange(initialActivePower),
        reactivePower: paddedRange(initialReactivePower),
        speed: paddedRange(initialSpeed)
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
        x: { show: true },
        y: {
          formatter: (value, { seriesIndex, w }) => {
            if (!value) return '';
            const seriesName = w?.globals?.seriesNames?.[seriesIndex] || '';
            if (seriesName.includes('Active Power')) return value.toFixed(1) + ' MW';
            if (seriesName.includes('Reactive Power')) return value.toFixed(1) + ' MVAR';
            return value.toFixed(1) + ' RPM';
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
    if (activePowerData.length === 0 || reactivePowerData.length === 0 || speedData.length === 0) return;

    // For "now" mode the seed must land exactly once, and live updates own the
    // series from then on (same guard rationale as PTFChart: the placeholder
    // makes the refs non-empty before the seed arrives, so dbFetchedRef +
    // nowSeedAppliedRef decide, not ref lengths).
    if (timeRange === 'now' && nowSeedAppliedRef.current) return;

    // Update refs
    activePowerRef.current = activePowerData.slice();
    reactivePowerRef.current = reactivePowerData.slice();
    speedRef.current = speedData.slice();
    timestampsRef.current = timestamps.slice();

    // Update categories
    const categories =
      timestamps.length > 0
        ? timestamps.map((ts) => formatTimestamp(ts, timeRange))
        : Array.from({ length: activePowerData.length }, (_, i) => `${i + 1}`);

    // Smooth update: update series and axis without destroying chart
    chartInstanceRef.current.updateOptions(
      {
        xaxis: { categories },
        yaxis: buildYAxes({
          activePower: paddedRange(activePowerData),
          reactivePower: paddedRange(reactivePowerData),
          speed: paddedRange(speedData)
        })
      },
      false,
      false
    );

    // From here the seed is on screen; live appends own the series after this.
    if (timeRange === 'now') nowSeedAppliedRef.current = true;

    chartInstanceRef.current.updateSeries(
      [
        { name: 'Active Power (MW)', data: activePowerData },
        { name: 'Reactive Power (MVAR)', data: reactivePowerData },
        { name: 'S.T Speed (RPM)', data: speedData }
      ],
      true
    ); // animate: true for smooth transition
  }, [activePowerData, reactivePowerData, speedData, timestamps, timeRange, formatTimestamp]);

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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>

        {/* Legend — centered */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 15, height: 15, borderRadius: '10%', backgroundColor: ACTIVE_POWER_COLOR }} />
            <Typography variant="caption" color="textSecondary">
              Active Power
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 15, height: 15, borderRadius: '10%', backgroundColor: REACTIVE_POWER_COLOR }} />
            <Typography variant="caption" color="textSecondary">
              Reactive Power
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 15, height: 15, borderRadius: '10%', backgroundColor: SPEED_COLOR }} />
            <Typography variant="caption" color="textSecondary">
              S.T Speed
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
            {isCustomRange ? `${startDate.format('MMM DD, YYYY')} - ${endDate.format('MMM DD, YYYY')}` : 'Select Range'}
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
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(v) => setStartDate(v)}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker label="End Date" value={endDate} onChange={(v) => setEndDate(v)} slotProps={{ textField: { size: 'small' } }} />
              </LocalizationProvider>
              <Button variant="contained" size="small" onClick={handleApplyCustomRange} sx={{ textTransform: 'none' }}>
                Apply
              </Button>
            </Box>
          </Popover>
        </Box>
      </Box>

      {/* Loading indicator */}
      {apiLoading && (
        <Box sx={{ textAlign: 'center', py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Loading chart data...
          </Typography>
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

PowerChart.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  liveValues: PropTypes.object
};

export default PowerChart;
