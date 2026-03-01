## req_057_make_startup_loading_non_blocking_with_visible_progress_and_background_processing - Make startup loading non-blocking with visible progress and background processing
> From version: 0.9.38
> Understanding: 95%
> Confidence: 91%
> Complexity: High
> Theme: Performance / Startup UX
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Startup must stay responsive when the app shows "Preparing your save and assets...".
- Heavy bootstrap steps (especially startup offline catch-up) must not freeze the UI thread.
- Players need visible loading progress (stage + percentage) instead of a static message.
- Startup behavior must remain deterministic and safe for save integrity.

# Context
- `useGameRuntimeLifecycle` currently calls `gameRuntime.start()` synchronously at mount.
- `gameRuntime.start()` hydrates save and immediately runs `runStartupOfflineCatchUp()` before the loop starts.
- `runOfflineCatchUp()` uses a synchronous `while` loop dispatching many ticks, which can monopolize the main thread when away duration is large.
- Startup UI currently renders a modal-like splash (`StartupSplashScreen`) with static text and no progress model.
- Existing behavior can feel blocked/frozen even if eventual completion is correct.

# Goals
- Introduce a non-blocking startup pipeline with explicit bootstrap stages.
- Surface real-time, monotonic progress to users during startup.
- Keep save hydration/offline catch-up deterministic for identical input state.
- Keep startup architecture maintainable and testable (clear stage contract + typed progress state).

# Non-goals
- Full runtime migration to a dedicated simulation worker.
- Rewriting dungeon renderer or general app shell navigation.
- Changing save format or persistence policy for this request.

# Locked decisions (v1)
- Add an explicit startup bootstrap state contract exposed in store/UI:
  - stage identifier,
  - stage label,
  - `progressPct` (0..100),
  - optional detail metadata (processed ticks, processed ms, estimated remaining).
- Use a non-blocking execution model:
  - preferred: background worker for eligible pure-compute bootstrap tasks,
  - required fallback: cooperative time-slicing on main thread for state-mutating work.
- Convert startup offline catch-up into chunked execution with periodic yields so the event loop can paint/respond.
- Progress updates must be monotonic and deterministic for the same input path.
- Keep `appReady` as the final gate, but allow startup UI to show incremental phase completion.

# Scope detail (draft)
## Bootstrap pipeline
- Define startup phases (draft):
  - `loadSave`
  - `hydrateState`
  - `offlineCatchUp`
  - `assetWarmup`
  - `finalizeReady`
- Assign weighted progress shares per phase and publish updates through a typed contract.

## Runtime execution model
- Add an async startup orchestrator around current runtime start flow.
- Replace long synchronous catch-up loop execution with chunked/budgeted slices.
- Ensure chunk boundaries preserve final state parity with current deterministic behavior.

## UI/UX loading feedback
- Update startup splash to display:
  - stage-specific label,
  - numeric or bar-based progress,
  - optional detail line (example: ticks processed).
- Ensure accessibility announcements for stage changes and completion.

## Observability and guardrails
- Track startup duration and stage timings in perf state/diagnostics.
- Add regressions to prevent startup freeze regressions in future changes.

# Technical references likely impacted
- `src/app/hooks/useGameRuntimeLifecycle.ts`
- `src/core/runtime.ts`
- `src/core/runtime/offlineCatchUp.ts`
- `src/core/types.ts`
- `src/core/state.ts`
- `src/core/reducer.ts`
- `src/app/components/StartupSplashScreen.tsx`
- `src/app/AppContainer.tsx`
- `tests/core/runtime.test.ts`
- `tests/app/App.test.tsx`
- `tests/app/startupSplashScreen.test.tsx`

# Acceptance criteria
- Startup no longer performs long uninterrupted blocking work that freezes visible UI.
- Loading screen exposes progress state (stage + percentage) that visibly advances during startup.
- Large startup catch-up scenarios remain responsive and complete correctly.
- Final hydrated state remains deterministic and functionally equivalent to current behavior.
- Worker-unavailable environments still use a non-blocking fallback path.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Expected additions:
  - runtime tests for chunked startup catch-up parity,
  - progress-state monotonicity tests,
  - startup UI tests for stage/progress rendering and ready transition,
  - responsiveness regression tests for long startup paths.

# Risks / open points
- Chunk sizing too small can increase total startup duration; too large can still cause noticeable jank.
- Partial worker offload design must avoid duplicate logic between worker and fallback path.
- Progress percentage must reflect meaningful progress, not only timer-based approximation.
- Need clear policy for "Continue" behavior while non-critical bootstrap work is still in progress.

# Backlog
- `logics/backlog/item_190_req057_define_startup_bootstrap_stage_and_progress_contract.md`
- `logics/backlog/item_191_req057_offload_startup_offline_catch_up_and_heavy_boot_work_off_main_thread.md`
- `logics/backlog/item_192_req057_ship_startup_progress_ui_and_non_blocking_app_shell_behavior.md`
- `logics/backlog/item_193_req057_add_startup_responsiveness_regression_coverage_and_perf_guardrails.md`
