import { useCallback, useEffect, useMemo, useRef } from 'react';
import ApexCharts from 'apexcharts';
import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import MainCard from '../MainCard';

// Display-only labels/colors -- the wire values are always 'linear' /
// 'weibull_cox' (see docs/failure_forecast_contract_for_beFE.md). Exported
// so other views summarizing the same data (e.g. the stat tile on
// prediction.jsx) use identical labels/colors instead of redefining them.
export const MODEL_LABELS = {
  linear: 'Linear',
  weibull_cox: 'Weibull–Cox'
};

export const MODEL_COLORS = {
  linear: '#3b82f6',
  weibull_cox: '#9271FF'
};

const fmtDate = (ts) => {
  if (!ts) return '-';
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Years remaining until eta_date, or null if eta_date is missing/invalid --
// eta_date being NULL means "not reached within the computed horizon", not
// "will never happen" (see contract).
const yearsUntil = (etaDate) => {
  if (!etaDate) return null;
  const eta = new Date(etaDate).getTime();
  if (Number.isNaN(eta)) return null;
  return (eta - Date.now()) / (365.25 * 24 * 60 * 60 * 1000);
};

/**
 * Per-model status card, mirroring the AI-side interactive demo's
 * LifetimeStatusPanel.tsx (both models shown side by side, never one
 * silently picked).
 */
function ModelStatusCard({ model, rows }) {
  const anchor = rows[0];
  if (!anchor) return null;

  const health = 100 - Number(anchor.today_failure_pct);
  const yearsLeft = yearsUntil(anchor.eta_date);
  const color = MODEL_COLORS[model] || '#9ca3af';

  return (
    <MainCard sx={{ height: '100%', bgcolor: '#F7F8FA' }} contentSX={{ p: 2.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
        Model {MODEL_LABELS[model] || model}
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 700, color, mt: 0.5, lineHeight: 1.15 }}>
        {Number.isFinite(health) ? health.toFixed(1) : '-'}%
      </Typography>
      <Typography variant="caption" color="text.secondary">
        State of Health saat ini
      </Typography>
      <Box sx={{ mt: 1.5 }}>
        <Typography variant="body2">
          ETA overhaul/maintenance: <strong>{anchor.eta_date ? fmtDate(anchor.eta_date) : 'Belum tercapai dalam horizon proyeksi'}</strong>
        </Typography>
        {yearsLeft !== null && (
          <Typography variant="caption" color="text.secondary">
            (~{yearsLeft.toFixed(1)} tahun lagi dari sekarang)
          </Typography>
        )}
      </Box>
      {anchor.overhaul_active_since && (
        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#9271FF', fontWeight: 600 }}>
          Overhaul aktif sejak {fmtDate(anchor.overhaul_active_since)} -- umur efektif dihitung ulang dari titik ini
        </Typography>
      )}
    </MainCard>
  );
}

/**
 * FailureForecastChart - turbine State-of-Health (SoH) projection, "like a
 * phone battery" per the pembimbing's framing (100% -> 0%, monotonically
 * non-increasing). Backed by failure_forecast_projection
 * (GET /api/external/failure-forecast), replacing the old ai1b-based
 * 30-day "Risk Forecast" chart on prediction.jsx.
 *
 * health_pct = 100 - failure_pct is a pure display flip done here, not by
 * the backend -- the wire contract's source of truth stays failure_pct
 * (monotonically NON-DECREASING toward 100), matching how the AI side's
 * own DegradationChart.tsx does this same transform only at render time.
 */
const FailureForecastChart = ({ rows = [], loading = false }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  const byModel = useMemo(() => {
    const grouped = {};
    rows.forEach((r) => {
      if (!grouped[r.model]) grouped[r.model] = [];
      grouped[r.model].push(r);
    });
    Object.values(grouped).forEach((list) =>
      list.sort((a, b) => new Date(a.projection_date).getTime() - new Date(b.projection_date).getTime())
    );
    return grouped;
  }, [rows]);

  const models = useMemo(() => Object.keys(byModel), [byModel]);

  const series = useMemo(
    () =>
      models.map((model) => ({
        name: `SoH – ${MODEL_LABELS[model] || model}`,
        data: byModel[model].map((r) => ({
          x: new Date(r.projection_date).getTime(),
          y: Number((100 - Number(r.failure_pct)).toFixed(3))
        }))
      })),
    [byModel, models]
  );

  // Vertical dashed line per model at its own eta_date, when the horizon
  // returned actually reaches it.
  const etaAnnotations = useMemo(
    () =>
      models
        .map((model) => {
          const etaDate = byModel[model][0]?.eta_date;
          if (!etaDate) return null;
          const x = new Date(etaDate).getTime();
          if (Number.isNaN(x)) return null;
          const color = MODEL_COLORS[model] || '#9ca3af';
          return {
            x,
            borderColor: color,
            strokeDashArray: 4,
            label: {
              text: `ETA ${MODEL_LABELS[model] || model}`,
              orientation: 'horizontal',
              style: { color: '#fff', background: color, fontSize: '10px' }
            }
          };
        })
        .filter(Boolean),
    [byModel, models]
  );

  const buildOptions = useCallback(
    () => ({
      chart: {
        type: 'line',
        height: 360,
        fontFamily: 'inherit',
        toolbar: { show: false },
        animations: { enabled: true, easing: 'easeinout', speed: 400 },
        zoom: { enabled: false }
      },
      series,
      colors: models.map((m) => MODEL_COLORS[m] || '#9ca3af'),
      stroke: { curve: 'smooth', width: 3 },
      markers: { size: 0, hover: { size: 5 } },
      dataLabels: { enabled: false },
      legend: { show: true, position: 'top', horizontalAlign: 'right' },
      annotations: { xaxis: etaAnnotations },
      grid: { borderColor: '#eef0f4', strokeDashArray: 4, padding: { left: 12, right: 16 } },
      xaxis: {
        type: 'datetime',
        title: { text: 'Tanggal proyeksi', style: { fontSize: '12px', color: '#8b93a7' } },
        labels: { style: { fontSize: '11px', colors: '#8b93a7' } }
      },
      yaxis: {
        min: 0,
        max: 100,
        title: { text: 'State of Health (%)', style: { fontSize: '12px', color: '#8b93a7' } },
        labels: {
          formatter: (v) => (v === null || v === undefined ? '' : `${v.toFixed(0)}%`),
          style: { fontSize: '11px', colors: '#8b93a7' }
        }
      },
      tooltip: {
        theme: 'light',
        x: { format: 'dd MMM yyyy' },
        y: { formatter: (v) => (v === null || v === undefined ? '-' : `${v.toFixed(1)}%`) }
      },
      noData: {
        text: loading ? 'Memuat proyeksi...' : 'Proyeksi belum tersedia',
        style: { color: '#8b93a7', fontSize: '13px' }
      }
    }),
    [series, models, etaAnnotations, loading]
  );

  // Same split as RiskChart: create the ApexCharts instance once, then only
  // push data/axis/annotation updates into the existing instance so a 60s
  // poll doesn't tear down and re-render the whole chart.
  const buildOptionsRef = useRef(buildOptions);
  useEffect(() => {
    buildOptionsRef.current = buildOptions;
  });

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const chart = new ApexCharts(containerRef.current, buildOptionsRef.current());
    chart.render();
    chartRef.current = chart;
    return () => {
      chart.destroy();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    const opts = buildOptions();
    chartRef.current.updateOptions(
      { annotations: opts.annotations, colors: opts.colors, xaxis: opts.xaxis, yaxis: opts.yaxis, noData: opts.noData },
      true,
      false
    );
    chartRef.current.updateSeries(opts.series, false);
  }, [buildOptions]);

  const generatedAt = rows[0]?.generated_at;

  return (
    <MainCard sx={{ width: '100%' }}>
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          State of Health (SoH) Turbin – Proyeksi Umur Pakai
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {generatedAt
            ? `Proyeksi dihitung ${fmtDate(generatedAt)}, dua model reliability-engineering ditampilkan berdampingan`
            : 'Proyeksi umur pakai turbin (linear vs Weibull hazard/Cox PH), gaya "battery health"'}
        </Typography>
      </Box>

      <Box ref={containerRef} sx={{ width: '100%' }} />

      {models.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {models.map((model) => (
            <Grid size={{ xs: 12, sm: 6 }} key={model}>
              <ModelStatusCard model={model} rows={byModel[model]} />
            </Grid>
          ))}
        </Grid>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, lineHeight: 1.6 }}>
        <strong>Keterbatasan:</strong> kedua model adalah heuristik reliability-engineering yang dikalibrasi dari literatur industri (umur
        desain turbin ≈30 tahun, dsb.), <strong>bukan</strong> model machine learning yang divalidasi ke kejadian gagal nyata — Unit 5 belum
        pernah mengalami kegagalan/overhaul besar dalam data yang ada, sehingga tidak ada ground truth untuk validasi. Angka di atas adalah{' '}
        <strong>estimasi skenario</strong>, bukan tanggal kegagalan yang pasti.
      </Typography>
    </MainCard>
  );
};

FailureForecastChart.propTypes = {
  rows: PropTypes.array,
  loading: PropTypes.bool
};

export default FailureForecastChart;
