## item_190_req057_define_startup_bootstrap_stage_and_progress_contract - req057 define startup bootstrap stage and progress contract
> From version: 0.9.38
> Understanding: 95%
> Confidence: 91%
> Progress: 0%
> Complexity: Medium
> Theme: Architecture / Startup
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Startup currently has no typed stage/progress contract. UI can only infer readiness from a boolean (`appReady`), so users see a static loading message with poor visibility into real progress.

# Scope
- In:
- Define a typed bootstrap state model in core/store (for example: `stage`, `stageLabel`, `progressPct`, detail metadata).
- Define stage taxonomy and progression invariants (monotonic progress, bounded range, terminal-ready state).
- Add reducer/store actions for bootstrap progress updates and completion/reset.
- Ensure backward-safe defaults when bootstrap progress is absent.
- Out:
- No implementation of chunked catch-up execution in this item.
- No startup UI redesign beyond wiring to the new contract.

# Acceptance criteria
- Startup state exposes typed progress data consumable by `AppContainer` and `StartupSplashScreen`.
- Progress is monotonic and constrained to `0..100`.
- Stage transitions are deterministic and end in a consistent ready state.
- Existing startup behavior does not crash when progress data is missing/legacy.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_057_make_startup_loading_non_blocking_with_visible_progress_and_background_processing.md`.
- Implemented via `logics/tasks/task_106_execute_req057_non_blocking_startup_loading_across_backlog_items_190_to_193.md`.
- Likely touch points:
  - `src/core/types.ts`
  - `src/core/state.ts`
  - `src/core/reducer.ts`
  - `src/app/AppContainer.tsx`
