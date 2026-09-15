# pltp-iot — Working Notes

Working notes for this repo, organised by scope. Update the relevant
section in place when status changes — don't append a new dated section
next to an old one describing the same work.

## Backend — AI1a direction annotation integration

Layer built on the AI side (`AI_Pertasmart_V3` repo) that annotates each
`ai1a` anomaly detection row with a process direction (favorable/
unfavorable to the PLTP process) — AI1a (Isolation Forest) itself is a
pure statistical detector with no notion of which direction is good or
bad. New table `ai1a_direction_annotation`, schema in
`docs/vps_ai_tables.sql`.

**Shipped (PR #1, merged to `main`):**
- `GET /api/external/ai1a/direction` — new, read-only. Joins `ai1a` to
  `ai1a_direction_annotation` on `(source_table, source_id)`, exposes
  `direction_flag`/`drivers_json`. Defaults `source_table='ai1a'`
  (production; AI1a-70 hasn't cut over from the 65-feature model yet).
  No UI disclaimer/badge and no `disclaimer` response field — that
  requirement was withdrawn and confirmed dropped directly with the user
  on 2026-08-21.

**In progress, branch `feat/ai1a-adjusted-risk` (not yet merged):**
- Modifies the *existing* `GET /api/external/ai1a` (`getAi1aData`) to
  return direction-*corrected* `risk_percentage`/`is_anomaly`/`severity`
  (LEFT JOIN to `ai1a_direction_annotation`, COALESCE fallback to the raw
  `ai1a` columns when a row isn't annotated yet). Field names/response
  shape are unchanged. This deliberately reverses the original "purely
  additive, don't touch existing behavior" scope — confirmed directly with
  the user on 2026-08-21, since this endpoint feeds what real PLTP
  Kamojang operators see as current risk (dashboard risk card, prediction
  page's Observed Risk History chart, the AI1a history table).
  - **BLOCKED on deploy**: depends on
    `ai1a_direction_annotation.adjusted_risk_percentage` /
    `adjusted_is_anomaly` / `adjusted_severity`, being added by a parallel
    AI-side task (Agent 9/10, in `AI_Pertasmart_V3`). Not yet confirmed to
    exist on the VPS as of this commit. If they don't exist, the query
    fails outright (undefined column) rather than degrading gracefully —
    do not merge/deploy until the AI_Pertasmart_V3 master session confirms
    the columns are live.
  - **FE relabeling required, also blocking deploy**: the "no frontend
    change needed" claim above was wrong — caught by the "PERTASMART FE/BE
    deployment ke VPS" session on 2026-08-21. The API shape doesn't
    change, but `src/pages/analytics/prediction.jsx` labels the values
    this endpoint returns as raw/observed (`title="Risk Teramati
    Sekarang"`, subtitle `"Nilai observed, bukan prediksi"`,
    `title="Observed Risk History"`, `badge="OBSERVED"`) — once the values
    are direction-corrected, those labels become false. This is the same
    class of mislabeling that refactor `9305770` fixed in the other
    direction (chart titled "prediction" that was actually observed data).
    User decided 2026-08-21: keep the in-place overwrite, but the FE
    relabeling must ship in the same deploy, not after — the deploy
    session owns that FE work. **Do not deploy the BE change without the
    FE relabel landing together.**

**Deploy mechanics:** the VPS deploy is a single `git pull origin main`
against one combined FE+BE folder — merging either PR above also pulls in
whatever else has landed on `main` since the last deploy. As of
2026-08-21 that includes an unrelated auth migration
(`007_secure_admin_writes.sql`) that must run before `pm2 restart`, and a
frontend build. See the "PERTASMART FE/BE deployment ke VPS" session for
the actual deploy commands — don't improvise deploy steps here.

**Coordination:** this work is driven by cross-session messages from the
"AI_Pertasmart_V3 master session"; deploy commands are prepared by the
"PERTASMART FE/BE deployment ke VPS" session and held until PR
review/merge per the master session's instruction.

## Backend/Frontend — Failure-forecast SoH: history curve + overhaul reset

Driven by cross-session handoffs from the AI side (`AI_Pertasmart_V3`
repo) — full data contract in their `docs/failure_forecast_contract_for_beFE.md`
(not tracked in this repo's git, relayed via chat).

**Shipped 2026-09-15, pushed `main`, deployed VPS (commit `53f136f`):**
- `GET /api/external/failure-forecast/history` (`getFailureForecastHistory`)
  — historical SoH curve, COD 2015-06-29 → today, joins onto the existing
  `GET /api/external/failure-forecast` projection at the anchor point via
  the `segment` column (`'nominal'`/`'observed'`), never a date comparison.
- `FailureForecastChart.jsx` draws both as one line per model: solid
  historis + dashed proyeksi, connected at the join point, with a "Hari
  ini" annotation. New hook `useFailureForecastHistory.js` (separate file
  from `useFailureForecastData.js` — one hook, one endpoint).
- Deploy: `git pull` fast-forward, `pm2 restart Pertasmart-api`, `npm run
  build`, verified via `SSH BE FE Agent` session (curl + `pm2 list`
  before/after, HTTP 200 on `/` and `/prediction`).

**Shipped 2026-09-15, same day, not yet deployed to VPS:** admin-only
"Catat Overhaul Selesai (Reset SoH)" control, per a follow-up handoff from
the AI side's "Master Session" (`ai-pertasmart-v3`).

- `failure_forecast_overhaul_event` (schema owned by `AI_Pertasmart_V3`,
  already live on the shared VPS Postgres) — `id`, `created_at` (this IS
  the effective overhaul date, not an insert timestamp — confirmed against
  their `overhaul_event.py`), `undone_at` (soft-delete only, never
  hard-deleted). No "recorded by" column exists in the shared schema — who
  pressed the button is only in this server's console log, not persisted;
  flagged rather than silently fixed by altering a table the AI worker also
  reads.
- New endpoints in `externalController.js`/`external.js`: `GET
  /api/external/failure-forecast/overhaul` (public read, list + derive
  "active event" client-side), `POST .../overhaul-reset` and `POST
  .../overhaul-undo` (both `authenticateToken` + `requireRole('admin')`).
  **INSERTs directly into the AI-side's table** (recommended design from
  their handoff) rather than proxying to their internal port-8600 tool —
  that tool's password is never read/stored/forwarded here.
- FE: `OverhaulResetControl.jsx` (new file, single responsibility — separate
  from `FailureForecastChart.jsx`), rendered under the SoH chart on
  `/prediction`. Status/history visible to any signed-in viewer; reset/undo
  buttons admin-only (`getCurrentUser().role`, UX guard only — the backend
  role check is the real gate). Reset dialog lets the operator pick a
  **manual past date** (default today, min COD, max today) — per
  `argumen_horizon_forecast_kegagalan.md` §11.5, deliberately NOT an
  automatic/fixed-cycle reset; a "~4 tahun, rentang 2–6 tahun" note is shown
  as pure context, never a validation rule or a blocker.
- Verified locally: `vite build` + `eslint` clean (no new errors/warnings).
- **Not yet deployed** — master session said deploy is deliberately deferred
  (coordinating with a separate VPS-access task), do not push/deploy this
  without checking with them first that the timing still holds.

## Frontend — NCG chart y-axis auto-fit (2026-09-15)

Bug flagged by the AI side's "Master Session" (dosen feedback): "NCG Real
Time Data (AI)" on `/dashboard/ncg` had its y-axis hardcoded to `-1..1 wt%`
(`Ai2Chart` `yAxisMin`/`yAxisMax` in `NCG.jsx`) — ~5x wider than NCG's real
~0.2–0.3wt% fluctuation, so the line rendered as flat.

- **Fix**: removed the fixed baseline from `NCG.jsx` (falls through to
  `Ai2Chart`'s auto-scale path) rather than hardcoding a new fixed range —
  per the master session's own recommendation, so a future drift in NCG's
  range (AI2 retrain, plant condition change) doesn't silently clip data
  outside a number nobody remembers to update.
- That auto-scale path itself had a latent bug for small-magnitude metrics:
  `computeYRange` floored/ceiled a ±1% pad to the nearest **whole number**
  — fine for a 0–100 metric, but that rounds anything under ~1 straight to
  a `[0, 1]` axis, i.e. exactly as flat as the bug being fixed. Replaced
  with `niceAxisBounds` (`Ai2Chart.jsx`) — classic nice-numbers algorithm,
  pads+snaps to a tick step derived from the data's own span (verified via
  a standalone script: 0.20–0.28wt% → axis 0.18–0.30 step 0.02; a flat
  single reading still gets a sane small window, not `[0,1]`).
- `dryness.jsx`/`prediction.jsx`'s fixed-baseline charts are unaffected —
  only the no-baseline path changed, and NCG is the only current caller of
  it (confirmed via grep before changing shared code).
- Verified: `vite build` + `eslint` clean. **Not visually checked against
  live data** (would need an authenticated dev-server session) — worth a
  quick look on `/dashboard/ncg` once deployed.
- Pushed `main` (`25d5b60`). Deploy bundled with tomorrow's batch per the
  master session (reset button + this + their other pending VPS work).
