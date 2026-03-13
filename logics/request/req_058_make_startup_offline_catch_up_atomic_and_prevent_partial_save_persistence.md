## req_058_make_startup_offline_catch_up_atomic_and_prevent_partial_save_persistence - Make startup offline catch-up atomic and prevent partial save persistence
> From version: 0.9.38
> Understanding: 95%
> Confidence: 93%
> Complexity: Medium
> Theme: Reliability / Persistence
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Startup offline catch-up must not partially overwrite the persisted save while replaying missed ticks.
- Closing the tab/window during startup catch-up must leave the last persisted save intact.
- Save integrity must be prioritized over saving partial startup progress.

# Context
- Startup now uses a non-blocking bootstrap with visible progress and chunked offline catch-up.
- During startup, the runtime hydrates the save into memory, runs chunked offline catch-up, then persists when the bootstrap completes.
- The runtime also binds `beforeunload` and visibility handlers early, and those handlers can force `persist()` while bootstrap work is still in progress.
- This creates a reliability risk: if the user closes the app mid-bootstrap, a partially advanced in-memory state may be written and become the new persisted save.
- The preferred behavior for this flow is transactional:
  - either the full startup catch-up completes and is saved once,
  - or nothing from that startup catch-up is persisted.

# Goals
- Make startup offline catch-up persistence atomic from the user’s point of view.
- Ensure partial bootstrap progress never becomes the durable save.
- Preserve deterministic startup results for the same input save and elapsed time.
- Keep the implementation understandable and testable.

# Non-goals
- Reworking the full save format or persistence adapter contract.
- Implementing a full database-style transaction layer across the entire runtime.
- Changing the regular runtime persistence policy after startup has completed.
- Solving every possible browser crash mode beyond what web lifecycle APIs can reasonably guarantee.

# Locked decisions (v1)
## Persistence policy during startup bootstrap
- While `startupBootstrap.isRunning === true`, the app must not persist the evolving startup catch-up state.
- Any persistence trigger that fires during startup bootstrap must be ignored or deferred.
- The first persisted write for startup catch-up must happen only after the bootstrap finishes successfully.

## Lifecycle behavior during interruption
- If the tab/window is closed, refreshed, backgrounded, or otherwise interrupted before bootstrap completion, the persisted save must remain the pre-bootstrap save.
- On next launch, startup catch-up simply restarts from the last durable save and recomputes the missing ticks.

## Scope boundary for v1 implementation
- V1 may gate/skip persistence while bootstrap is running rather than introducing a separate shadow store.
- A shadow-store or full staged-commit architecture can be considered later if needed, but is not required for this request.

# Scope detail (draft)
## Runtime persistence gating
- Add a runtime-level guard so `persist()` becomes a no-op while startup bootstrap is active.
- Ensure `beforeunload` forced persistence does not bypass this guard during bootstrap.
- Ensure visibility-hide persistence does not bypass this guard during bootstrap.

## Successful completion behavior
- When startup catch-up completes successfully:
  - finalize recap/perf state,
  - write the resulting save once,
  - then resume normal runtime persistence behavior.

## Failure/abort behavior
- If startup bootstrap errors or is aborted:
  - do not persist the partially progressed state,
  - keep the durable save unchanged,
  - surface an error or allow retry behavior without mutating persistence.

## UX / messaging
- If helpful, startup UI may include a short hint that closing early will restart the calculation next time rather than save partial progress.
- This hint is optional for v1; atomic persistence is the primary requirement.

# Technical references likely impacted
- `src/core/runtime.ts`
- `src/core/runtime/offlineCatchUp.ts`
- `src/core/types.ts`
- `src/core/state.ts`
- `src/core/reducer.ts`
- `src/app/AppContainer.tsx`
- `src/app/components/StartupSplashScreen.tsx`
- `tests/core/runtime.test.ts`
- `tests/app/startupSplashScreen.test.tsx`
- `logics/request/req_057_make_startup_loading_non_blocking_with_visible_progress_and_background_processing.md`

# Acceptance criteria
- No save write occurs while startup bootstrap/offline catch-up is still running.
- Closing or refreshing the page during startup catch-up does not overwrite the last durable save with partial progress.
- After a successful startup bootstrap, the fully computed state is persisted once and normal runtime behavior resumes.
- Relaunch after an interrupted bootstrap recomputes from the last durable save and completes correctly.
- Existing non-startup persistence behavior remains unchanged.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Expected additions:
  - runtime test: no persistence during in-progress startup bootstrap,
  - runtime test: `beforeunload` during startup does not persist partial state,
  - runtime test: visibility hide during startup does not persist partial state,
  - runtime test: successful bootstrap persists exactly once at the end,
  - regression test: next launch after interrupted bootstrap recomputes correctly.

# Risks / open points
- If bootstrap interruption is frequent, users may repeatedly recompute the same long catch-up window; this is acceptable for v1 because integrity is the higher priority.
- The guard must not accidentally suppress required persistence after startup completes.
- If future startup phases mutate state outside offline catch-up, the same atomicity policy must apply consistently.

# Backlog
- Backlog items should be generated next:
  - `logics/backlog/item_194_req058_gate_runtime_persistence_while_startup_bootstrap_is_running.md`
  - `logics/backlog/item_195_req058_block_startup_interrupt_persistence_and_finalize_single_commit_write.md`
  - `logics/backlog/item_196_req058_add_atomic_startup_persistence_regression_coverage.md`
