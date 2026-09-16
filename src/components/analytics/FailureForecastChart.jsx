import { useCallback, useEffect, useMemo, useRef } from 'react';
import ApexCharts from 'apexcharts';
import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import MainCard from '../MainCard';
import { PLANNED_CYCLE_YEARS, PLANNED_CYCLE_RANGE_YEARS, cycleAnchorMs, cycleProgress, yearsToMs } from '../../utils/failureForecastCalibration';

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

// Amber/orange throughout this file means "planned-cycle reference"
// (independent of any model); model colors (MODEL_COLORS) stay reserved for
// actual curve/SoH data, so the two kinds of number never look alike.
const PLAN_REFERENCE_COLOR = '#d97706';

/**
 * Per-model status card, mirroring the AI-side interactive demo's
 * LifetimeStatusPanel.tsx (both models shown side by side, never one
 * silently picked).
 *
 * Reframed 2026-09-16 (dosen feedback via "Master Session" cross-session
 * handoff): the headline used to be SoH-now / ETA ~2045, which read as
 * "T_desain 30 tahun" framing even though the chart's own reference band
 * (below) already reflects the newer predictive-maintenance framing --
 * "siklus overhaul rencana ~4 tahun". Now the cycle-progress number (same
 * anchor as the band, model-independent) is the headline; SoH-now stays
 * visible as its own block; ETA is demoted to a muted secondary line
 * (kept, not deleted -- still a valid consequence of the curve, just not
 * what should catch the eye first).
 */
function ModelStatusCard({ model, rows, cycleAnchor }) {
  const anchor = rows[0];
  if (!anchor) return null;

  const health = 100 - Number(anchor.today_failure_pct);
  const yearsLeft = yearsUntil(anchor.eta_date);
  const color = MODEL_COLORS[model] || '#9ca3af';
  const { pct: cyclePct, yearsToPlanned } = cycleProgress(cycleAnchor);
  const cycleOverdue = yearsToPlanned < 0;

  return (
    <MainCard sx={{ height: '100%', bgcolor: '#F7F8FA' }} contentSX={{ p: 2.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
        Model {MODEL_LABELS[model] || model}
      </Typography>

      <Typography variant="h3" sx={{ fontWeight: 700, color: PLAN_REFERENCE_COLOR, mt: 0.5, lineHeight: 1.15 }}>
        {Number.isFinite(cyclePct) ? Math.max(0, cyclePct).toFixed(0) : '-'}%
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {cycleOverdue ? `Dari siklus overhaul rencana (~${PLANNED_CYCLE_YEARS} tahun)` : `Menuju siklus overhaul rencana (~${PLANNED_CYCLE_YEARS} tahun)`}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
        {cycleOverdue
          ? `Sudah ${Math.abs(yearsToPlanned).toFixed(1)} tahun melewati titik tengah rencana`
          : `~${yearsToPlanned.toFixed(1)} tahun lagi ke titik tengah rencana`}{' '}
        (rentang wajar {PLANNED_CYCLE_RANGE_YEARS[0]}–{PLANNED_CYCLE_RANGE_YEARS[1]} tahun, bukan aturan otomatis)
      </Typography>

      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color, lineHeight: 1.15 }}>
          {Number.isFinite(health) ? health.toFixed(1) : '-'}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          State of Health saat ini
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        ETA overhaul/maintenance (proyeksi model): {anchor.eta_date ? fmtDate(anchor.eta_date) : 'belum tercapai dalam horizon proyeksi'}
        {yearsLeft !== null && ` (~${yearsLeft.toFixed(1)} tahun lagi)`}
      </Typography>

      {anchor.overhaul_active_since && (
        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#9271FF', fontWeight: 600 }}>
          Overhaul aktif sejak {fmtDate(anchor.overhaul_active_since)} -- umur efektif dihitung ulang dari titik ini
        </Typography>
      )}
    </MainCard>
  );
}

/**
 * FailureForecastChart - turbine State-of-Health (SoH) curve, "like a phone
 * battery" per the pembimbing's framing (100% -> 0%, monotonically
 * non-increasing), drawn from COD (2015-06-29) through today (solid,
 * failure_forecast_history) and on into the projection (dashed,
 * failure_forecast_projection) -- replacing the old ai1b-based 30-day "Risk
 * Forecast" chart on prediction.jsx.
 *
 * health_pct = 100 - failure_pct is a pure display flip done here, not by
 * the backend -- the wire contract's source of truth stays failure_pct
 * (monotonically NON-DECREASING toward 100), matching how the AI side's
 * own DegradationChart.tsx does this same transform only at render time.
 *
 * historyRows carries a `segment` ('nominal' COD->first sample, 'observed'
 * first sample->today) that isn't used for styling here -- both draw as one
 * solid "historis" line, since neither is a prediction the way the
 * projection is. The distinction stays available in the raw rows for a
 * future refinement (e.g. a lighter tone for the no-sensor-data nominal
 * span) without a contract change.
 */
const FailureForecastChart = ({ rows = [], historyRows = [], loading = false }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  // overhaul_active_since is a run-level flag repeated on every projection
  // row (same value or null across all of them, see the contract) -- .find
  // rather than rows[0] only so a transient partial fetch doesn't miss it.
  const overhaulActiveSince = useMemo(() => rows.find((r) => r.overhaul_active_since)?.overhaul_active_since ?? null, [rows]);
  const cycleAnchor = useMemo(() => cycleAnchorMs(overhaulActiveSince), [overhaulActiveSince]);

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

  const historyByModel = useMemo(() => {
    const grouped = {};
    historyRows.forEach((r) => {
      if (!grouped[r.model]) grouped[r.model] = [];
      grouped[r.model].push(r);
    });
    Object.values(grouped).forEach((list) =>
      list.sort((a, b) => new Date(a.point_date).getTime() - new Date(b.point_date).getTime())
    );
    return grouped;
  }, [historyRows]);

  // Union, not just Object.keys(byModel) -- history and projection can load
  // at slightly different times (two separate polled fetches), so a model
  // present in one but not yet the other must still render what's there.
  const models = useMemo(() => {
    const set = new Set([...Object.keys(byModel), ...Object.keys(historyByModel)]);
    return Array.from(set).sort();
  }, [byModel, historyByModel]);

  // Solid "historis" points, COD -> today, one series per model.
  const historicalSeriesData = useMemo(() => {
    const out = {};
    models.forEach((model) => {
      out[model] = (historyByModel[model] || []).map((r) => ({
        x: new Date(r.point_date).getTime(),
        y: Number((100 - Number(r.failure_pct)).toFixed(3))
      }));
    });
    return out;
  }, [historyByModel, models]);

  // Dashed "proyeksi" points, today -> horizon. The historical line's last
  // point is prepended so the dashed segment starts exactly where the solid
  // one ends -- per contract, join on segment/order (last observed
  // failure_pct == today_failure_pct), never a date comparison, so this
  // does not assume point_date and projection_date line up exactly.
  const projectionSeriesData = useMemo(() => {
    const out = {};
    models.forEach((model) => {
      const projPoints = (byModel[model] || []).map((r) => ({
        x: new Date(r.projection_date).getTime(),
        y: Number((100 - Number(r.failure_pct)).toFixed(3))
      }));
      const lastHistorical = historicalSeriesData[model]?.[historicalSeriesData[model].length - 1];
      out[model] = lastHistorical ? [lastHistorical, ...projPoints] : projPoints;
    });
    return out;
  }, [byModel, models, historicalSeriesData]);

  const series = useMemo(
    () =>
      models.flatMap((model) => {
        const label = MODEL_LABELS[model] || model;
        return [
          { name: `SoH – ${label} (historis)`, data: historicalSeriesData[model] || [] },
          { name: `SoH – ${label} (proyeksi)`, data: projectionSeriesData[model] || [] }
        ];
      }),
    [models, historicalSeriesData, projectionSeriesData]
  );

  // Per-series styling, in the same [historis, proyeksi] pairing as
  // `series` above -- same color both halves, dashed only for proyeksi
  // (same "solid observed + dashed predicted" convention as the TDS AI2
  // overlay in RealTimeDataChart.jsx).
  const seriesColors = useMemo(
    () => models.flatMap((model) => [MODEL_COLORS[model] || '#9ca3af', MODEL_COLORS[model] || '#9ca3af']),
    [models]
  );
  const seriesDashArray = useMemo(() => models.flatMap(() => [0, 6]), [models]);
  const seriesStrokeWidth = useMemo(() => models.flatMap(() => [3, 2]), [models]);

  // Vertical dashed line per model at its own eta_date, when the horizon
  // returned actually reaches it.
  const etaAnnotations = useMemo(
    () =>
      models
        .map((model) => {
          const etaDate = (byModel[model] || [])[0]?.eta_date;
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

  // Marks "today" (the history/projection join point) so the historis-vs-
  // proyeksi switch reads clearly even before hovering the dashed segment.
  const anchorAnnotation = useMemo(() => {
    const x = models.map((model) => projectionSeriesData[model]?.[0]?.x).find((v) => Number.isFinite(v));
    if (!Number.isFinite(x)) return null;
    return {
      x,
      borderColor: '#94a3b8',
      strokeDashArray: 2,
      label: {
        text: 'Hari ini',
        orientation: 'horizontal',
        style: { color: '#fff', background: '#94a3b8', fontSize: '10px' }
      }
    };
  }, [models, projectionSeriesData]);

  // Planned-overhaul-cycle reference band [anchor+2y, anchor+6y] + a midline
  // at anchor+4y -- ONE band for the whole chart (not per-model: the plan
  // is independent of which aging model is shown), same anchor rule as the
  // reset control's context note (cycleAnchor above). Added 2026-09-16 so
  // this chart's headline framing matches the "siklus overhaul rencana"
  // language already used below it (OverhaulResetControl) -- previously
  // only the ETA/T_desain=30-year framing appeared on the chart itself.
  // Must keep working with 1 model as cleanly as 2 (linear is being
  // retired from the AI-side worker) -- nothing here depends on `models`.
  const cycleBandAnnotation = useMemo(
    () => ({
      x: cycleAnchor + yearsToMs(PLANNED_CYCLE_RANGE_YEARS[0]),
      x2: cycleAnchor + yearsToMs(PLANNED_CYCLE_RANGE_YEARS[1]),
      fillColor: PLAN_REFERENCE_COLOR,
      opacity: 0.1,
      label: {
        text: `Siklus overhaul rencana (${PLANNED_CYCLE_RANGE_YEARS[0]}–${PLANNED_CYCLE_RANGE_YEARS[1]} th)`,
        orientation: 'horizontal',
        position: 'top',
        style: { color: '#7c2d12', background: '#fef3c7', fontSize: '10px' }
      }
    }),
    [cycleAnchor]
  );

  const cycleMidAnnotation = useMemo(
    () => ({
      x: cycleAnchor + yearsToMs(PLANNED_CYCLE_YEARS),
      borderColor: PLAN_REFERENCE_COLOR,
      strokeDashArray: 3,
      label: {
        text: `~${PLANNED_CYCLE_YEARS} th (rencana)`,
        orientation: 'horizontal',
        style: { color: '#fff', background: PLAN_REFERENCE_COLOR, fontSize: '10px' }
      }
    }),
    [cycleAnchor]
  );

  const xaxisAnnotations = useMemo(() => {
    const base = anchorAnnotation ? [anchorAnnotation, ...etaAnnotations] : etaAnnotations;
    // Band first so ApexCharts draws it behind the point annotations.
    return [cycleBandAnnotation, cycleMidAnnotation, ...base];
  }, [anchorAnnotation, etaAnnotations, cycleBandAnnotation, cycleMidAnnotation]);

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
      colors: seriesColors,
      stroke: { curve: 'smooth', width: seriesStrokeWidth, dashArray: seriesDashArray },
      markers: { size: 0, hover: { size: 5 } },
      dataLabels: { enabled: false },
      legend: { show: true, position: 'top', horizontalAlign: 'right', fontSize: '11px' },
      annotations: { xaxis: xaxisAnnotations },
      grid: { borderColor: '#eef0f4', strokeDashArray: 4, padding: { left: 12, right: 16 } },
      xaxis: {
        type: 'datetime',
        title: { text: 'Tanggal (COD → proyeksi)', style: { fontSize: '12px', color: '#8b93a7' } },
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
    [series, seriesColors, seriesStrokeWidth, seriesDashArray, xaxisAnnotations, loading]
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
      {
        annotations: opts.annotations,
        colors: opts.colors,
        stroke: opts.stroke,
        xaxis: opts.xaxis,
        yaxis: opts.yaxis,
        noData: opts.noData
      },
      true,
      false
    );
    chartRef.current.updateSeries(opts.series, false);
  }, [buildOptions]);

  const generatedAt = rows[0]?.generated_at || historyRows[0]?.generated_at;

  return (
    <MainCard sx={{ width: '100%' }}>
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          State of Health (SoH) Turbin – Riwayat & Proyeksi Umur Pakai
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {generatedAt
            ? `Dihitung ${fmtDate(generatedAt)} · sejak COD (29 Jun 2015) hingga proyeksi ke depan, pita oranye menandai siklus overhaul rencana (~${PLANNED_CYCLE_YEARS} tahun, rentang ${PLANNED_CYCLE_RANGE_YEARS[0]}–${PLANNED_CYCLE_RANGE_YEARS[1]} tahun) sebagai acuan operasional`
            : `Riwayat & proyeksi umur pakai turbin sejak COD, dengan siklus overhaul rencana (~${PLANNED_CYCLE_YEARS} tahun) sebagai acuan operasional`}
        </Typography>
      </Box>

      <Box ref={containerRef} sx={{ width: '100%' }} />

      {models.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {models.map((model) => (
            <Grid size={{ xs: 12, sm: 6 }} key={model}>
              <ModelStatusCard model={model} rows={byModel[model] || []} cycleAnchor={cycleAnchor} />
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
  historyRows: PropTypes.array,
  loading: PropTypes.bool
};

export default FailureForecastChart;
