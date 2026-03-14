## item_193_req057_add_startup_responsiveness_regression_coverage_and_perf_guardrails - req057 add startup responsiveness regression coverage and perf guardrails
> From version: 0.9.38
> Status: Done
> Understanding: 97%
> Confidence: 93%
> Progress: 100%
> Complexity: Medium
> Theme: Quality / Performance
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Without dedicated startup responsiveness tests and guardrails, future changes can reintroduce long blocking startup behavior and invisible loading progress regressions.

# Scope
- In:
- Add regression tests covering startup progress evolution and final readiness transition.
- Add deterministic parity tests ensuring chunked/non-blocking catch-up yields same final state as baseline logic.
- Add performance-oriented checks around startup long-task behavior and total startup path stability.
- Extend CI-relevant tests for startup loading UX (stage text/progress updates).
- Out:
- No unrelated rendering or cloud-sync benchmark suite expansion.
- No external APM integration in this item.

# Acceptance criteria
- Tests fail if startup progress stops updating or regresses backward.
- Tests fail if chunked startup path diverges from deterministic expected state.
- Startup-related test coverage includes both runtime and UI behavior.
- Validation gates (`lint`, `typecheck`, `test:ci`) remain green with new coverage.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_057_make_startup_loading_non_blocking_with_visible_progress_and_background_processing.md`.
- Implemented via `logics/tasks/task_106_execute_req057_non_blocking_startup_loading_across_backlog_items_190_to_193.md`.
- Depends on:
  - `logics/backlog/item_191_req057_offload_startup_offline_catch_up_and_heavy_boot_work_off_main_thread.md`
  - `logics/backlog/item_192_req057_ship_startup_progress_ui_and_non_blocking_app_shell_behavior.md`
- Likely touch points:
  - `tests/core/runtime.test.ts`
  - `tests/app/startupSplashScreen.test.tsx`
  - `tests/app/App.test.tsx`
  - `tests/app/offlineRecapModal.test.tsx`
- Delivered:
  - Added runtime regression ensuring non-blocking startup bootstrap progresses and finishes in `ready` state.
  - Added startup splash regression asserting progress/stage/detail rendering.
  - Full validation battery passed (`lint`, `typecheck`, `typecheck:tests`, `test:ci`, `build`).
