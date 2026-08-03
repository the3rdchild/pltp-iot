import { Box, Typography, Button, Chip, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useState, useEffect, useRef, useMemo } from 'react';
import MainCard from 'components/MainCard';
import { AnalyticsHeader, Ai2Chart } from '../../components/analytics';
import { useAi1aData } from '../../hooks/useAi1Data';
import { useAi2Data } from '../../hooks/useAi2Data';

// icons
import PsychologyIcon from '@mui/icons-material/Psychology';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SensorsOffIcon from '@mui/icons-material/SensorsOff';

const SENSOR_URL = '/api/data/sensor/latest';
const SENSOR_POLL_MS = 30000; // SCADA cadence is ~1 row/min, no need to poll faster
const SENSOR_TABLE_LIMIT = 50;

// Sensor Inputs table columns — labels/units kept exactly as they were before
// this page was wired to real data (not part of the AI1/AI2 rework scope).
// 'PF' has no backing field in sensor_data, so it always renders '—'.
const SENSOR_COLUMNS = [
  { header: 'Timestamp', key: 'timestamp', width: 160 },
  { header: 'Temp °C', key: 'temperature', width: 120 },
  { header: 'Press bar', key: 'pressure', width: 120 },
  { header: 'Flow kg/h', key: 'flow_rate', width: 120 },
  { header: 'Volt kV', key: 'gen_voltage_u_v', width: 120 },
  { header: 'React MW', key: 'gen_reactive_power', width: 120 },
  { header: 'Output MW', key: 'gen_output', width: 120 },
  { header: 'PF', key: null, width: 120 },
  { header: 'Freq Hz', key: 'gen_frequency', width: 120 },
  { header: 'Speed RPM', key: 'speed_detection', width: 120 },
  { header: 'MCV_L %', key: 'mcv_l', width: 120 },
  { header: 'MCV_R %', key: 'mcv_r', width: 120 },
  { header: 'TDS ppm', key: 'tds', width: 120 }
];

const fmtNum = (value, digits = 2) => {
  if (value === null || value === undefined) return '—';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isNaN(n) ? '—' : n.toFixed(digits);
};

const AI2_PROVISIONAL_TOOLTIP =
  'Kalibrasi TDS sensor→lab belum final (cakupan waktu data live masih sempit) — ' +
  'angka ini indikatif, bukan presisi. Detail: docs/catatan_diskusi_penting.md §1.';

// AI2 numbers are shown (D22 activation), but a provisional calibration must
// never look as trustworthy as a final one -- values in-range (e.g. dryness
// near the lab reference band) are exactly the case that's dangerous without
// this label, since they look convincing on their own.
function Ai2CellValue({ value, digits, status }) {
  if (value === null || value === undefined) return '—';
  const isProvisional = status === 'provisional';
  const content = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <span>{fmtNum(value, digits)}</span>
      {isProvisional && (
        <Chip
          label="PROVISIONAL"
          size="small"
          sx={{
            height: 16,
            fontSize: '0.55rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            backgroundColor: '#f59e0b',
            color: '#fff',
            '& .MuiChip-label': { px: 0.5 }
          }}
        />
      )}
    </Box>
  );
  return isProvisional ? (
    <Tooltip title={AI2_PROVISIONAL_TOOLTIP} arrow>
      {content}
    </Tooltip>
  ) : (
    content
  );
}

const getSeverityConfig = (severity) => {
  switch ((severity || '').toLowerCase()) {
    case 'normal':
      return { label: 'Normal', color: '#58E58C' };
    case 'warning':
      return { label: 'Warning', color: '#f59e0b' };
    case 'critical':
      return { label: 'Critical', color: '#FF7E7E' };
    default:
      return { label: 'Menunggu Data', color: '#9e9e9e' };
  }
};

// Static "not available" panel for the two AI2 summary stat cards only. AI2
// itself is active now (D22) and both the Ai2Chart components below AND the
// Prediction Data Table DO show its real numbers (with an explicit
// PROVISIONAL badge, see Ai2CellValue) -- just these two top cards were left
// out of this wiring pass. Revisit if they should also surface real values.
function Ai2UnavailableCard({ title }) {
  return (
    <MainCard sx={{ height: '100%', backgroundColor: '#F5F5F5' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '12px',
            backgroundColor: '#bdbdbd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0
          }}
        >
          <SensorsOffIcon sx={{ fontSize: '2.5rem' }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: 'text.secondary' }}>
            Belum tersedia
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Model virtual sensor belum diaktifkan
          </Typography>
        </Box>
      </Box>
    </MainCard>
  );
}

const AIAnalytics = () => {
  // AI1a (anomaly detection / current risk). Existing hook, unmodified:
  // liveData is null when there's no row or the latest row is >10 min old
  // (see hooks/useAi1Data.js) -- that null IS the "waiting for data" signal.
  const { liveData: ai1aLiveData, history: ai1aHistory } = useAi1aData();

  // AI2 (dryness/NCG virtual sensor) — now activated (D22), but calibration is
  // PROVISIONAL (see docs/catatan_diskusi_penting.md §1): TDS sensor->lab quantile
  // mapping hasn't met its data-sufficiency gate yet. Numbers ARE shown (per D22
  // activation), but every row carries its own `status` from ai2, and the UI must
  // never let a provisional number look as trustworthy as a final one.
  const { liveData: ai2LiveData, history: ai2History } = useAi2Data();
  const drynessLive = ai2LiveData?.dryness_predict != null ? parseFloat(ai2LiveData.dryness_predict) : NaN;
  const ncgLive = ai2LiveData?.ncg_predict != null ? parseFloat(ai2LiveData.ncg_predict) : NaN;
  // Same latest-row status used for the table caption below -- one shared
  // signal for "is the calibration behind these AI2 numbers still provisional".
  const ai2IsProvisional = ai2History.length > 0 && ai2History[ai2History.length - 1]?.status === 'provisional';

  // Sensor Inputs table (right panel) — real sensor_data rows.
  const [sensorRows, setSensorRows] = useState([]);

  const [timeRangeAI1, setTimeRangeAI1] = useState('1d');
  const [showDatePickerAI1, setShowDatePickerAI1] = useState(false);
  const [dateFromAI1, setDateFromAI1] = useState('');
  const [dateToAI1, setDateToAI1] = useState('');

  const [chartWidthAI1, setChartWidthAI1] = useState(1200);

  const chartRefAI1 = useRef(null);
  const leftTableRef = useRef(null);
  const rightTableRef = useRef(null);

  // Handle window resize for dynamic chart width
  useEffect(() => {
    const updateWidth = () => {
      if (chartRefAI1.current) {
        setChartWidthAI1(chartRefAI1.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    setTimeout(updateWidth, 100);

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Sync table scroll between the two Prediction Data Table panels
  useEffect(() => {
    const leftTable = leftTableRef.current;
    const rightTable = rightTableRef.current;

    if (!leftTable || !rightTable) return;

    const syncScroll = (source, target) => () => {
      target.scrollTop = source.scrollTop;
    };

    const leftScrollHandler = syncScroll(leftTable, rightTable);
    const rightScrollHandler = syncScroll(rightTable, leftTable);

    leftTable.addEventListener('scroll', leftScrollHandler);
    rightTable.addEventListener('scroll', rightScrollHandler);

    return () => {
      leftTable.removeEventListener('scroll', leftScrollHandler);
      rightTable.removeEventListener('scroll', rightScrollHandler);
    };
  }, []);

  // Fetch latest sensor_data rows for the "Sensor Inputs" panel.
  useEffect(() => {
    let cancelled = false;
    const fetchSensorRows = () => {
      fetch(`${SENSOR_URL}?limit=${SENSOR_TABLE_LIMIT}`)
        .then((r) => r.json())
        .then((json) => {
          if (!cancelled && json.success && json.data) {
            setSensorRows(json.data); // already newest-first from the API
          }
        })
        .catch((err) => console.error('sensor/latest fetch error:', err));
    };

    fetchSensorRows();
    const id = setInterval(fetchSensorRows, SENSOR_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // ai1a history keyed by exact timestamp -- ai1a.timestamp is stored as the
  // literal sensor row timestamp its window ended on (workers/jobs_ai1.py),
  // so this is an exact join, not an approximation. Same technique as
  // src/pages/component-overview/history.jsx.
  const ai1aByTimestamp = useMemo(() => {
    const map = new Map();
    ai1aHistory.forEach((row) => map.set(new Date(row.timestamp).getTime(), row));
    return map;
  }, [ai1aHistory]);

  // ai2.processed_at is the same underlying sensor-window-end timestamp as
  // ai1a.timestamp (workers/jobs_ai2.py) -- exact-timestamp join, same technique
  // as ai1a above and src/pages/component-overview/history.jsx.
  const ai2ByTimestamp = useMemo(() => {
    const map = new Map();
    ai2History.forEach((row) => map.set(new Date(row.processed_at).getTime(), row));
    return map;
  }, [ai2History]);

  // Combined table rows: each real sensor row + its matching ai1a window / ai2
  // prediction, if any.
  const tableData = useMemo(
    () =>
      sensorRows.map((row) => ({
        ...row,
        ai1a: ai1aByTimestamp.get(new Date(row.timestamp).getTime()) || null,
        ai2: ai2ByTimestamp.get(new Date(row.timestamp).getTime()) || null
      })),
    [sensorRows, ai1aByTimestamp, ai2ByTimestamp]
  );

  // AI1 risk chart data — real ai1a history, chronological (hook already
  // reverses it), reshaped to the field names the existing SVG drawing code
  // below expects.
  const ai1ChartData = useMemo(
    () =>
      ai1aHistory.map((row) => ({
        timestamp: row.timestamp,
        risk_percentage: row.risk_percentage != null ? parseFloat(row.risk_percentage) : 0,
        anomaly_detected: !!row.is_anomaly
      })),
    [ai1aHistory]
  );

  // Get X-axis labels based on time range
  const getXAxisLabels = (range) => {
    switch (range) {
      case 'Now':
        return Array.from({ length: 60 }, (_, i) => (i + 1).toString());
      case '1h':
        return Array.from({ length: 60 }, (_, i) => (i + 1).toString());
      case '1d':
        return Array.from({ length: 24 }, (_, i) => (i + 1).toString());
      case '7d':
        return Array.from({ length: 7 }, (_, i) => `D${i + 1}`);
      case '1m':
        return Array.from({ length: 30 }, (_, i) => (i + 1).toString());
      case '1y':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      case 'all':
        return Array.from({ length: 10 }, (_, i) => (2015 + i).toString());
      default:
        return Array.from({ length: 60 }, (_, i) => (i + 1).toString());
    }
  };

  // Get time label for X-axis
  const getTimeLabel = (range) => {
    switch (range) {
      case 'Now':
      case '1h':
        return 'Minute';
      case '1d':
        return 'Hour';
      case '7d':
        return 'Day';
      case '1m':
        return 'Date';
      case '1y':
        return 'Month';
      case 'all':
        return 'Year';
      default:
        return 'Time';
    }
  };

  // Smooth curve helper - Catmull-Rom spline
  const getCurvePoints = (points) => {
    if (points.length < 2) return '';

    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }

    return path;
  };

  const xAxisLabelsAI1 = getXAxisLabels(timeRangeAI1);

  // Linear regression helper — a real statistical fit over real risk% history,
  // not a fabricated value, so this is kept.
  const getLinearRegression = (data, getValue) => {
    if (data.length < 2) return null;

    const n = data.length;
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0;

    data.forEach((point, i) => {
      const x = i;
      const y = getValue(point);
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  };

  // AI1 stat card values — null means "waiting for data" (no fresh ai1a row),
  // not zero. useAi1aData already treats rows older than 10 minutes as stale.
  const usingAi1a = !!ai1aLiveData;
  const riskPct = usingAi1a && ai1aLiveData.risk_percentage != null ? parseFloat(ai1aLiveData.risk_percentage) : null;
  const severityConfig = getSeverityConfig(usingAi1a ? ai1aLiveData.severity : null);
  const isAnomaly = usingAi1a ? !!ai1aLiveData.is_anomaly : null;
  const anomalyScore = usingAi1a && ai1aLiveData.anomaly_score != null ? parseFloat(ai1aLiveData.anomaly_score) : null;

  return (
    <Box>
      <AnalyticsHeader title="AI Analytics" subtitle="Real-time AI Predictions Monitoring" />

      <Grid container spacing={3}>
        {/* 1. AI1 Stats Cards */}
        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard sx={{ height: '100%', backgroundColor: '#F5F5F5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '12px',
                  backgroundColor: severityConfig.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0
                }}
              >
                {usingAi1a ? <PsychologyIcon sx={{ fontSize: '2.5rem' }} /> : <HourglassEmptyIcon sx={{ fontSize: '2.5rem' }} />}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                  AI1 Status
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {severityConfig.label}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {riskPct != null ? `${riskPct.toFixed(1)}% Risk` : 'Menunggu window ai1a valid'}
                </Typography>
              </Box>
            </Box>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard sx={{ height: '100%', backgroundColor: '#F5F5F5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '12px',
                  backgroundColor: isAnomaly === null ? '#9e9e9e' : isAnomaly ? '#9271FF' : '#53A1FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0
                }}
              >
                {isAnomaly === null ? (
                  <HourglassEmptyIcon sx={{ fontSize: '2.5rem' }} />
                ) : isAnomaly ? (
                  <WarningAmberIcon sx={{ fontSize: '2.5rem' }} />
                ) : (
                  <CheckCircleIcon sx={{ fontSize: '2.5rem' }} />
                )}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                  Anomaly Detection
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {isAnomaly === null ? 'Menunggu Data' : isAnomaly ? 'Detected' : 'Normal'}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {anomalyScore != null ? `Score: ${anomalyScore.toFixed(3)}` : '—'}
                </Typography>
              </Box>
            </Box>
          </MainCard>
        </Grid>

        {/* 2. AI1 Chart - Risk Prediction */}
        <Grid size={{ xs: 12 }}>
          <MainCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                  AI1 - Risk Prediction
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Real-time turbine risk analysis with anomaly detection
                </Typography>
              </Box>
              <Box>
                <Button
                  size="small"
                  startIcon={<CalendarMonthIcon />}
                  onClick={() => setShowDatePickerAI1(!showDatePickerAI1)}
                  sx={{
                    textTransform: 'none',
                    color: '#666',
                    fontSize: '0.75rem',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                >
                  Custom Date Range
                </Button>
                {showDatePickerAI1 && (
                  <Box sx={{ display: 'flex', gap: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1, mt: 1 }}>
                    <input
                      type="date"
                      value={dateFromAI1}
                      onChange={(e) => setDateFromAI1(e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <Typography sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#666' }}>to</Typography>
                    <input
                      type="date"
                      value={dateToAI1}
                      onChange={(e) => setDateToAI1(e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <Button
                      size="small"
                      variant="contained"
                      sx={{ minWidth: 'auto', px: 2, textTransform: 'none' }}
                      onClick={() => setShowDatePickerAI1(false)}
                    >
                      Apply
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>

            {ai1ChartData.length > 1 && (
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: -1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 16, height: 2, backgroundColor: '#1976d2' }} />
                  <Typography variant="caption" color="text.secondary">
                    Risk % teramati
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 16, height: 0, borderTop: '2px dashed #ff4444' }} />
                  <Typography variant="caption" color="text.secondary">
                    Regresi linear atas data teramati — <strong>bukan prediksi</strong>, tidak diekstrapolasi (lihat plan.md §3b: kemiringan
                    tren risk sebagian besar artefak pergeseran level, bukan degradasi turbin)
                  </Typography>
                </Box>
              </Box>
            )}

            <Box ref={chartRefAI1} sx={{ height: 420, position: 'relative', pt: 2, width: '100%' }}>
              {ai1ChartData.length === 0 ? (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    color: 'text.secondary'
                  }}
                >
                  <HourglassEmptyIcon sx={{ fontSize: '2.5rem', opacity: 0.5 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Menunggu data AI1a
                  </Typography>
                  <Typography variant="caption" sx={{ textAlign: 'center', maxWidth: 400 }}>
                    Belum ada window 60-menit yang valid (lihat validasi rentang waktu). Grafik akan terisi otomatis begitu data tersedia.
                  </Typography>
                </Box>
              ) : (
                <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                  {/* Y-axis label */}
                  <text x="15" y="200" fontSize="12" fill="#666" textAnchor="middle" transform="rotate(-90, 15, 200)" fontWeight="600">
                    Risk Percentage (%)
                  </text>

                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((val, i) => (
                    <g key={i}>
                      <line x1="60" y1={320 - val * 2.8} x2={chartWidthAI1 - 40} y2={320 - val * 2.8} stroke="#e0e0e0" strokeWidth="1" />
                      <text x="45" y={325 - val * 2.8} fontSize="11" fill="#666" textAnchor="end">
                        {val}%
                      </text>
                    </g>
                  ))}

                  {/* Smooth risk line */}
                  {ai1ChartData.length > 1 && (
                    <path
                      d={getCurvePoints(
                        ai1ChartData.slice(-xAxisLabelsAI1.length).map((d, i) => ({
                          x: 60 + (i * (chartWidthAI1 - 100)) / Math.max(1, xAxisLabelsAI1.length - 1),
                          y: 320 - d.risk_percentage * 2.8
                        }))
                      )}
                      fill="none"
                      stroke="#1976d2"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  )}
                  {/* Regression line - AI1 */}
                  {ai1ChartData.length > 1 &&
                    (() => {
                      const slicedData = ai1ChartData.slice(-xAxisLabelsAI1.length);
                      const regression = getLinearRegression(slicedData, (d) => d.risk_percentage);
                      if (!regression) return null;

                      const startY = regression.intercept;
                      const endY = regression.intercept + regression.slope * (slicedData.length - 1);
                      const endX = 60 + ((slicedData.length - 1) * (chartWidthAI1 - 100)) / Math.max(1, xAxisLabelsAI1.length - 1);

                      return (
                        <line
                          x1="60"
                          y1={320 - startY * 2.8}
                          x2={endX}
                          y2={320 - endY * 2.8}
                          stroke="#ff4444"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                      );
                    })()}
                  {/* Anomaly markers */}
                  {ai1ChartData.slice(-xAxisLabelsAI1.length).map((d, i) => {
                    if (!d.anomaly_detected) return null;
                    const x = 60 + (i * (chartWidthAI1 - 100)) / Math.max(1, xAxisLabelsAI1.length - 1);
                    const y = 320 - d.risk_percentage * 2.8;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="7" fill="#ff4444" stroke="#fff" strokeWidth="2" />
                        <text x={x} y={y - 12} fontSize="10" fill="#ff4444" textAnchor="middle" fontWeight="600">
                          ⚠
                        </text>
                      </g>
                    );
                  })}

                  {/* X-axis labels */}
                  <text x={chartWidthAI1 / 2} y="360" fontSize="12" fill="#666" textAnchor="middle" fontWeight="600">
                    {getTimeLabel(timeRangeAI1)} (x{xAxisLabelsAI1.length})
                  </text>

                  {/* X-axis tick labels */}
                  {xAxisLabelsAI1.map((label, i) => {
                    const showEvery =
                      xAxisLabelsAI1.length > 30
                        ? Math.ceil(xAxisLabelsAI1.length / 12)
                        : xAxisLabelsAI1.length > 12
                          ? Math.ceil(xAxisLabelsAI1.length / 8)
                          : 1;
                    if (i % showEvery !== 0 && i !== xAxisLabelsAI1.length - 1) return null;

                    const x = 60 + (i * (chartWidthAI1 - 100)) / Math.max(1, xAxisLabelsAI1.length - 1);
                    return (
                      <text key={i} x={x} y="380" fontSize="9" fill="#666" textAnchor="middle">
                        {label}
                      </text>
                    );
                  })}
                </svg>
              )}
            </Box>

            {/* Time range buttons - Bottom Right */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1, flexWrap: 'wrap' }}>
              {['Now', '1h', '1d', '7d', '1m', '1y', 'all'].map((range) => (
                <Box
                  key={range}
                  onClick={() => setTimeRangeAI1(range)}
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    cursor: 'pointer',
                    backgroundColor: timeRangeAI1 === range ? '#1976d2' : '#f5f5f5',
                    color: timeRangeAI1 === range ? '#fff' : '#666',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: timeRangeAI1 === range ? '#1565c0' : '#e0e0e0'
                    }
                  }}
                >
                  {range === 'all' ? 'All' : range}
                </Box>
              ))}
            </Box>
          </MainCard>
        </Grid>

        {/* 3. Horizontal Barrier */}
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              height: 2,
              background: 'linear-gradient(90deg, transparent 0%, #2e7d32 50%, transparent 100%)',
              my: 2
            }}
          />
        </Grid>

        {/* 4. AI2 Stats Cards — kept as "not available" here on purpose: AI2 IS
            active (D22) and its numbers do render below (charts + data table,
            both with the PROVISIONAL badge), but these two top stat cards were
            out of scope for this wiring pass. Revisit if they should also show
            real (labeled) values instead of a blanket "belum tersedia". */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Ai2UnavailableCard title="AI2 Dryness" />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Ai2UnavailableCard title="AI2 NCG" />
        </Grid>

        {/* 5. AI2 Charts — real data (D22 activation), PROVISIONAL badge when the
            TDS calibration behind it hasn't met its data-sufficiency gate (see
            Ai2CellValue above for why this label can't be optional). */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ position: 'relative' }}>
            {ai2IsProvisional && (
              <Tooltip title={AI2_PROVISIONAL_TOOLTIP} arrow>
                <Chip
                  label="PROVISIONAL"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    zIndex: 1,
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    backgroundColor: '#f59e0b',
                    color: '#fff'
                  }}
                />
              </Tooltip>
            )}
            <Ai2Chart
              title="AI2 - Dryness Fraction"
              subtitle="Steam quality prediction"
              metric="dryness_predict"
              liveValue={drynessLive}
              unit="%"
              yAxisTitle="Dryness (%)"
              color="#2e7d32"
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ position: 'relative' }}>
            {ai2IsProvisional && (
              <Tooltip title={AI2_PROVISIONAL_TOOLTIP} arrow>
                <Chip
                  label="PROVISIONAL"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    zIndex: 1,
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    backgroundColor: '#f59e0b',
                    color: '#fff'
                  }}
                />
              </Tooltip>
            )}
            <Ai2Chart
              title="AI2 - NCG Content"
              subtitle="Non-condensable gas prediction"
              metric="ncg_predict"
              liveValue={ncgLive}
              unit=" wt%"
              yAxisTitle="NCG (wt%)"
              color="#ed6c02"
            />
          </Box>
        </Grid>

        {/* 6. Data Table with Frozen Prediction Columns */}
        <Grid size={{ xs: 12 }}>
          <MainCard>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                Prediction Data Table
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Real-time sensor inputs and AI prediction results
              </Typography>
              {ai1aHistory.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Data AI1a belum tersedia — kolom Risk %/Anomaly ditampilkan sebagai &ldquo;—&rdquo;.
                </Typography>
              )}
              {ai2IsProvisional && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Kolom Dryness %/NCG wt% (AI2) berlabel <strong>PROVISIONAL</strong> — kalibrasi TDS sensor→lab belum final, angka
                  indikatif (lihat docs/catatan_diskusi_penting.md §1).
                </Typography>
              )}
            </Box>

            <Box sx={{ position: 'relative', height: 500 }}>
              {/* Scrollable container */}
              <Box
                sx={{
                  display: 'flex',
                  height: '100%',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                {/* Frozen prediction columns (left) */}
                <Box
                  ref={leftTableRef}
                  sx={{
                    width: 420,
                    flexShrink: 0,
                    borderRight: '3px solid #1976d2',
                    backgroundColor: '#f8f9fa',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      position: 'sticky',
                      top: 0,
                      backgroundColor: '#1976d2',
                      color: 'white',
                      zIndex: 2,
                      borderBottom: '2px solid #1565c0'
                    }}
                  >
                    <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        AI Predictions
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1.1fr 0.8fr 0.9fr 0.8fr 0.8fr', gap: 0.5, p: 1, minHeight: 48 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
                        Waktu (ai1a)
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
                        Risk %
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
                        Anomaly
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
                        Dryness %
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
                        NCG wt%
                      </Typography>
                    </Box>
                  </Box>

                  {/* Data rows — joined to ai1a by exact timestamp match; '—' when no window covers this row */}
                  {tableData.map((row) => (
                    <Box
                      key={row.id}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1.1fr 0.8fr 0.9fr 0.8fr 0.8fr',
                        gap: 0.5,
                        p: 1,
                        minHeight: 40,
                        borderBottom: '1px solid #e0e0e0',
                        backgroundColor: '#fff',
                        '&:hover': { backgroundColor: '#e3f2fd' }
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
                        {row.ai1a ? new Date(row.ai1a.timestamp).toLocaleTimeString('id-ID') : '—'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                        {row.ai1a ? fmtNum(row.ai1a.risk_percentage, 1) : '—'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                        {row.ai1a ? (row.ai1a.is_anomaly ? '⚠️ Yes' : '✓ No') : '—'}
                      </Typography>
                      <Box sx={{ typography: 'body2', fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                        <Ai2CellValue value={row.ai2?.dryness_predict} digits={2} status={row.ai2?.status} />
                      </Box>
                      <Box sx={{ typography: 'body2', fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                        <Ai2CellValue value={row.ai2?.ncg_predict} digits={2} status={row.ai2?.status} />
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Scrollable input columns (right) */}
                <Box ref={rightTableRef} sx={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}>
                  <Box sx={{ minWidth: 'fit-content', width: 'max-content' }}>
                    {/* Header */}
                    <Box
                      sx={{
                        position: 'sticky',
                        top: 0,
                        backgroundColor: '#37474f',
                        color: 'white',
                        zIndex: 1
                      }}
                    >
                      <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Sensor Inputs
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, p: 1, minHeight: 48 }}>
                        {SENSOR_COLUMNS.map((col) => (
                          <Box
                            key={col.header}
                            sx={{
                              minWidth: col.width,
                              width: col.header === 'Timestamp' ? col.width : 'auto',
                              display: 'flex',
                              alignItems: 'center',
                              px: 1
                            }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                              {col.header}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    {/* Data rows */}
                    {tableData.map((row, idx) => (
                      <Box
                        key={row.id}
                        sx={{
                          display: 'flex',
                          gap: 1,
                          p: 1,
                          minHeight: 40,
                          borderBottom: '1px solid #e0e0e0',
                          backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa',
                          '&:hover': { backgroundColor: '#e3f2fd' }
                        }}
                      >
                        {SENSOR_COLUMNS.map((col) => (
                          <Box
                            key={col.header}
                            sx={{
                              minWidth: col.width,
                              width: col.header === 'Timestamp' ? col.width : 'auto',
                              display: 'flex',
                              alignItems: 'center',
                              px: 1
                            }}
                          >
                            <Typography variant="body2" sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                              {col.key === null
                                ? '—'
                                : col.key === 'timestamp'
                                  ? new Date(row.timestamp).toLocaleString('id-ID')
                                  : fmtNum(row[col.key])}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIAnalytics;
