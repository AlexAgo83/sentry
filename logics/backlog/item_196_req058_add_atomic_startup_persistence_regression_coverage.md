## item_196_req058_add_atomic_startup_persistence_regression_coverage - req058 add atomic startup persistence regression coverage
> From version: 0.9.38
> Understanding: 97%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium
> Theme: Quality / Reliability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Without targeted regression coverage, future runtime or lifecycle changes can reintroduce partial startup persistence and silently weaken save integrity guarantees.

# Scope
- In:
- Add runtime tests that prove no save writes happen during active startup bootstrap.
- Add interrupt-path tests for `beforeunload`, visibility change, and bootstrap abort/stop semantics.
- Add completion-path tests proving the final save is written once after successful startup completion.
- Add restart/regression coverage demonstrating that an interrupted startup recomputes from the last durable save on next launch.
- Out:
- No unrelated persistence benchmark suite.
- No end-to-end browser crash simulation beyond deterministic runtime/lifecycle cases.

# Acceptance criteria
- Tests fail if startup writes durable state before bootstrap completion.
- Tests fail if lifecycle interrupts during bootstrap trigger a durable save.
- Tests fail if successful startup does not produce a final durable save.
- Validation gates remain green with the new regression coverage.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_058_make_startup_offline_catch_up_atomic_and_prevent_partial_save_persistence.md`.
- Planned delivery via `logics/tasks/task_107_execute_req058_atomic_startup_persistence_across_backlog_items_194_to_196.md`.
- Depends on:
  - `logics/backlog/item_194_req058_gate_runtime_persistence_while_startup_bootstrap_is_running.md`
  - `logics/backlog/item_195_req058_block_startup_interrupt_persistence_and_finalize_single_commit_write.md`
- Likely touch points:
  - `tests/core/runtime.test.ts`
  - `tests/app/startupSplashScreen.test.tsx`
  - `tests/app/App.test.tsx`
