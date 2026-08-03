import { Box, Typography, Chip, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useState, useEffect, useMemo } from 'react';
import MainCard from 'components/MainCard';
import { AnalyticsHeader, RiskChart } from '../../components/analytics';
import { useAi1aData, useAi1bData } from '../../hooks/useAi1Data';

// icons
import PsychologyIcon from '@mui/icons-material/Psychology';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SensorsOffIcon from '@mui/icons-material/SensorsOff';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const SENSOR_URL = '/api/data/sensor/latest';
const SENSOR_POLL_MS = 30000; // SCADA cadence is ~1 row/min, no need to poll faster
const SENSOR_TABLE_LIMIT = 50;

// Sensor Inputs table columns - labels/units kept exactly as they were before
// this page was wired to real data. 'PF' has no backing field in sensor_data,
// so it always renders '-'.
const SENSOR_COLUMNS = [
  { header: 'Timestamp', key: 'timestamp', width: 160 },
  { header: 'Temp °C', key: 'temperature', width: 110 },
  { header: 'Press bar', key: 'pressure', width: 110 },
  { header: 'Flow kg/h', key: 'flow_rate', width: 110 },
  { header: 'Volt kV', key: 'gen_voltage_u_v', width: 110 },
  { header: 'React MW', key: 'gen_reactive_power', width: 110 },
  { header: 'Output MW', key: 'gen_output', width: 110 },
  { header: 'PF', key: null, width: 90 },
  { header: 'Freq Hz', key: 'gen_frequency', width: 110 },
  { header: 'Speed RPM', key: 'speed_detection', width: 120 },
  { header: 'MCV_L %', key: 'mcv_l', width: 110 },
  { header: 'MCV_R %', key: 'mcv_r', width: 110 },
  { header: 'TDS ppm', key: 'tds', width: 110 }
];

// Hoisted so the chart effect does not see a new array identity every render.
const FORECAST_LEGEND = [
  { name: 'Forecast', color: '#9271FF' },
  { name: 'Max', color: '#ef4444' },
  { name: 'Average', color: '#9ca3af' },
  { name: 'Min', color: '#22c55e' }
];

const fmtNum = (value, digits = 2) => {
  if (value === null || value === undefined) return '-';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isNaN(n) ? '-' : n.toFixed(digits);
};

const toNum = (value) => {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isNaN(n) ? null : n;
};

const fmtClock = (ts) => {
  if (!ts) return '-';
  const d = new Date(ts);
  return Number.isNaN(d.getTime())
    ? '-'
    : d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const fmtDay = (ts) => {
  if (!ts) return '-';
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
};

/* ------------------------------------------------------------------ *
 * Stat card
 * ------------------------------------------------------------------ */

function StatTile({ title, subtitle, value, unit, icon, accent, chip, chipColor }) {
  const hasValue = value !== null && value !== undefined && value !== '';
  return (
    <MainCard sx={{ height: '100%', bgcolor: '#F7F8FA' }} contentSX={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            flexShrink: 0,
            borderRadius: '14px',
            bgcolor: accent,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, mt: 0.5 }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, color: hasValue ? undefined : 'text.secondary', lineHeight: 1.15 }}
            >
              {hasValue ? value : '-'}
            </Typography>
            {unit && hasValue && (
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {unit}
              </Typography>
            )}
          </Box>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
          {chip && <Chip label={chip} size="small" color={chipColor} variant="outlined" sx={{ mt: 1, fontWeight: 700 }} />}
        </Box>
      </Box>
    </MainCard>
  );
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

const AIAnalytics = () => {
  // liveData is null whenever the newest row is older than 10 minutes
  // (see hooks/useAi1Data.js) -- that null IS the "waiting for data" signal.
  const { liveData: ai1aLive, history: ai1aHistory, loading: ai1aLoading } = useAi1aData();
  const { liveData: ai1bLive, loading: ai1bLoading } = useAi1bData();

  const [sensorRows, setSensorRows] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const fetchSensors = () => {
      fetch(`${SENSOR_URL}?limit=${SENSOR_TABLE_LIMIT}`)
        .then((r) => r.json())
        .then((json) => {
          if (cancelled) return;
          const rows = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
          setSensorRows(rows);
        })
        .catch((err) => console.error('sensor fetch error:', err));
    };
    fetchSensors();
    const id = setInterval(fetchSensors, SENSOR_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  /* --- AI1a: observed risk history ------------------------------- */

  const ai1aChart = useMemo(() => {
    const rows = (ai1aHistory || []).filter((r) => toNum(r.risk_percentage) !== null);
    return {
      series: rows.map((r) => toNum(r.risk_percentage)),
      categories: rows.map((r) => fmtClock(r.timestamp)),
      timestamps: rows.map((r) => r.timestamp)
    };
  }, [ai1aHistory]);

  const currentRisk = toNum(ai1aLive?.risk_percentage);
  const isAnomaly = ai1aLive ? ai1aLive.is_anomaly === true || ai1aLive.is_anomaly === 't' : null;

  /* --- AI1b: 30-day forecast ------------------------------------- */

  const ai1bChart = useMemo(() => {
    if (!ai1bLive) return { series: [], categories: [], peak: null, peakDay: null };
    const series = [];
    const categories = [];
    const base = ai1bLive.generated_at ? new Date(ai1bLive.generated_at) : null;

    for (let d = 1; d <= 30; d += 1) {
      const v = toNum(ai1bLive[`day_${d}_risk`]);
      series.push(v);
      if (base && !Number.isNaN(base.getTime())) {
        const day = new Date(base.getTime());
        day.setDate(day.getDate() + d);
        categories.push(`D+${d} · ${fmtDay(day)}`);
      } else {
        categories.push(`D+${d}`);
      }
    }

    let peak = null;
    let peakDay = null;
    series.forEach((v, i) => {
      if (v !== null && (peak === null || v > peak)) {
        peak = v;
        peakDay = i + 1;
      }
    });

    return { series, categories, peak, peakDay };
  }, [ai1bLive]);

  /* --- render ----------------------------------------------------- */

  const statusChip = ai1aLoading ? 'Memuat...' : ai1aLive ? 'Live' : 'Menunggu window valid';

  return (
    <Box>
      <AnalyticsHeader title="Risk Analytics" subtitle="Anomaly Detection & Risk Forecast" />

      {/* ---------------- status tiles ---------------- */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatTile
            title="Status Anomaly Detection"
            subtitle="Anomaly detection, window terakhir"
            value={ai1aLoading ? '...' : ai1aLive ? 'Aktif' : 'Idle'}
            icon={ai1aLive ? <PsychologyIcon sx={{ fontSize: '1.8rem' }} /> : <SensorsOffIcon sx={{ fontSize: '1.8rem' }} />}
            accent={ai1aLive ? '#53A1FF' : '#9e9e9e'}
            chip={statusChip}
            chipColor={ai1aLive ? 'info' : 'default'}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatTile
            title="Anomaly Detection"
            subtitle={ai1aLive?.severity ? `Severity: ${ai1aLive.severity}` : 'Menunggu data live'}
            value={isAnomaly === null ? null : isAnomaly ? 'Detected' : 'Normal'}
            icon={
              isAnomaly ? <WarningAmberIcon sx={{ fontSize: '1.8rem' }} /> : <CheckCircleIcon sx={{ fontSize: '1.8rem' }} />
            }
            accent={isAnomaly === null ? '#9e9e9e' : isAnomaly ? '#9271FF' : '#58E58C'}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatTile
            title="Risk Teramati Sekarang"
            subtitle={ai1aLive?.risk_label ? `Label: ${ai1aLive.risk_label}` : 'Nilai observed, bukan prediksi'}
            value={currentRisk === null ? null : fmtNum(currentRisk, 1)}
            unit="%"
            icon={<SpeedIcon sx={{ fontSize: '1.8rem' }} />}
            accent="#FF9F5A"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatTile
            title="Puncak Risk Forecast"
            subtitle={
              ai1bLoading
                ? 'Memuat forecast...'
                : ai1bChart.peakDay
                  ? `Tertinggi di ${ai1bChart.peakDay} hari ke depan dari 30 hari ke depan`
                  : 'Forecast belum tersedia'
            }
            value={ai1bChart.peak === null ? null : fmtNum(ai1bChart.peak, 1)}
            unit="%"
            icon={<TrendingUpIcon sx={{ fontSize: '1.8rem' }} />}
            accent="#9271FF"
          />
        </Grid>
      </Grid>

      {/* ---------------- chart 1: AI1a observed ---------------- */}
      <Box sx={{ mb: 3 }}>
        <RiskChart
          title="Observed Risk History"
          subtitle="Risk percentage yang teramati per window waktu - hasil anomaly detection"
          badge="OBSERVED"
          badgeColor="info"
          series={ai1aChart.series}
          categories={ai1aChart.categories}
          timestamps={ai1aChart.timestamps}
          showRangeSelector
          color="#3b82f6"
          chartType="area"
          yAxisMax={100}
          emptyMessage="Belum ada window yang valid"
          footnote={
            <>
              Ini <strong>bukan prediksi</strong>: setiap titik adalah risk percentage yang sudah terjadi pada window
              tersebut, bukan proyeksi ke depan. Kemiringan tren di grafik ini sebagian besar artefak pergeseran level
              data, bukan degradasi turbin (plan.md §3b) - untuk proyeksi ke depan, lihat grafik Risk Forecast di bawah.
            </>
          }
        />
      </Box>

      {/* ---------------- chart 2: AI1b forecast ---------------- */}
      <Box sx={{ mb: 3 }}>
        <RiskChart
          title="Risk Forecast - 30 Hari ke Depan"
          subtitle={
            ai1bLive?.generated_at
              ? `Forecast dibuat ${fmtClock(ai1bLive.generated_at)}${ai1bLive.model_version ? ` · model ${ai1bLive.model_version}` : ''}`
              : 'Proyeksi risk harian ke depan dari model AI'
          }
          badge="FORECAST"
          badgeColor="secondary"
          series={ai1bChart.series}
          categories={ai1bChart.categories}
          legendItems={FORECAST_LEGEND}
          color="#9271FF"
          chartType="line"
          yAxisMax={100}
          xAxisTitle="Hari ke depan (D+1 ... D+30)"
          emptyMessage="Forecast belum tersedia / run terakhir sudah stale"
          footnote={
            <>
              Setiap titik adalah <strong>prediksi</strong> risk percentage untuk hari ke-N setelah forecast dibuat.
              Nilai diambil dari run forecast terbaru, satu titik per hari.
            </>
          }
        />
      </Box>

      {/* ---------------- tables ---------------- */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <MainCard sx={{ height: '100%' }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Log Anomaly Detection
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Window terbaru di atas
            </Typography>
            <Box sx={{ maxHeight: 420, overflow: 'auto' }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <Box component="thead" sx={{ position: 'sticky', top: 0, bgcolor: '#F7F8FA', zIndex: 1 }}>
                  <Box component="tr">
                    {['Timestamp', 'Risk %', 'Anomaly', 'Severity'].map((h) => (
                      <Box
                        component="th"
                        key={h}
                        sx={{ textAlign: 'left', p: 1, fontWeight: 700, borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}
                      >
                        {h}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {[...(ai1aHistory || [])].reverse().map((row, i) => {
                    const anom = row.is_anomaly === true || row.is_anomaly === 't';
                    return (
                      <Box component="tr" key={`${row.timestamp}-${i}`} sx={{ '&:hover': { bgcolor: '#fafbfc' } }}>
                        <Box component="td" sx={{ p: 1, borderBottom: '1px solid #f1f2f4', whiteSpace: 'nowrap' }}>
                          {fmtClock(row.timestamp)}
                        </Box>
                        <Box component="td" sx={{ p: 1, borderBottom: '1px solid #f1f2f4' }}>
                          {fmtNum(row.risk_percentage, 1)}
                        </Box>
                        <Box component="td" sx={{ p: 1, borderBottom: '1px solid #f1f2f4' }}>
                          <Box component="span" sx={{ color: anom ? '#9271FF' : '#58A76B', fontWeight: 700 }}>
                            {anom ? 'Detected' : 'Normal'}
                          </Box>
                        </Box>
                        <Box component="td" sx={{ p: 1, borderBottom: '1px solid #f1f2f4' }}>
                          {row.severity || '-'}
                        </Box>
                      </Box>
                    );
                  })}
                  {(!ai1aHistory || ai1aHistory.length === 0) && (
                    <Box component="tr">
                      <Box component="td" colSpan={4} sx={{ p: 2, color: 'text.secondary' }}>
                        Belum ada data.
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <MainCard sx={{ height: '100%' }}>
            <Tooltip title="Input mentah SCADA yang dikonsumsi model AI" arrow placement="top-start">
              <Typography variant="h5" sx={{ fontWeight: 700, display: 'inline-block' }}>
                Sensor Inputs
              </Typography>
            </Tooltip>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {SENSOR_TABLE_LIMIT} baris terakhir dari sensor_data
            </Typography>
            <Box sx={{ maxHeight: 420, overflow: 'auto' }}>
              <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: '0.78rem', minWidth: 1200 }}>
                <Box component="thead" sx={{ position: 'sticky', top: 0, bgcolor: '#F7F8FA', zIndex: 1 }}>
                  <Box component="tr">
                    {SENSOR_COLUMNS.map((c) => (
                      <Box
                        component="th"
                        key={c.header}
                        sx={{
                          textAlign: 'left',
                          p: 1,
                          fontWeight: 700,
                          borderBottom: '1px solid #e5e7eb',
                          whiteSpace: 'nowrap',
                          minWidth: c.width
                        }}
                      >
                        {c.header}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {sensorRows.map((row, i) => (
                    <Box component="tr" key={`${row.timestamp}-${i}`} sx={{ '&:hover': { bgcolor: '#fafbfc' } }}>
                      {SENSOR_COLUMNS.map((c) => (
                        <Box
                          component="td"
                          key={c.header}
                          sx={{ p: 1, borderBottom: '1px solid #f1f2f4', whiteSpace: 'nowrap' }}
                        >
                          {c.key === null ? '-' : c.key === 'timestamp' ? fmtClock(row[c.key]) : fmtNum(row[c.key])}
                        </Box>
                      ))}
                    </Box>
                  ))}
                  {sensorRows.length === 0 && (
                    <Box component="tr">
                      <Box component="td" colSpan={SENSOR_COLUMNS.length} sx={{ p: 2, color: 'text.secondary' }}>
                        Belum ada data sensor.
                      </Box>
                    </Box>
                  )}
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
