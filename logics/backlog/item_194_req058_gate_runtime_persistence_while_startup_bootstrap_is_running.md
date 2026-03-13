## item_194_req058_gate_runtime_persistence_while_startup_bootstrap_is_running - req058 gate runtime persistence while startup bootstrap is running
> From version: 0.9.38
> Understanding: 96%
> Confidence: 93%
> Progress: 0%
> Complexity: Medium
> Theme: Runtime / Persistence
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The runtime can currently persist state while startup bootstrap is still replaying offline ticks. That allows partially advanced in-memory state to become the durable save before startup has fully completed.

# Scope
- In:
- Add an explicit runtime-level persistence guard for startup bootstrap.
- Ensure `persist()` is skipped while startup bootstrap is active, including forced and default code paths.
- Define the exact transition point where persistence becomes allowed again after successful startup completion.
- Keep normal persistence behavior unchanged once startup bootstrap is finished.
- Out:
- No redesign of the persistence adapter contract.
- No shadow-store or double-buffer architecture in this item.

# Acceptance criteria
- Calls to `persist()` during `startupBootstrap.isRunning === true` do not write the save.
- The guard is centralized in runtime logic rather than duplicated ad hoc across callers.
- A successful startup bootstrap still writes the fully computed save once at the end.
- Post-startup ticks and existing non-startup flows persist exactly as before.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_058_make_startup_offline_catch_up_atomic_and_prevent_partial_save_persistence.md`.
- Planned delivery via `logics/tasks/task_107_execute_req058_atomic_startup_persistence_across_backlog_items_194_to_196.md`.
- Likely touch points:
  - `src/core/runtime.ts`
  - `src/core/types.ts`
  - `src/core/state.ts`
  - `tests/core/runtime.test.ts`
