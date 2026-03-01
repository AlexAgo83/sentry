## task_106_execute_req057_non_blocking_startup_loading_across_backlog_items_190_to_193 - Execute req057 non-blocking startup loading across backlog items 190 to 193
> From version: 0.9.38
> Understanding: 95%
> Confidence: 91%
> Progress: 0%
> Complexity: High
> Theme: Startup / Performance / UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_190_req057_define_startup_bootstrap_stage_and_progress_contract.md`
- `logics/backlog/item_191_req057_offload_startup_offline_catch_up_and_heavy_boot_work_off_main_thread.md`
- `logics/backlog/item_192_req057_ship_startup_progress_ui_and_non_blocking_app_shell_behavior.md`
- `logics/backlog/item_193_req057_add_startup_responsiveness_regression_coverage_and_perf_guardrails.md`

Request reference:
- `logics/request/req_057_make_startup_loading_non_blocking_with_visible_progress_and_background_processing.md`

This orchestration task delivers req057 end-to-end:
- typed startup bootstrap stages and progress contract,
- non-blocking startup runtime execution (chunked catch-up with background/worker-capable design),
- visible startup progression UI with clear readiness behavior,
- regression and performance guardrails preventing startup freeze regressions.

# Decisions (v1)
- Represent startup progress with explicit store contract (`stage`, `progressPct`, metadata).
- Startup execution must yield regularly to preserve responsiveness.
- Use worker/off-main-thread path for eligible tasks; require deterministic fallback when unavailable.
- Preserve deterministic final state parity with existing startup behavior.
- Keep startup UX transparent with stage-aware progress updates.

# Plan
- [ ] 1. Execute `item_190` (bootstrap stage/progress contract):
  - Add startup bootstrap types/state/reducer actions.
  - Define deterministic stage transitions and monotonic progress invariants.
  - Expose bootstrap state selectors/consumption points.
- [ ] 2. Execute `item_191` (non-blocking runtime startup flow):
  - Refactor startup lifecycle toward async/chunked execution.
  - Convert startup offline catch-up to budgeted slices with periodic yields.
  - Emit progress updates while preserving deterministic final state.
- [ ] 3. Execute `item_192` (startup progress UI integration):
  - Update splash UI to render stage + progress + detail.
  - Align continue/readiness behavior with bootstrap completion policy.
  - Keep accessibility semantics and focus behavior correct.
- [ ] 4. Execute `item_193` (regression + perf guardrails):
  - Add runtime parity tests for chunked startup catch-up.
  - Add startup UI progress regression tests.
  - Add responsiveness/perf assertions for long startup scenarios.
- [ ] FINAL: Update related Logics docs

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`

Recommended:
- `npm run build`
- `npm run test:e2e`

# Report
Track final delivery with:
- startup stage/progress contract details,
- runtime chunking/background execution details and fallback behavior,
- startup UI progress/readiness behavior,
- tests added/updated and startup responsiveness evidence,
- validation results and residual risks.
