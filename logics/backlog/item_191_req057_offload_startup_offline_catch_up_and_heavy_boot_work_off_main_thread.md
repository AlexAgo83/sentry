## item_191_req057_offload_startup_offline_catch_up_and_heavy_boot_work_off_main_thread - req057 offload startup offline catch-up and heavy boot work off main thread
> From version: 0.9.38
> Understanding: 98%
> Confidence: 94%
> Progress: 100%
> Complexity: High
> Theme: Runtime / Performance
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Startup offline catch-up currently runs synchronously and can block the main thread for noticeable periods, making the app appear frozen during "Preparing your save and assets...".

# Scope
- In:
- Introduce async startup orchestration in runtime lifecycle (`start` path) so heavy work yields between chunks.
- Replace long uninterrupted offline catch-up execution with chunked processing under a time/tick budget per slice.
- Emit stage progress updates during chunk processing.
- Add optional worker-backed path for eligible pure-compute startup tasks, with deterministic fallback to cooperative main-thread slicing.
- Preserve deterministic final game state parity versus current startup logic.
- Out:
- No full simulation migration to worker-first architecture.
- No gameplay/system modal behavior changes beyond startup execution flow.

# Acceptance criteria
- Startup heavy paths no longer block the event loop for long uninterrupted spans.
- Offline catch-up progresses incrementally with visible state updates.
- Final startup state remains deterministic and equivalent for identical input save/timestamps.
- Worker-unavailable/test environments still pass using non-blocking fallback mode.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_057_make_startup_loading_non_blocking_with_visible_progress_and_background_processing.md`.
- Implemented via `logics/tasks/task_106_execute_req057_non_blocking_startup_loading_across_backlog_items_190_to_193.md`.
- Depends on `logics/backlog/item_190_req057_define_startup_bootstrap_stage_and_progress_contract.md`.
- Likely touch points:
  - `src/core/runtime.ts`
  - `src/core/runtime/offlineCatchUp.ts`
  - `src/app/hooks/useGameRuntimeLifecycle.ts`
  - `tests/core/runtime.test.ts`
- Delivered:
  - Added startup non-blocking mode via `gameRuntime.start({ nonBlockingStartup: true })`.
  - Implemented chunked startup offline catch-up loop with yielding to the main thread (`setTimeout(0)`), bounded by chunk budget and max ticks per chunk.
  - Preserved deterministic tick stepping and recap semantics while publishing incremental startup progress.
  - Added regression coverage for non-blocking bootstrap completion in `tests/core/runtime.test.ts`.
