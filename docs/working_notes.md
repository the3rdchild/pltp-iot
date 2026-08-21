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
  shape are unchanged, so no frontend change is needed. This deliberately
  reverses the original "purely additive, don't touch existing behavior"
  scope — confirmed directly with the user on 2026-08-21, since this
  endpoint feeds what real PLTP Kamojang operators see as current risk
  (dashboard risk card, prediction page's Observed Risk History chart,
  the AI1a history table).
  - **BLOCKED on deploy**: depends on
    `ai1a_direction_annotation.adjusted_risk_percentage` /
    `adjusted_is_anomaly` / `adjusted_severity`, being added by a parallel
    AI-side task (Agent 9/10, in `AI_Pertasmart_V3`). Not yet confirmed to
    exist on the VPS as of this commit. If they don't exist, the query
    fails outright (undefined column) rather than degrading gracefully —
    do not merge/deploy until the AI_Pertasmart_V3 master session confirms
    the columns are live.

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
