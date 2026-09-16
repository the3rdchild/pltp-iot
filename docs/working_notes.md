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
