import { useCallback, useEffect, useMemo, useRef } from 'react';
import ApexCharts from 'apexcharts';
import { Alert, Box, Typography, Stack, Divider } from '@mui/material';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import MainCard from '../MainCard';
import { PLANNED_CYCLE_YEARS, PLANNED_CYCLE_RANGE_YEARS, cycleAnchorMs, yearsToMs } from '../../utils/failureForecastCalibration';

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

// Neutral axis-scale gray -- distinct from PLAN_REFERENCE_COLOR (amber,
// literature reference), OVERHAUL_CONNECTOR_COLOR (red, event marker), and
// MODEL_COLORS (actual data): the 0% line is part of the chart's own
// scale, not a reference/event/data marker, so it reads as "same family"
// as the axis labels themselves (#8b93a7 elsewhere in this file) rather
// than any of those other three kinds of annotation.
const ZERO_LINE_COLOR = '#8b93a7';

// Pink/rose -- distinct hue from every other color in this file (model
// blue/violet, amber reference, red event marker, gray 0% scale line), so
// this counterfactual can never be mistaken for real data, a literature
// reference, or an event. Thin + semi-transparent (see seriesStrokeWidth/
// tooltip below) since it's a hypothetical, not a measurement.
const ZERO_RISK_COUNTERFACTUAL_COLOR = 'rgba(244, 114, 182, 0.55)';

// Collision-aware stacking for xaxis annotation labels. ApexCharts has no
// built-in overlap avoidance, and a fixed one-off "nudge this label up"
// doesn't hold once an anchor moves -- exactly what happened when the
// backdated Jan 2021 overhaul event landed close to "Hari ini" on a chart
// spanning COD 2015 to an ETA around 2045 (dosen feedback, 2026-09-16).
//
// "Close" is a FRACTION of the chart's own time domain rather than a fixed
// day/pixel count, since the actual pixel gap between two dates depends on
// both the domain span and the container's rendered width (which this
// component doesn't control -- it's `width: '100%'`). This is a heuristic,
// not a pixel-exact collision test (ApexCharts doesn't expose rendered
// label bounding boxes to react to before paint) -- 8% was picked to
// reasonably cover a multi-decade domain rendered at a typical dashboard
// card width; a redesign that changes the chart's aspect ratio a lot may
// need to revisit this number.
const ANNOTATION_COLLISION_FRACTION = 0.08;
const ANNOTATION_STACK_STEP_PX = 22;

// Takes xaxis annotations (point -- `x` only -- or range -- `x` + `x2`) and
// returns new objects with `label.offsetY` adjusted so labels whose x
// positions cluster together stack vertically instead of overlapping.
// Pure -- returns new annotation objects, never mutates the input.
const resolveAnnotationCollisions = (items, domainMs) => {
  if (items.length < 2 || !(domainMs > 0)) return items;

  const threshold = domainMs * ANNOTATION_COLLISION_FRACTION;
  const order = items
    .map((item, i) => ({ i, pos: item.x2 != null ? (item.x + item.x2) / 2 : item.x }))
    .sort((a, b) => a.pos - b.pos);

  const stackIndexByItem = new Array(items.length).fill(0);
  let clusterStart = 0;
  order.forEach((entry, idx) => {
    if (idx > 0 && entry.pos - order[idx - 1].pos > threshold) {
      clusterStart = idx; // far enough from the previous one -- new cluster
    }
    stackIndexByItem[entry.i] = idx - clusterStart;
  });

  return items.map((item, i) => {
    if (stackIndexByItem[i] === 0) return item; // no collision -- leave as-is
    return {
      ...item,
      label: { ...item.label, offsetY: (item.label?.offsetY ?? 0) - stackIndexByItem[i] * ANNOTATION_STACK_STEP_PX }
    };
  });
};

// Breaks a chronologically-sorted points array into visually separate
// segments at each cycle_index change -- WAJIB per the 16 Sep 2026 contract
// change (CONTRACT.md banner, point 2): connecting points across a cycle
// boundary would draw "damage decreasing" that never happened -- SoH resets
// to 100% at every recorded overhaul, it doesn't ease down to it. Inserts a
// single null-y point 1ms before the first point of the new cycle so
// ApexCharts breaks the line there, rather than splitting into a separate
// series per cycle (which would also multiply legend entries -- the
// production worker currently writes one cycle for `as_is`/projection but
// history can already span several).
const insertCycleGaps = (points) => {
  const out = [];
  points.forEach((p, i) => {
    if (i > 0 && p.cycleIndex !== points[i - 1].cycleIndex) {
      out.push({ x: p.x - 1, y: null });
    }
    out.push({ x: p.x, y: p.y });
  });
  return out;
};

// Distinct from MODEL_COLORS/PLAN_REFERENCE_COLOR -- marks an EVENT
// (an overhaul happened here), never a data series or a literature
// reference, so it needs to read as neither of those at a glance.
const OVERHAUL_CONNECTOR_COLOR = '#dc2626';

// Builds a separate connector series marking each recorded overhaul
// (cycle_index change) in a chronologically-sorted points array -- the two
// REAL values on either side of the boundary (old cycle's last point, new
// cycle's first point, usually ~0% and ~100%), joined by their own short
// line segment. Requested by the user 2026-09-16: insertCycleGaps
// correctly leaves the main data line broken there (connecting it would
// draw "damage decreasing" that never happened), but a bare gap on its own
// read as "data missing" rather than "an overhaul happened here" -- this
// is a pure event marker, rendered as its own series (distinct color/
// width, see OVERHAUL_CONNECTOR_COLOR) so it can never be mistaken for the
// real SoH curve.
const buildCycleBoundaryConnectors = (points) => {
  const out = [];
  points.forEach((p, i) => {
    if (i === 0) return;
    const prev = points[i - 1];
    if (p.cycleIndex === prev.cycleIndex) return;
    if (out.length > 0) out.push({ x: prev.x - 1, y: null }); // isolate from an earlier connector
    out.push({ x: prev.x, y: prev.y });
    out.push({ x: p.x, y: p.y });
  });
  return out;
};

/**
 * Per-model status card, mirroring the AI-side interactive demo's
 * LifetimeStatusPanel.tsx (both models shown side by side, never one
 * silently picked).
 *
 * Reframed 2026-09-16 (dosen feedback via "Master Session" cross-session
 * handoff, contract change same day): `failure_pct`/`today_failure_pct`
 * from the backend now mean "% of ONE overhaul cycle (~4 years) used up",
 * not "% toward 30-year design life" -- see CONTRACT.md's "PERUBAHAN BESAR
 * 16 Sep 2026" banner. The headline here used to be this component's OWN
 * client-side calendar-elapsed-vs-4-years estimate (a stand-in before the
 * backend computed this properly); it's now the backend's real
 * hazard-weighted `today_failure_pct` directly -- the two numbers would
 * otherwise diverge and show two different "% of cycle" figures on the
 * same page, which is worse than showing neither. NOT clamped (contract
 * WAJIB #4): a value like 248% is correct and must render as 248%, not be
 * capped at 100.
 *
 * `wide`: true when this is the ONLY card in the row (see the
 * `models.length === 1` check at the call site) -- linear was retired from
 * the AI-side production worker, so a single Weibull-Cox card was
 * stretching to fill a half-width grid slot with the other half empty.
 * When wide, the headline and SoH-now blocks sit side by side; otherwise
 * they stack vertically -- data-driven (models.length), never a hardcoded
 * single-model assumption.
 */
function ModelStatusCard({ model, rows, wide = false }) {
  const anchor = rows[0];
  if (!anchor) return null;

  const cyclePct = Number(anchor.today_failure_pct);
  const health = 100 - cyclePct;
  const yearsLeft = yearsUntil(anchor.eta_date);
  const color = MODEL_COLORS[model] || '#9ca3af';
  // Contract WAJIB #5: eta_date CAN be in the past for track='as_is' -- a
  // unit already overdue on its current cycle. yearsLeft going negative is
  // the expected shape of that, not a bug to guard against.
  const overdue = yearsLeft !== null && yearsLeft < 0;

  const cycleBlock = (
    <Box>
      <Typography variant="h3" sx={{ fontWeight: 700, color: PLAN_REFERENCE_COLOR, lineHeight: 1.15 }}>
        {Number.isFinite(cyclePct) ? cyclePct.toFixed(0) : '-'}%
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Jatah siklus overhaul terpakai (referensi ~{PLANNED_CYCLE_YEARS} tahun)
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
        {yearsLeft === null
          ? 'Belum diketahui kapan jatah siklus habis dalam horizon proyeksi'
          : overdue
            ? `Sudah ${Math.abs(yearsLeft).toFixed(1)} tahun melewati target jatah siklus -- TA mungkin sudah lewat jadwal atau belum tercatat`
            : `~${yearsLeft.toFixed(1)} tahun lagi menuju jatah siklus habis (Turn Around berikutnya)`}
      </Typography>
    </Box>
  );

  const healthBlock = (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color, lineHeight: 1.15 }}>
        {Number.isFinite(health) ? health.toFixed(1) : '-'}%
      </Typography>
      <Typography variant="caption" color="text.secondary">
        SoH siklus berjalan saat ini
      </Typography>
    </Box>
  );

  return (
    <MainCard sx={{ height: '100%', bgcolor: '#F7F8FA' }} contentSX={{ p: 2.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, mb: wide ? 1 : 0.5 }}>
        Model {MODEL_LABELS[model] || model}
      </Typography>

      {wide ? (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2, sm: 5 }}
          divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />}
        >
          {cycleBlock}
          {healthBlock}
        </Stack>
      ) : (
        <>
          {cycleBlock}
          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>{healthBlock}</Box>
        </>
      )}

      <Box sx={{ mt: wide ? 2 : 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Target Turn Around (proyeksi model): {anchor.eta_date ? fmtDate(anchor.eta_date) : 'belum tercapai dalam horizon proyeksi'}
          {yearsLeft !== null && (overdue ? ` (sudah ~${Math.abs(yearsLeft).toFixed(1)} tahun lewat)` : ` (~${yearsLeft.toFixed(1)} tahun lagi)`)}
        </Typography>

        {anchor.overhaul_active_since && (
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#9271FF', fontWeight: 600 }}>
            Overhaul aktif sejak {fmtDate(anchor.overhaul_active_since)} -- siklus (bukan umur turbin) dihitung ulang dari titik ini
          </Typography>
        )}
      </Box>
    </MainCard>
  );
}

/**
 * FailureForecastChart - turbine State-of-Health (SoH) curve, "like a phone
 * battery" per the pembimbing's framing (100% -> 0%), drawn from COD
 * (2015-06-29) through today (solid, failure_forecast_history) and on into
 * the projection (dashed, failure_forecast_projection).
 *
 * **Contract change 16 Sep 2026** (CONTRACT.md "PERUBAHAN BESAR" banner):
 * `failure_pct` no longer measures progress toward 30-year design life --
 * it's now "% of ONE overhaul cycle (~4 years) used up", resetting to 0 at
 * every recorded overhaul. The curve is a SAWTOOTH, not one long ramp. This
 * component was updated to match:
 * - `track`: rows are filtered to `'as_is'` (the honest "no future overhaul
 *   assumed" line) -- `'scheduled'` (the "if the ~4y cycle is kept"
 *   what-if line) is deliberately NOT rendered yet, kept available in the
 *   raw fetched rows for a possible future comparison-line feature. WAJIB
 *   per contract: without this filter, the two tracks would overlap.
 * - `cycle_index`: points from a different cycle are never connected into
 *   one line segment (see insertCycleGaps above) -- doing so would draw
 *   "damage decreasing" that never happened.
 * - `failure_pct`/`health_pct` are NEVER clamped (see yAxisBounds below) --
 *   an overdue cycle can legitimately show >100%/<0%, and clipping that at
 *   the axis level is exactly the kind of silent clamp the contract warns
 *   against, even without touching the underlying value.
 * - `eta_date` can be in the past for an overdue `as_is` cycle -- `overdue`
 *   below branches the copy instead of assuming `eta_date > now()`.
 *
 * health_pct = 100 - failure_pct is a pure display flip done here, not by
 * the backend -- the wire contract's source of truth stays failure_pct,
 * matching how the AI side's own DegradationChart.tsx does this same
 * transform only at render time.
 *
 * historyRows carries a `segment` ('nominal' -- no risk data yet in this
 * cycle, 'observed' -- real trajectory) that isn't used for styling here --
 * both draw as one solid "historis" line, since neither is a prediction the
 * way the projection is.
 */
const FailureForecastChart = ({ rows = [], historyRows = [], loading = false }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  // overhaul_active_since is a run-level flag repeated on every row of
  // EITHER track (same value or null across all of them, see the contract)
  // -- .find rather than rows[0] only so a transient partial fetch doesn't
  // miss it.
  const overhaulActiveSince = useMemo(() => rows.find((r) => r.overhaul_active_since)?.overhaul_active_since ?? null, [rows]);
  const cycleAnchor = useMemo(() => cycleAnchorMs(overhaulActiveSince), [overhaulActiveSince]);

  // 'as_is' = the honest default (no future overhaul assumed). Falls back
  // to treating a row with no `track` at all as 'as_is' -- defensive only,
  // every row should carry one post-migration.
  const asIsRows = useMemo(() => rows.filter((r) => (r.track ?? 'as_is') === 'as_is'), [rows]);

  const byModel = useMemo(() => {
    const grouped = {};
    asIsRows.forEach((r) => {
      if (!grouped[r.model]) grouped[r.model] = [];
      grouped[r.model].push(r);
    });
    Object.values(grouped).forEach((list) =>
      list.sort((a, b) => new Date(a.projection_date).getTime() - new Date(b.projection_date).getTime())
    );
    return grouped;
  }, [asIsRows]);

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

  // Raw historical points (cycleIndex kept), COD -> today, one array per
  // model -- shared source for the main "historis" line (insertCycleGaps),
  // the overhaul-boundary connector series, and the zero-risk counterfactual
  // series below, so none of them can disagree about where a cycle
  // actually changed.
  //
  // zeroRiskY (added 2026-09-17): `zero_risk_failure_pct` is a closed-form
  // counterfactual -- the curve if turbine_risk_history had read exactly
  // 0% for the whole history, same age-in-cycle input as `failure_pct` on
  // the same row, just the exp(-gamma) floor with no real risk trajectory
  // added on top. NOT "uncorrected"/"before direction annotation" -- don't
  // conflate with this file's raw/adjusted distinction, which is a
  // different axis entirely. Schema-nullable and expected absent until
  // the AI side's migration + worker restart land (see
  // getFailureForecastHistory in externalController.js) -- `?? null`
  // keeps this component from crashing on rows that don't have it yet;
  // the series derived from it below simply comes out empty until then.
  const historicalRawPoints = useMemo(() => {
    const out = {};
    models.forEach((model) => {
      out[model] = (historyByModel[model] || []).map((r) => ({
        x: new Date(r.point_date).getTime(),
        y: Number((100 - Number(r.failure_pct)).toFixed(3)),
        cycleIndex: Number(r.cycle_index ?? 0),
        zeroRiskY: r.zero_risk_failure_pct != null ? Number((100 - Number(r.zero_risk_failure_pct)).toFixed(3)) : null
      }));
    });
    return out;
  }, [historyByModel, models]);

  // Solid "historis" line, broken into cycle-separated segments via
  // insertCycleGaps -- history can already span more than one recorded
  // overhaul cycle (cycle_index 0, 1, ...), and none of them connect to
  // the next.
  const historicalSeriesData = useMemo(() => {
    const out = {};
    models.forEach((model) => {
      out[model] = insertCycleGaps(historicalRawPoints[model] || []);
    });
    return out;
  }, [historicalRawPoints, models]);

  // Visual-only event marker at each recorded overhaul -- see
  // buildCycleBoundaryConnectors's own doc comment. Rendered as its own
  // series (OVERHAUL_CONNECTOR_COLOR), never merged into historicalSeriesData.
  const overhaulConnectors = useMemo(() => {
    const out = {};
    models.forEach((model) => {
      out[model] = buildCycleBoundaryConnectors(historicalRawPoints[model] || []);
    });
    return out;
  }, [historicalRawPoints, models]);

  // Zero-risk counterfactual, HISTORY ONLY (never extended into
  // projectionSeriesData -- the backend doesn't compute this for the
  // forward projection, and inventing one here would misrepresent it as
  // sourced data). Points missing zeroRiskY are dropped rather than
  // plotted as 0 -- a patchy pre-migration response degrades to "line
  // partially drawn", not "line drawn wrong". Still cycle-gapped like the
  // real curve: `zero_risk_failure_pct` is computed from the same
  // cycle-relative age input as `failure_pct`, so it resets at the same
  // boundaries.
  const zeroRiskCounterfactualSeriesData = useMemo(() => {
    const out = {};
    models.forEach((model) => {
      const points = (historicalRawPoints[model] || [])
        .filter((p) => p.zeroRiskY != null)
        .map((p) => ({ x: p.x, y: p.zeroRiskY, cycleIndex: p.cycleIndex }));
      out[model] = insertCycleGaps(points);
    });
    return out;
  }, [historicalRawPoints, models]);

  // How far past "today" the `as_is` projection is actually PLOTTED --
  // NOT a data clamp (the backend keeps computing/returning the full
  // horizon, decades out, per contract WAJIB #4's "never clamp the value"),
  // purely a display-range decision. Found live 2026-09-16: with no future
  // overhaul ever assumed, `as_is` keeps accelerating (Weibull beta=2.5)
  // for as long as the backend projects it -- one real report showed it
  // reaching health_pct ~ -5230% by ~2048. A single point that extreme
  // stretched the y-axis so far that the real, meaningful sawtooth teeth
  // (0-100%, 2016-today) compressed into under 2% of the chart's height --
  // visually flat even though the underlying data was correct. Reuses
  // PLANNED_CYCLE_RANGE_YEARS[1] (6) rather than inventing a fourth magic
  // number: "don't plot further out than the upper end of our own
  // literature reference band, past today" is an easy rule to justify and
  // ties to a number already explained elsewhere on this chart. Measured
  // from "now" (not from cycleAnchor) so it stays a fixed-length,
  // always-positive window regardless of how overdue the current cycle
  // already is.
  const projectionDisplayCutoffMs = Date.now() + yearsToMs(PLANNED_CYCLE_RANGE_YEARS[1]);

  // Dashed "proyeksi" points (track='as_is' only, see asIsRows), today ->
  // display cutoff above. The historical line's last point is prepended so
  // the dashed segment starts exactly where the solid one ends -- per
  // contract, join on cycle_index + order (last observed failure_pct ==
  // today_failure_pct for the SAME cycle_index), never a date comparison,
  // so this does not assume point_date and projection_date line up
  // exactly. `as_is` should never itself cross a cycle boundary (it never
  // assumes a future overhaul) but insertCycleGaps is applied anyway for
  // consistency/robustness rather than trusting that invariant silently.
  const projectionSeriesData = useMemo(() => {
    const out = {};
    models.forEach((model) => {
      const projPoints = (byModel[model] || [])
        .filter((r) => new Date(r.projection_date).getTime() <= projectionDisplayCutoffMs)
        .map((r) => ({
          x: new Date(r.projection_date).getTime(),
          y: Number((100 - Number(r.failure_pct)).toFixed(3)),
          cycleIndex: Number(r.cycle_index ?? 0)
        }));
      const gapped = insertCycleGaps(projPoints);
      const lastHistorical = historicalSeriesData[model]?.[historicalSeriesData[model].length - 1];
      out[model] = lastHistorical ? [lastHistorical, ...gapped] : gapped;
    });
    return out;
  }, [byModel, models, historicalSeriesData, projectionDisplayCutoffMs]);

  // [historis, proyeksi, overhaul-connector, zero-risk-counterfactual] per
  // model -- keep this quadruple in sync with the three styling arrays
  // right below, they're positional.
  const series = useMemo(
    () =>
      models.flatMap((model) => {
        const label = MODEL_LABELS[model] || model;
        return [
          { name: `SoH – ${label} (historis)`, data: historicalSeriesData[model] || [] },
          { name: `SoH – ${label} (proyeksi)`, data: projectionSeriesData[model] || [] },
          { name: 'Overhaul tercatat', data: overhaulConnectors[model] || [] },
          { name: `SoH – ${label} (hipotetis risk=0%)`, data: zeroRiskCounterfactualSeriesData[model] || [] }
        ];
      }),
    [models, historicalSeriesData, projectionSeriesData, overhaulConnectors, zeroRiskCounterfactualSeriesData]
  );

  // Per-series styling, in the same [historis, proyeksi, connector,
  // zero-risk] quadruple as `series` above -- same model color both data
  // halves, dashed only for proyeksi (same "solid observed + dashed
  // predicted" convention as the TDS AI2 overlay in
  // RealTimeDataChart.jsx); the connector always gets
  // OVERHAUL_CONNECTOR_COLOR (marks an event, not model output); the
  // zero-risk counterfactual always gets ZERO_RISK_COUNTERFACTUAL_COLOR
  // (a hypothetical, not model output either), thin and semi-transparent
  // so it reads as background context, never competing with the real
  // curve for attention.
  const seriesColors = useMemo(
    () =>
      models.flatMap((model) => [
        MODEL_COLORS[model] || '#9ca3af',
        MODEL_COLORS[model] || '#9ca3af',
        OVERHAUL_CONNECTOR_COLOR,
        ZERO_RISK_COUNTERFACTUAL_COLOR
      ]),
    [models]
  );
  const seriesDashArray = useMemo(() => models.flatMap(() => [0, 6, 0, 2]), [models]);
  const seriesStrokeWidth = useMemo(() => models.flatMap(() => [3, 2, 4, 1.5]), [models]);

  // Vertical dashed line per model at its own eta_date, when the horizon
  // returned actually reaches it AND it falls within the displayed window
  // (projectionDisplayCutoffMs) -- an eta_date beyond the cutoff would
  // place the annotation outside the plotted x-range entirely, so it's
  // skipped rather than drawn off-chart. Not an issue for an already-
  // overdue cycle (its eta_date is in the past, well inside the window);
  // matters for a not-yet-overdue model whose eta could land years out.
  const etaAnnotations = useMemo(
    () =>
      models
        .map((model) => {
          const etaDate = (byModel[model] || [])[0]?.eta_date;
          if (!etaDate) return null;
          const x = new Date(etaDate).getTime();
          if (Number.isNaN(x) || x > projectionDisplayCutoffMs) return null;
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
    [byModel, models, projectionDisplayCutoffMs]
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

  // Generic industry-literature reference band [anchor+2y, anchor+6y] + a
  // midline at anchor+4y -- ONE band for the whole chart (not per-model:
  // the literature reference is independent of which aging model is
  // shown), same anchor rule as the reset control's context note
  // (cycleAnchor above). Deliberately labeled "(literatur)": since the 16
  // Sep 2026 contract change the model's OWN `eta_date`/`failure_pct` are a
  // REAL hazard-weighted computation of the current cycle (see
  // ModelStatusCard) -- this band is a separate, calendar-only heuristic
  // reference for comparison, not a duplicate of what the model computes.
  // Must keep working with 1 model as cleanly as 2 (linear retired from
  // the AI-side worker) -- nothing here depends on `models`.
  const cycleBandAnnotation = useMemo(
    () => ({
      x: cycleAnchor + yearsToMs(PLANNED_CYCLE_RANGE_YEARS[0]),
      x2: cycleAnchor + yearsToMs(PLANNED_CYCLE_RANGE_YEARS[1]),
      fillColor: PLAN_REFERENCE_COLOR,
      opacity: 0.1,
      label: {
        text: `Referensi literatur: siklus ${PLANNED_CYCLE_RANGE_YEARS[0]}–${PLANNED_CYCLE_RANGE_YEARS[1]} th`,
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
        text: `~${PLANNED_CYCLE_YEARS} th (literatur)`,
        orientation: 'horizontal',
        style: { color: '#fff', background: PLAN_REFERENCE_COLOR, fontSize: '10px' }
      }
    }),
    [cycleAnchor]
  );

  // Full plotted time span (COD/earliest history point -> furthest ETA or
  // projection point), used only as the reference scale for
  // resolveAnnotationCollisions above -- not rendered anywhere itself.
  const chartDomainMs = useMemo(() => {
    const xs = models.flatMap((model) => [
      ...(historicalSeriesData[model] || []).map((p) => p.x),
      ...(projectionSeriesData[model] || []).map((p) => p.x)
    ]);
    return xs.length ? Math.max(...xs) - Math.min(...xs) : 0;
  }, [models, historicalSeriesData, projectionSeriesData]);

  const xaxisAnnotations = useMemo(() => {
    const base = anchorAnnotation ? [anchorAnnotation, ...etaAnnotations] : etaAnnotations;
    // Band first so ApexCharts draws it behind the point annotations.
    const combined = [cycleBandAnnotation, cycleMidAnnotation, ...base];
    return resolveAnnotationCollisions(combined, chartDomainMs);
  }, [anchorAnnotation, etaAnnotations, cycleBandAnnotation, cycleMidAnnotation, chartDomainMs]);

  // Y-axis bounds -- NEVER a fixed [0, 100]. Contract WAJIB #4 (16 Sep
  // 2026): failure_pct/health_pct must never be clamped, and a fixed axis
  // range clips an overdue cycle just as effectively as clamping the value
  // itself would (Unit 5 is at health_pct ~ -148 as of this change). 100 is
  // still a safe, meaningful ceiling -- failure_pct can't go below 0 per
  // contract, so health_pct can't exceed 100 -- only the floor needs to
  // expand, and only when the data actually goes there.
  const yAxisBounds = useMemo(() => {
    const values = models
      .flatMap((model) => [
        ...(historicalSeriesData[model] || []),
        ...(projectionSeriesData[model] || []),
        ...(zeroRiskCounterfactualSeriesData[model] || [])
      ])
      .map((p) => p.y)
      .filter((v) => v != null && Number.isFinite(v));
    const dataMin = values.length ? Math.min(...values) : 0;
    const min = Math.min(0, dataMin);
    const padding = min < 0 ? Math.abs(min) * 0.08 : 0;
    return { min: Math.floor(min - padding), max: 100 };
  }, [models, historicalSeriesData, projectionSeriesData, zeroRiskCounterfactualSeriesData]);

  // Contract §1.3: an overdue cycle (failure_pct > 100) is a real, expected
  // reading, not a bug -- but showing it bare risks reading as "the turbine
  // is broken" instead of "this cycle's interval has been exceeded". Uses
  // the same safe phrasing CONTRACT.md itself suggests for this exact case.
  const isOverdue = models.some((model) => Number((byModel[model] || [])[0]?.today_failure_pct) > 100);

  // Horizontal 0% reference line -- requested by the user 2026-09-16: with
  // yAxisBounds now auto-expanding well below 0 for an overdue cycle (e.g.
  // 100%, -349%, -799%, ...), it wasn't obvious at a glance exactly where
  // the curve actually crosses into negative health. Always rendered
  // (not conditional on the data actually going negative) so it doesn't
  // pop in/out as the curve moves around 0 -- it's a fixed scale marker,
  // same idea as always showing 0 on a temperature axis.
  const yaxisAnnotations = useMemo(
    () => [
      {
        y: 0,
        borderColor: ZERO_LINE_COLOR,
        strokeDashArray: 4,
        label: {
          text: '0%',
          position: 'left',
          offsetX: 20,
          style: { color: '#fff', background: ZERO_LINE_COLOR, fontSize: '10px' }
        }
      }
    ],
    []
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
      colors: seriesColors,
      stroke: { curve: 'smooth', width: seriesStrokeWidth, dashArray: seriesDashArray },
      markers: { size: 0, hover: { size: 5 } },
      dataLabels: { enabled: false },
      legend: { show: true, position: 'top', horizontalAlign: 'right', fontSize: '11px' },
      annotations: { xaxis: xaxisAnnotations, yaxis: yaxisAnnotations },
      // Extra top padding gives resolveAnnotationCollisions' stacked labels
      // (e.g. plan-cycle midline + "Hari ini" landing close together) room
      // to sit above the plot area instead of getting clipped at the card edge.
      grid: { borderColor: '#eef0f4', strokeDashArray: 4, padding: { left: 12, right: 16, top: 30 } },
      xaxis: {
        type: 'datetime',
        title: { text: 'Tanggal (COD → proyeksi)', style: { fontSize: '12px', color: '#8b93a7' } },
        labels: { style: { fontSize: '11px', colors: '#8b93a7' } }
      },
      yaxis: {
        min: yAxisBounds.min,
        max: yAxisBounds.max,
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
    [series, seriesColors, seriesStrokeWidth, seriesDashArray, xaxisAnnotations, yaxisAnnotations, yAxisBounds, loading]
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
          State of Health (SoH) Turbin – Riwayat & Proyeksi Siklus Overhaul
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {generatedAt
            ? `Dihitung ${fmtDate(generatedAt)} · kurva gigi-gergaji: SoH reset ke 100% tiap overhaul mayor tercatat; pita oranye = referensi literatur siklus rencana (~${PLANNED_CYCLE_YEARS} tahun, rentang ${PLANNED_CYCLE_RANGE_YEARS[0]}–${PLANNED_CYCLE_RANGE_YEARS[1]} tahun)`
            : `Riwayat & proyeksi siklus overhaul turbin sejak COD, dengan referensi literatur siklus ~${PLANNED_CYCLE_YEARS} tahun sebagai pembanding`}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
          Proyeksi ditampilkan sampai ~{PLANNED_CYCLE_RANGE_YEARS[1]} tahun ke depan untuk keterbacaan -- asumsi "tidak
          ada overhaul lagi" untuk jangka yang jauh lebih panjang tetap dihitung di backend, cuma sengaja tidak
          digambar di sini karena akan menekan skala sumbu-Y sampai bagian riwayat yang justru penting jadi kelihatan
          rata.
        </Typography>
      </Box>

      {isOverdue && (
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          Siklus overhaul yang sedang berjalan sudah melewati interval rencana ~{PLANNED_CYCLE_YEARS} tahun. Ini{' '}
          <strong>bukan</strong> berarti turbin rusak — skala ini mengukur jarak ke Turn Around berikutnya, bukan sisa umur
          turbin. Kemungkinan: TA memang sudah lewat jadwal, atau sudah ada TA yang belum dicatat di sistem (pakai tombol
          reset di bawah kalau begitu).
        </Alert>
      )}

      <Box ref={containerRef} sx={{ width: '100%' }} />

      {models.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {models.map((model) => (
            // Full width when this is the only model card (models.length
            // driven, not a hardcoded "always 1" assumption -- see the
            // `wide` doc comment on ModelStatusCard) so it doesn't stretch
            // to a half-width slot with the other half sitting empty.
            <Grid size={{ xs: 12, sm: models.length > 1 ? 6 : 12 }} key={model}>
              <ModelStatusCard model={model} rows={byModel[model] || []} wide={models.length === 1} />
            </Grid>
          ))}
        </Grid>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, lineHeight: 1.6 }}>
        <strong>Keterbatasan:</strong> model (Weibull hazard/Cox PH) adalah heuristik reliability-engineering yang
        dikalibrasi dari literatur industri (siklus overhaul mayor ≈{PLANNED_CYCLE_YEARS} tahun, rentang wajar{' '}
        {PLANNED_CYCLE_RANGE_YEARS[0]}–{PLANNED_CYCLE_RANGE_YEARS[1]} tahun), <strong>bukan</strong> model machine learning
        yang divalidasi ke kejadian gagal nyata — riwayat overhaul Unit 5 di sistem ini nyaris kosong (satu-satunya titik
        data publik: Turn Around 14 Jan 2021), sehingga angka overdue yang ekstrem sebagian besar juga bisa mencerminkan{' '}
        <strong>catatan maintenance yang tidak lengkap</strong>, bukan cuma kondisi turbin sesungguhnya. Angka di atas adalah{' '}
        <strong>estimasi skenario relatif terhadap siklus overhaul</strong>, bukan tanggal kegagalan turbin yang pasti.
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
