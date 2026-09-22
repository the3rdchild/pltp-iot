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

## Frontend — SoH chart headline reframed to planned overhaul cycle (2026-09-16)

Follow-up from the AI side's "Master Session": the SoH chart itself still
headlined ETA/T_desain=30-year framing (ETA ~2045) even though the reset-
control section right below it already used the newer predictive-
maintenance framing ("siklus overhaul rencana ~4 tahun") — the page was
internally inconsistent between its two halves.

- `FailureForecastChart.jsx`: added a reference band
  `[anchor+2y, anchor+6y]` + midline `anchor+4y` to the chart itself
  (`anchor` = active overhaul event else COD — same rule as the reset
  control). **One band for the whole chart, not per-model** (the plan is
  model-independent) — verified it still renders correctly with only 1
  model curve, since `linear` is mid-removal from the AI-side worker per
  the master session's FYI.
  - `ModelStatusCard` reframed: cycle-progress-toward-plan is now the
    primary (h3) number per card; "State of Health saat ini" stays its own
    labeled block below a divider; ETA is demoted to a muted caption line
    (kept, not deleted). Headline copy switches between "menuju"/"dari"
    depending on whether the plan's 4-year midpoint has already passed —
    checked this against the REAL current data (no overhaul ever recorded,
    anchor = COD 2015): today that's ~11 years past COD, so the tile
    correctly reads "~280%, sudah X tahun melewati titik tengah rencana",
    not a nonsensical "menuju... 280%".
- Extracted `COD_DATE`/`PLANNED_CYCLE_YEARS`/`PLANNED_CYCLE_RANGE_YEARS`
  (previously only inside `OverhaulResetControl.jsx`) into a new
  `utils/failureForecastCalibration.js` — single source so the chart and
  the reset control can't drift on what "the plan" means, same class of
  bug as the NCG y-axis fix above. `OverhaulResetControl.jsx` now imports
  from there instead of redefining.
- Verified: `vite build` + `eslint` clean; ran the cycle-progress/band math
  standalone against both the no-override (COD anchor) and an active-
  override scenario before committing.
- **Not visually checked in browser** (needs an authenticated dev session)
  — worth a look for annotation-label overlap once deployed, since the
  chart already draws several xaxis annotations (ETA per model, "Hari
  ini", now also the plan band + midline).
- Pushed `main` (`199a0cf`). Deploy bundled with the same batch as the
  reset button + NCG fix above.

## Production data — backdated overhaul event, Jan 2021 Turn Around (2026-09-16)

**Requested** by the user, relayed via cross-session message from the AI
side's "Master Session" (2026-09-16) — explicit instruction ("gas backdate
pake tanggal PGE itu, lu aja"), confirmed directly with the actual user of
THIS session before any write happened (a peer's claim of its own user's
authorization is not treated as approval here — see CLAUDE.md instruction-
source-boundary rule).

- **What**: one row in `failure_forecast_overhaul_event`,
  `created_at = 2021-01-14` (the PGE press release date for the Kamojang
  Unit-4/5 Turn Around — a public estimate, not a confirmed precise
  completion date; the AI side's own research doc,
  `argumen_horizon_forecast_kegagalan.md` §11.3, flags the same caveat).
  This moves the "planned overhaul cycle" anchor used by both
  `OverhaulResetControl.jsx` and `FailureForecastChart.jsx` from COD
  (2015-06-29) to this date — before this, the cycle-progress tile read a
  literal, if honest, "~280%, 11 tahun lewat" simply because no overhaul had
  ever been recorded.
- **How**: NOT a hand-written `INSERT` — a one-off script run directly on
  the VPS (via "SSH BE FE Agent") that calls the actual
  `createFailureForecastOverhaulEvent` controller function (same id
  generation / date validation / SQL as the real
  `POST /api/external/failure-forecast/overhaul-reset` endpoint), bypassing
  only the HTTP+admin-auth layer since it ran as a trusted one-off action
  directly on the server. Script deleted after running (not left on disk,
  not committed to this repo).
- **Status**: instructions sent to "SSH BE FE Agent" 2026-09-16, awaiting
  their execution + verification report (row inserted, `undone_at IS
  NULL`). `overhaul_active_since` on `failure_forecast_projection` updates
  on the AI-side worker's next run (~1 min) after the row lands, not
  instantly. **Update this section once confirmed** — don't leave this
  "awaiting" note next to a later "done" note; overwrite in place.

## Frontend — remove stale AI1a shadow toggle + fix single-model SoH layout (2026-09-16)

Two small UI fixes requested by the user, relayed via "Master Session",
independent of the SoH-anchor work above.

- **"Produksi"/"Shadow 70" toggle removed** from `prediction.jsx` (used to
  sit above "Adjusted Risk History"). AI1a-70 was promoted to production
  the same day and `AI1A_SHADOW_DIRS` is now empty on the VPS, so
  `ai1a_shadow` would only ever show frozen data from here on — not a live
  comparison arm any more. Page always reads `'ai1a'` now (the hook's own
  default); the `source_table` query param was dropped from the ai1a
  range-fetch URL rather than hardcoded to `ai1a`, since the backend
  already defaults there. `AI1A_SOURCE_TABLES` in
  `externalController.js`/`getAi1aData` itself is untouched — only this
  page's toggle is gone, so a shadow arm can still be read another way if
  one is ever reintroduced.
- **SoH stat-card layout fixed for the now-common 1-model case**:
  `FailureForecastChart`'s per-model card grid was hardcoded to a 2-up
  half-width layout; with `linear` retired from the AI-side production
  worker, the lone Weibull-Cox card stretched into one half-width slot
  with the other half sitting empty (screenshot from the user). Grid sizing
  and each `ModelStatusCard`'s internal layout (headline + SoH-now side by
  side vs. stacked) now both key off `models.length`, not a hardcoded
  single-model assumption — reverts to the original 2-up stacked layout
  automatically the moment a second model reappears.
- Verified: `vite build` + `eslint` clean. **Not visually checked in
  browser** (needs an authenticated session, same limitation as the SoH
  reframe above) — worth a look alongside that one once deployed.
- Pushed `main` (`7920e31`). Told "SSH BE FE Agent" about this commit in
  case their `git pull` for the earlier batch already ran before it
  landed — needs its own pull if so.

## Backend/Frontend — overhaul hard-delete + chart annotation collisions (2026-09-16)

Two more small fixes from the user, relayed via "Master Session", both
independent of the AI-side sawtooth-SoH work in progress.

**1. Hard-delete for already-undone overhaul events.** A test reset+undo
left a permanent "Dibatalkan" row in the history with no way to clear it
(only soft-delete/`undone_at` existed). New `DELETE
/api/external/failure-forecast/overhaul/:id` (admin-only,
`deleteFailureForecastOverhaulEvent` in `externalController.js`) — refuses
409 if the target is still active (`undone_at IS NULL`); an active event
can only ever be hard-deleted AFTER being undone first, preserving the
append-only guarantee for real data while giving a real cleanup path for
test noise. `OverhaulResetControl.jsx`: a delete icon-button now shows only
on rows already marked "Dibatalkan", with its own confirm dialog
(`deleteFailureForecastOverhaulEvent` added to `utils/api.js`).

**2. Chart annotation labels made collision-aware.** "Siklus overhaul
rencana (~4 th)" and "Hari ini" visually overlapped once the backdated
Jan 2021 anchor happened to land close to today on a chart spanning COD
2015 to an ETA around 2045 — and would collide again for a different
anchor date near "today" in the future, so a one-off nudge wasn't enough
(explicitly asked for by the user: "robust ke berbagai posisi anchor ke
depannya"). Added `resolveAnnotationCollisions` in
`FailureForecastChart.jsx`: clusters xaxis annotations (point + range)
whose x falls within a FRACTION of the chart's own plotted time domain
(8%, a heuristic — not a fixed day/pixel count, which would break at a
different domain span or container width) and stacks each cluster's label
vertically via `offsetY`. Verified against the actual reported scenario
(anchor 2021-01-14: band/midline/"Hari ini" correctly cluster and stack;
the ~2045 ETA line, ~19 years away, correctly stays untouched) with a
standalone script before committing — not just eyeballed in code.
`grid.padding.top` bumped so stacked labels have headroom instead of
clipping at the card edge.

- Verified: `vite build` + `eslint` clean, backend `node --check` clean.
  **Not visually checked in browser** (same authenticated-session
  limitation as the other chart changes above) — this one especially is
  worth an actual look once deployed, since the collision fix is a visual
  heuristic without a way for me to confirm the real rendered pixel gap.
- Pushed `main` (`70ea2f7`, two commits: hard-delete then the annotation
  fix). Not yet deployed — bundled with whatever the current deploy batch
  picks up next.

## Backend/Frontend — per-cycle `failure_pct` contract change (2026-09-16)

**Major contract change**, relayed via "Master Session": `failure_pct`/
`today_failure_pct` no longer measure "% toward 30-year design life" --
they now measure "% of ONE overhaul cycle (~4yr) used up", resetting to 0
at every recorded overhaul (sawtooth curve, not one long ramp). Full spec:
AI_Pertasmart_V3 `simulator/failure-forecast/CONTRACT.md`, banner "🚨
PERUBAHAN BESAR 16 Sep 2026".

**Deploy ordering, IMPORTANT**: the AI side is deliberately HOLDING their
DB migration (`init_failure_forecast.sql` -- adds `track`/`cycle_index`/
`cycle_anchor` columns + widens `failure_pct` to `numeric(12,3)`) and the
`pertasmart-v3-worker`/`-scheduler` restart until **we** confirm our code
is ready -- so the production dashboard never shows a half-migrated state
(new worker writing new columns our old code can't read, or vice versa).
**Do not deploy this to the VPS before the Master Session confirms their
migration + worker restart happened.** Code is pushed to `main` and passed
our own review/build, which is what unblocks their migration -- deploying
our side is a separate, later step.

Code changes, all six WAJIB items from the contract banner:

1. *(schema/type migration is the AI side's `init_failure_forecast.sql`,
   not ours -- nothing to run on our end.)*
2. `backend/controllers/externalController.js`: `getFailureForecastData`/
   `getFailureForecastHistory` now SELECT `track`/`cycle_index`
   (projection) and `cycle_index`/`cycle_anchor` (history).
3. `FailureForecastChart.jsx`: new `insertCycleGaps` breaks the historis/
   proyeksi line at every `cycle_index` change instead of connecting
   across it (connecting would draw "damage decreasing" that never
   happened -- SoH resets to 100% at each recorded overhaul).
4. Projection rows filtered to `track === 'as_is'` before any grouping
   (`asIsRows`) -- `'scheduled'` (the "if the ~4y cycle is kept" what-if
   line) is fetched but deliberately NOT rendered yet, kept in the raw rows
   for a possible future comparison-line feature. Flagged to the master
   session as a disclosed scope decision, not a missed requirement (not in
   the 6 WAJIB items).
5. `yAxisBounds` replaces the old fixed `yaxis: {min:0, max:100}` -- computed
   from the actual plotted data instead. A fixed axis clips an overdue
   cycle exactly like clamping the *value* would (Unit 5 is at
   `health_pct` ~ -148 per the contract's own 16 Sep 2026 example) --
   WAJIB #4 is about the value, but a hardcoded axis range violates the
   same spirit even if the value itself is never clamped.
6. `eta_date`-based copy (`ModelStatusCard`, `prediction.jsx`'s stat tile)
   now branches on the date being in the past (`overdue`) instead of
   assuming `eta_date > now()` -- contract WAJIB #5.
7. Replaced "umur desain"/"sisa umur turbin" framing throughout (chart
   title, disclaimer paragraph, `ModelStatusCard` labels) with
   siklus-overhaul framing (WAJIB #6); added an `Alert` with the contract's
   own suggested safe sentence when a cycle is overdue, so an extreme
   number doesn't read as "the turbine is broken".

**Also**: `ModelStatusCard`'s headline is now the backend's own
`today_failure_pct` directly, replacing this component's PRIOR client-side
calendar-elapsed approximation (`cycleProgress`, from the 2026-09-16
reframe earlier today) -- that approximation would now diverge from the
real hazard-weighted number (contract example: 5.67 calendar years overdue
computes to ~248%, not the ~142% a naive linear estimate would give) and
show two different "% of cycle" numbers on the same page. The client-side
reference band/midline (generic industry-literature ~4yr comparison, kept
in `utils/failureForecastCalibration.js`) is retained as a separate,
explicitly `(literatur)`-labeled annotation -- not a duplicate of what the
model now genuinely computes.

- Verified: `vite build` + `eslint` clean, backend `node --check` clean.
  `insertCycleGaps`/`yAxisBounds` tested standalone against a simulated
  sawtooth (COD → Jan 2021 TA → now, ending at the contract's own -148
  example) before committing -- not just read through the code.
- Pushed `main` (`35c0567`). **Deployed and confirmed working** (master
  session, 2026-09-16) -- AI side ran their migration + worker restart
  first per the ordering above, then this was deployed; track-filter fix
  confirmed live (no more overlapping/chaotic as_is vs. scheduled lines).

### Follow-up bug found live: projection tail flattened the whole chart (2026-09-16)

User found the SoH chart looked like a flat 100% line from 2016 to today
then one smooth decline to ~-5230% by ~2048 -- looked like the sawtooth
wasn't happening at all. Root cause (confirmed by the AI side via direct DB
check, not assumed): the sawtooth WAS real in the data (6 correctly
segmented cycles) -- the bug was purely in `yAxisBounds`, which read its
min from the ENTIRE `as_is` projection including the far-future tail. With
no future overhaul ever assumed, that tail keeps accelerating (Weibull
beta=2.5) for as long as the backend computes it; one extreme point that
far out stretched the axis so far the real 0-100% sawtooth compressed into
under 2% of the chart's height.

- **Fix**: bound the DISPLAYED `as_is` projection to `today + 6 years`
  (reuses `PLANNED_CYCLE_RANGE_YEARS[1]` rather than a new magic number) --
  a display-range decision, not a value clamp (WAJIB #4 still holds, the
  backend keeps computing/returning the full horizon). Measured from "now"
  so the window is always a fixed positive length regardless of how
  overdue the cycle already is. `etaAnnotations` skips an eta_date beyond
  that same cutoff (would otherwise sit outside the plotted x-range). Added
  a caption disclosing the cutoff rather than silently truncating.
- Verified: `vite build` + `eslint` clean; simulated a 25-year accelerating
  tail standalone before committing (confirmed roughly an order-of-
  magnitude reduction in the extreme value reaching the y-axis).
- Pushed `main` (`cd263d5`). Not yet confirmed deployed -- told "SSH BE FE
  Agent" and the master session, standing by for their report.

## Overhaul UX polish: instant refresh + boundary connector (2026-09-16)

Two more requests from the user while actively testing the reset feature,
both on `FailureForecastChart.jsx`/`OverhaulResetControl.jsx`.

**1. Instant chart refresh after reset/undo.** Previously the chart stayed
stale up to ~1 minute (verified live: `overhaul_active_since` stayed ~4
min stale before self-updating), waiting on the AI-side worker's own poll
cadence. AI side added a trigger for this
(`POST http://127.0.0.1:8600/api/overhaul/recompute`, CONTRACT.md §3.1,
localhost-only/no password -- only reachable from our own Node backend,
never a browser, always 202, best-effort).

- Backend: `createFailureForecastOverhaulEvent`/
  `undoFailureForecastOverhaulEvent` call it (`triggerOverhaulRecompute`)
  right after their own DB write succeeds. Failing this NEVER fails the
  write itself (try/catch, logged only) -- the normal ~60s cadence still
  catches it either way.
- FE: `useFailureForecastData`/`useFailureForecastHistory` both gained a
  `refetch` (matching `useFailureForecastOverhaul`'s existing pattern).
  `OverhaulResetControl` polls `GET /api/external/failure-forecast` every
  1s for up to 10s after a successful reset/undo (`waitForFreshProjection`),
  watching for `generated_at` to move past its pre-action value -- not a
  fixed delay, since there's still an enqueue→run→REPLACE gap even though
  the job itself usually finishes under a second. Once changed (or the
  10s budget runs out) tells `prediction.jsx` to refetch both chart hooks
  via a new `onProjectionRefresh` prop; a timeout shows a one-line note
  rather than silently doing nothing.

**2. Visual connector at cycle boundaries.** `insertCycleGaps` correctly
breaks the line at each recorded overhaul (intentional -- connecting it
would draw "damage decreasing" that never happened), but a bare gap read
as "data missing" rather than "an overhaul happened here" (user sent a
mockup: a distinct line joining the two real values at the boundary).
Added `buildCycleBoundaryConnectors` -- a separate series per model
containing only the two real endpoint values at each `cycle_index` change,
isolated per boundary so multiple overhauls don't chain into one line,
styled distinctly (`OVERHAUL_CONNECTOR_COLOR`, red, thicker) so it's never
mistaken for the real data curve. `historicalSeriesData` and this new
series now share one `historicalRawPoints` source instead of each
re-deriving points independently, so they can't disagree about where a
boundary falls.

- Verified: `vite build` + `eslint` clean, backend `node --check` clean.
  `buildCycleBoundaryConnectors` tested standalone against a simulated
  3-cycle history (two overhauls) -- confirmed two isolated connector
  segments, not one chained line.
- Pushed `main` (`08ac88d`, two commits: instant-refresh then connector).
  Not yet deployed.

## Chart 0% reference line (2026-09-16)

User asked (via Master Session) for a horizontal reference line at 0% on
the SoH chart -- with `yAxisBounds` now unclamped and often sparse (e.g.
100%, -349%, -799%), it wasn't obvious exactly where the curve crosses
from positive into negative health.

- Added a `yaxis` annotation (`{ y: 0, ... }`, ApexCharts) with a "0%"
  label, always rendered (not conditional on data actually going
  negative) so it's a fixed scale marker rather than something that pops
  in/out. New `ZERO_LINE_COLOR` (neutral gray, matches the existing axis
  label color) -- deliberately NOT `PLAN_REFERENCE_COLOR` (amber,
  literature reference) or `OVERHAUL_CONNECTOR_COLOR` (red, event marker),
  since this is neither of those.
- Verified: `vite build` + `eslint` clean. Also rendered a standalone
  ApexCharts smoke test (same annotation config against synthetic data
  crossing zero) via a temp local static server + the Browser pane, since
  the real `/prediction` page needs an authenticated session this agent
  can't log into -- confirmed the dashed line + "0%" label land exactly
  at the zero crossing.
- Pushed `main` (`434e3fd`). **Explicitly NOT deployed** -- user wants it
  bundled with tomorrow's Turbine Risk History deploy (relayed via Master
  Session); do not push this to the VPS ahead of that without checking
  first.

## Turbine Risk History chart (2026-09-16)

Item 2 of the original 7-item request (15 Sep) that had been missed --
only item 3 (SoH curve switched to `turbine_risk_history` as its input)
had actually shipped. User approved doing this tonight so it can bundle
with tomorrow's 0% reference-line deploy.

New chart on `/prediction`, directly below "Adjusted Risk History (ai1a)":
same `RiskChart` component, same range-selector/bucketing shape, fed by
`turbine_risk_history` (the separate 6-steam-quality-parameter Isolation
Forest that also anchors the SoH curve) instead of `ai1a`.

- Backend: `getTurbineRiskHistoryData`
  (`GET /api/external/turbine-risk-history`) mirrors `getAi1aData`'s
  bucketed/raw shape (reuses `resolveBucketing`/`bucketExpr` as-is) but
  simpler -- single table, no `source_table` toggle, no
  `ai1a_direction_annotation`-style LEFT JOIN needed since
  `adjusted_risk_percentage` is always populated on the row itself per the
  AI side's `turbine_risk_history_contract_for_beFE.md` (gitignored on
  their side, contents relayed via chat). `model_version` filtered to
  `'TRH_v3.0_%'` so a future retrain can't mix two risk scales into one
  series (same guard class as `ai1a_shadow`'s existing one).
- Frontend: `RiskChart` reused as-is (already built for "caller owns range
  fetching"). New `useTurbineRiskHistory` hook factors out the
  range-selector + bucketing fetch logic instead of copying ai1a's
  ~50-line inline version a second time into `prediction.jsx`. Distinct
  color (teal `#0d9488` vs ai1a's blue) per explicit user request so the
  two charts are easy to tell apart. `footnote` prop carries the three
  caveats from the contract doc verbatim in spirit: ~37-day training
  window, dryness/NCG being AI2 outputs (not sensors, ~99%
  reconstructible from P/T/TDS), direction_flag only covering
  TDS/dryness/NCG.
- Verified: `vite build` + `eslint` clean, backend `node --check` clean.
  **Could not hit the live table directly** (no DB access from this
  session) -- query construction mirrors the already-proven `ai1a` pattern
  exactly, just different table/columns.
- Pushed `main` (`1cf2790`). **NOT deployed** -- bundled with the 0%
  reference line for tomorrow's deploy, per the user's request relayed via
  Master Session.

## UI terminology rename: AI1a/AI2 jargon -> thesis-final names (2026-09-16)

Per the confirmed final terminology in the thesis document (re-confirmed
by the "BAB V laporan semhas" session, not a new proposal): `AI1a` ->
**Overall Risk History**, AI2 dryness output -> **Dryness Prediction**,
AI2 NCG output -> **NCG Prediction**, TDS nowcast -> **TDS Prediction**.
Scope confirmed by the user: **UI-rendered text only** --
file/function/variable/component names, DB table names, `model_version`
strings untouched.

**Explicitly NOT touched** (follow-up guardrail from the master session,
important to remember for any future pass over this same area):
- raw/adjusted/"mentah"/"terkoreksi" labels on the Overall Risk History
  chart -- out of scope, no official replacement term exists.
- anything mentioning Severity/severity classification -- the thesis
  dropped that concept from the REPORT only; whether it's also dropped
  from the dashboard UI is a separate, not-yet-decided product question.

Files changed: `prediction.jsx` (both risk chart titles + Turbine Risk
History's subtitle/footnote), `TDS.jsx` (predictionName), `component-
overview/history.jsx` (empty-state caption + 3 table headers, "Severity"/
"Risk %"/"Anomaly Score" wording itself untouched), `home/homeData.jsx`
(both home-page AI cards), `dashboard/default.jsx` ("Data AI belum
tersedia" x2), `settings/LabComparisonChart.jsx` (generic "Prediksi AI"
now names the specific model based on which `ai2.*` column is being
compared), `extra-pages/articles/AI2.jsx` (~13 locations, full manual
read-through -- headline, intro, comparison table, cost analysis,
conclusion, bibliography -- reworded to keep prose natural, not a blind
find-replace), `extra-pages/articles/AI1.jsx` (headline only, see below).

**⚠️ Flagged to master session, NOT resolved**: `AI1.jsx`'s explicit scope
was "rename the headline only." The rest of that article still describes
a paired "AI #1a" (current risk) / "AI #1b" (30-day LSTM forecast)
system across several sections -- this **contradicts** the brief's claim
that no AI1b text exists in the repo. AI1b's actual feature (the 30-day
risk forecast chart) was already retired from the live dashboard earlier
THIS SAME SESSION (replaced by the failure-forecast SoH chart, see the
"Pivot 'predict failure'..." section elsewhere in this file) -- so the
article is genuinely stale, describing a retired feature as if live, not
just inconsistently named. Renaming only the AI1a half there would have
produced mismatched, confusing prose against the still-present AI1b
description, so left entirely untouched pending clarification rather
than guessed. **Do not touch AI1.jsx's AI1a/AI1b sub-sections without
that clarification.**

- Verified: `vite build` + `eslint` clean on every file touched (7
  pre-existing `rules-of-hooks` errors elsewhere are unrelated -- verified
  via `git status` that those files weren't touched by this change).
  Grepped the whole `src/` tree afterward for residual "AI1a"/"AI1b"/"AI2"
  outside comments/constant names/the flagged AI1.jsx exception -- none
  found.
- Pushed `main` (`3539b6e`). **NOT deployed** -- bundled with the 0%
  reference line + Turbine Risk History chart for tomorrow's deploy.

## Zero-risk counterfactual line on SoH history (2026-09-17)

New second line on the SoH chart, **history only**: "what SoH would look
like if `turbine_risk_history` had read exactly 0% the whole time" (the
closed-form `exp(-gamma)` floor, no real risk trajectory added). NOT the
raw/adjusted distinction used elsewhere in this file -- different axis of
meaning entirely, don't conflate the two when touching this area again.

- Backend: `getFailureForecastHistory` SELECTs the new
  `zero_risk_failure_pct` column. **🚨 HARD BLOCKER, not just a bundling
  preference like the other pending items above**: the AI side's
  migration for this column is still pending their own review. Deploying
  this specific commit (`d2ec47f`) before that migration lands will
  **break `GET /api/external/failure-forecast/history` entirely** (missing-
  column 500), not just leave the new line undrawn -- do NOT deploy this
  ahead of that migration under any circumstance, unlike the other queued
  items which are safe to deploy independently of each other.
- Frontend: `FailureForecastChart.jsx`'s `historicalRawPoints` carries the
  new `zeroRiskY` (tolerant of the column being absent via `?? null`);
  `zeroRiskCounterfactualSeriesData` mirrors the real curve's cycle-gap
  handling but is NEVER extended into the projection (backend doesn't
  compute this counterfactual for the forward projection). New
  `ZERO_RISK_COUNTERFACTUAL_COLOR` (semi-transparent pink/rose, thin
  stroke) gives it its own visual identity distinct from every other
  color already used on this chart.
- Verified: `vite build` + `eslint` clean, backend `node --check` clean.
  Standalone script confirmed both the pre-migration (column absent ->
  empty series, no crash) and post-migration (populated -> correct
  cycle-gap) cases before committing.
- Pushed `main` (`d2ec47f`). **NOT deployed** -- see hard blocker above;
  wait for explicit AI-side migration confirmation, not just "tomorrow's
  batch" timing.

## Turbine Risk History live-data verification -- still outstanding

Flagged honestly when the chart was built (2026-09-16): this session has
no direct DB access, so `GET /api/external/turbine-risk-history`'s query
construction was verified by mirroring the already-proven `ai1a` pattern
exactly, NOT by hitting real data. The master session asked for this
verification as a priority item (2026-09-17) -- **still blocked**, because
the endpoint itself hasn't been deployed to the VPS yet (bundled for
tomorrow's deploy per earlier notes). Cannot verify against live data
until after that deploy; flagged back rather than left silently
unaddressed.

## Dashboard "Prediksi Resiko" false-"Ideal" bug (2026-09-17)

Found by the master session investigating their own `ai1a.severity`
retirement (goes NULL for every new row once their worker restarts --
was quietly computed from an 8-days-stale AI1b forecast, retired
alongside it). `dashboard/default.jsx`'s home-page "Prediksi Resiko" card
read `ai1aLiveData.severity` straight into `getPredictionConfig`, whose
`default:` case returned green "Ideal" for anything unrecognized --
including `null`. Once severity goes NULL, the card would show "Ideal" in
green while the real `risk_percentage` right underneath it could be high
-- not a blank/degraded state, an actively WRONG reassuring one. Two
other severity consumers (`prediction.jsx` subtitle, `component-overview/
history.jsx` table column) were independently confirmed to already
degrade safely and were left untouched.

- **Fix, two parts**: (1) read `risk_label` instead of `severity` --
  separate, unaffected column (4 tiers: normal/warning/high/critical,
  confirmed against `AI_Pertasmart_V3/README.md` §6.2/6.3, which
  explicitly documents this as the intended safe migration path). Added
  the missing `'high'` case to `getPredictionConfig` (severity only had 3
  tiers, risk_label has 4 -- `'high'` was falling through to the same bug).
  (2) fixed the `default:` case itself to return a neutral "Tidak
  diketahui" (gray) instead of a reassuring green "Ideal" -- defense in
  depth against any other unexpected value in this field, not just this
  one retirement.
- Verified: `vite build` + `eslint` clean. Standalone script exercised all
  4 `risk_label` values + null/undefined/an unrecognized string against
  the fixed function -- confirmed none reach the old false-"Ideal" path.
- Pushed `main` (`3eb76de`). **Backward-compatible, safe to deploy
  independently** -- `risk_label` is already correctly populated today,
  unaffected by whether the AI side's severity retirement has happened
  yet. Not blocked on anything else queued above; worth prioritizing
  since it also unblocks the master session's own severity-retirement
  deploy (they said they won't deploy that until this is fixed).
- **Approved for immediate separate deploy** (master session, 2026-09-17)
  -- ahead of the batch above, since it unblocks their own work. Deployed
  via `git cherry-pick 3eb76de` on the VPS, NOT `git pull`, because
  `d2ec47f` (the blocked zero-risk-counterfactual backend change) sits
  BETWEEN the VPS's last deployed commit and this one in `main`'s history
  -- a plain pull would have dragged that blocked commit along with it.
  **Consequence for the next full batch deploy**: the VPS now has a local
  commit (cherry-picked `3eb76de`, different hash, same diff) that
  `origin/main`'s history doesn't contain verbatim -- a plain `git pull`
  next time will likely NOT fast-forward cleanly. That next deploy needs
  `git pull --rebase` (or a merge) instead of a bare `pull`, and should
  double-check `src/pages/dashboard/default.jsx` doesn't end up
  duplicated/conflicted. Flag this explicitly to whichever session runs
  that deploy.

## Full batch deploy + landing redesign merge (2026-09-22)

The landing redesign branch (`redesign/landing-page`) landed on `main` and
the whole accumulated backlog went to prod in one deploy. **Deployed by
the user; this session prepared the merge and the commands but did not
run or observe the deploy itself** -- build/`pm2 restart` outcomes are
not recorded here first-hand.

- Merge `3d355eb`: `origin/main` (29 dashboard/prediction commits) merged
  into the redesign branch, resolving three conflicts. `components/home/
  homeData.jsx` kept deleted (the redesign removes the entire old landing
  page, so `3539b6e`'s rename had no surface left there); `articles/
  AI1.jsx` + `AI2.jsx` kept the redesign's rewrite (same reason -- both
  files were replaced wholesale, and the new AI1.jsx already used the
  thesis-final section names).
- `9a54490`: the four user-visible strings `3539b6e` never reached,
  because the redesign was in flight on its own branch -- the two landing
  AI card tags and the two article menu labels, now "Overall Risk History"
  and "Dryness & NCG Prediction".
- `7cbb59b`: `.claude/settings.local.json` added to `.gitignore`.

**Clears the pending-deploy backlog.** Everything previously marked "NOT
deployed"/"not yet deployed" above is now live: `d4ce8b5`, `434e3fd`,
`1cf2790`, `3539b6e`, `d2ec47f`, and the overhaul-reset control from
2026-09-15. Those markers are left as-is -- they were accurate when
written; this entry is the correction.

**The `d2ec47f` hard blocker was checked, not assumed.** Before the API
restart, `zero_risk_failure_pct` was confirmed present on
`failure_forecast_history`, queried through the backend's own pg
credentials (`DB_*` from `backend/.env`, not `DATABASE_URL` -- that
variable does not exist in this project). The AI side's migration had
landed. Had it not, the instruction was to pull and build but leave pm2
alone, since the running process keeps the old code until restarted.

**The predicted cherry-pick divergence did not materialise as predicted.**
The previous entry warned the VPS carried a local cherry-picked `3eb76de`
and that the next `git pull` would not fast-forward. The pull did fail
with divergent branches, but the VPS's only local commit was `469c520`,
a `.gitignore` edit -- the cherry-pick was gone by then. Root cause of
the divergence was therefore a local-only ignore rule, now upstream in
`7cbb59b`, so the VPS sits exactly on `origin/main` and the next deploy
fast-forwards again.

**Turbine Risk History live-data verification: DONE, and it found
something.** The verification flagged as still outstanding above is now
closed -- `GET /api/external/turbine-risk-history` returns real rows in
prod, so the query construction (mirrored from the `ai1a` pattern, never
run against real data until now) is confirmed sound.

What it exposed is upstream of us: **the feed is stale by roughly 22
hours.** The newest row is `2026-09-21T07:08:00Z`, while
`failure_forecast_history.generated_at` on the same check reads
`2026-09-22T05:13:21Z`, so the wall clock was at least that. Consecutive
rows sit 1 minute apart, so a gap that size is not the normal cadence.
The endpoint takes no date params by default and runs `ORDER BY
"timestamp" DESC LIMIT 50`, so that first row really is the table's
newest -- this is not a read-side artefact. Nothing to fix in this repo;
it points at the AI side's `turbine_risk_history` writer having stopped
around 2026-09-21 07:08Z. Raise it with them.

Also noticed on those rows, lower confidence and not chased:
`adjusted_risk_percentage` equals `risk_percentage` exactly on every row
returned (74.76/74.76, 75.84/75.84). That may well be normal when no
adjustment applies, but the raw/adjusted distinction is load-bearing on
the Overall Risk History chart, so it is worth one confirming glance.

**Worth flagging to the master session:** the admin overhaul-reset control
(2026-09-15) carried an explicit hold -- "do not push/deploy this without
checking with them first that the timing still holds". It went out with
this batch. If that check did not happen, they should be told.

**Not verified:** the landing redesign has had no browser check. No
headless browser was available to the session that built it, so `/about`,
`/cara-kerja-pltp`, the article contents rails, and the new Sampling NCG
photo have only been confirmed via `vite build` + `eslint`.
