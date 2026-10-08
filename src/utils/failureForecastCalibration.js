/**
 * Shared calibration constants + math for the failure-forecast SoH feature
 * (FailureForecastChart.jsx + OverhaulResetControl.jsx) -- "the planned
 * overhaul cycle" reference used for the reset-date bound, the chart's
 * reference band/stat tile, and the reset control's context note. One
 * place so those components never drift on what "the plan" means (see the
 * NCG y-axis fix, 2026-09-15, for what happens when the same domain number
 * gets redefined in more than one spot).
 *
 * See AI_Pertasmart_V3/docs/argumen_horizon_forecast_kegagalan.md §11.5:
 * Unit 5's real overhaul cycle isn't known (one public data point only), so
 * these numbers are shown purely as context for an operator's own
 * judgement call -- never a validation rule or an automatic trigger.
 */

// Commercial-operation-date -- the earliest an overhaul cycle can anchor to
// (an overhaul event can't predate it). Same bound the backend enforces
// (OVERHAUL_COD_DATE in backend/controllers/externalController.js).
export const COD_DATE = '2015-06-29';

// Reference-only planned overhaul cycle: 4 years as the midpoint, 2-6 as
// the defensible range (industry literature + the one verifiable Kamojang
// data point -- see the research doc above).
export const PLANNED_CYCLE_YEARS = 4;
export const PLANNED_CYCLE_RANGE_YEARS = [2, 6];

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

export const yearsToMs = (years) => years * YEAR_MS;

/**
 * The date the current overhaul cycle counts from: the active overhaul
 * event if one exists, else COD. Both the reset control and the chart use
 * this same rule so they always agree on "when the clock last reset".
 *
 * @param {string|null|undefined} overhaulActiveSince - failure_forecast_projection.overhaul_active_since
 * @returns {number} epoch ms
 */
export const cycleAnchorMs = (overhaulActiveSince) =>
  overhaulActiveSince ? new Date(overhaulActiveSince).getTime() : new Date(COD_DATE).getTime();

/**
 * Progress toward the planned overhaul cycle from a given anchor, as of
 * now. `pct`/negative `yearsToPlanned` beyond 100%/0 are expected once the
 * plan's 4-year midpoint has passed -- the 2-6 year band is a spread, not a
 * hard deadline, so this is never clamped.
 *
 * @param {number} anchorMs - from cycleAnchorMs()
 */
export const cycleProgress = (anchorMs) => {
  const elapsedYears = (Date.now() - anchorMs) / YEAR_MS;
  return {
    elapsedYears,
    pct: (elapsedYears / PLANNED_CYCLE_YEARS) * 100,
    yearsToPlanned: PLANNED_CYCLE_YEARS - elapsedYears
  };
};
