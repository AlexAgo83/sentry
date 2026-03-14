## item_195_req058_block_startup_interrupt_persistence_and_finalize_single_commit_write - req058 block startup interrupt persistence and finalize a single durable write on success
> From version: 0.9.38
> Status: Done
> Understanding: 95%
> Confidence: 91%
> Progress: 100%
> Complexity: Medium
> Theme: Lifecycle / Reliability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even with a generic persistence guard, startup interruption paths (`beforeunload`, visibility changes, abort/stop paths) must be made explicitly consistent so they never force a partial startup save and still allow one final durable write after successful completion.

# Scope
- In:
- Audit and adjust startup lifecycle handlers that can trigger persistence during bootstrap:
  - `beforeunload`
  - visibility-hide / resume handling
  - startup abort/stop path
- Ensure interruption during bootstrap leaves the persisted save untouched.
- Ensure successful startup completion performs exactly one durable save of the final computed state.
- Preserve restart semantics: next launch recomputes from the previous durable save when startup was interrupted.
- Out:
- No general browser lifecycle rearchitecture outside startup semantics.
- No UI redesign beyond optional copy updates if needed.

# Acceptance criteria
- Closing or refreshing during startup bootstrap does not persist partial progress.
- Backgrounding or visibility loss during startup bootstrap does not persist partial progress.
- Aborting/stopping startup bootstrap does not persist partial progress.
- Successful startup completion persists once, after catch-up and finalization are complete.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_058_make_startup_offline_catch_up_atomic_and_prevent_partial_save_persistence.md`.
- Planned delivery via `logics/tasks/task_107_execute_req058_atomic_startup_persistence_across_backlog_items_194_to_196.md`.
- Depends on:
  - `logics/backlog/item_194_req058_gate_runtime_persistence_while_startup_bootstrap_is_running.md`
- Likely touch points:
  - `src/core/runtime.ts`
  - `src/app/hooks/useGameRuntimeLifecycle.ts`
  - `src/app/AppContainer.tsx`
  - `src/app/components/StartupSplashScreen.tsx`
  - `tests/core/runtime.test.ts`
