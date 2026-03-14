## task_121_execute_req070_cloud_orchestration_modularization_across_backlog_items_246_to_249 - Execute req070 cloud orchestration modularization across backlog items 246 to 249
> From version: 0.9.40
> Status: Done
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Frontend / Cloud / Maintainability / Reliability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_246_req070_define_cloud_orchestration_module_boundaries_and_public_contracts.md`
- `logics/backlog/item_247_req070_extract_auth_profile_and_warmup_flows_from_use_cloud_save.md`
- `logics/backlog/item_248_req070_extract_autosync_conflict_and_sync_watermark_orchestration.md`
- `logics/backlog/item_249_req070_add_regression_coverage_for_refactored_cloud_orchestration_seams.md`

Request reference:
- `logics/request/req_070_modularize_cloud_save_orchestration_and_reduce_frontend_regression_risk.md`

This task refactors the frontend cloud-save orchestration into clearer internal seams without changing player-facing behavior. The goal is to reduce the regression risk and maintenance cost created by the current monolithic `useCloudSave.tsx` implementation.

# Decisions (v1)
- The public `CloudSaveController` surface should remain stable where practical.
- The refactor is internal-first:
  - no new player-facing cloud features,
  - no backend protocol redesign.
- The main target seams are:
  - auth/profile lifecycle,
  - warmup/probe/retry lifecycle,
  - autosync/conflict orchestration,
  - sync watermark helpers,
  - E2E bridge attachment where useful.
- Existing integration behavior takes precedence over “clean” abstractions if a change would alter live semantics.

# Architecture summary
- `useCloudSave.tsx` should become an orchestrating composition layer rather than the sole owner of all cloud logic.
- Smaller internal modules/hooks should own distinct responsibilities with explicit inputs/outputs.
- Shared persistence helpers and state translation utilities should live outside the main hook body.
- Regression coverage should remain strong enough to protect:
  - auth,
  - warmup,
  - cloud load/overwrite,
  - autosync bootstrap,
  - conflict escalation and resolution.

# Plan
- [x] 1. Execute `item_246` (module boundaries and contracts):
  - Define the internal module seams.
  - Stabilize the intended public controller contract.
- [x] 2. Execute `item_247` (auth/profile and warmup extraction):
  - Extract auth/profile lifecycle logic.
  - Extract warmup/probe/retry behavior.
  - Preserve status transitions and offline handling.
- [x] 3. Execute `item_248` (autosync/conflict extraction):
  - Extract autosync bootstrap/push logic.
  - Extract conflict detection/resolution helpers.
  - Isolate sync watermark helpers.
- [x] 4. Execute `item_249` (regression coverage):
  - Add/update targeted tests around the new seams.
  - Keep existing compat/e2e confidence intact.
- [x] FINAL: Update related Logics docs (request/backlog/task alignment)

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`
- `npm run coverage:ci`
- `npm run test:e2e`
