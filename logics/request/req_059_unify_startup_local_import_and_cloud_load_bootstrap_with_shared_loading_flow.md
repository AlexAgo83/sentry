## req_059_unify_startup_local_import_and_cloud_load_bootstrap_with_shared_loading_flow - Unify startup, local import, and cloud load bootstrap with a shared loading flow
> From version: 0.9.38
> Understanding: 96%
> Confidence: 93%
> Complexity: High
> Theme: Architecture / UX / Reliability
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.
> Status: Done

# Needs
- Loading a save from local import or cloud load should be able to show the same loading/bootstrap UI as app startup when offline catch-up is required.
- Startup, local import, and cloud load should use the same deterministic bootstrap semantics instead of separate ad hoc flows.
- Save application during import/load must remain safe and atomic, without partial persistence if the bootstrap is interrupted.

# Context
- The app startup path already has a non-blocking bootstrap flow with visible progress and startup stages.
- Local import currently parses the payload and directly calls `gameRuntime.importSave(...)`, which persists and hydrates immediately without passing through the startup loading flow.
- Cloud load currently does the same: it directly calls `gameRuntime.importSave(...)` after fetching cloud payload.
- As a result:
  - startup can show loading progress and offline recap,
  - local/cloud load cannot reuse that same UX,
  - bootstrap behavior is split across multiple entry points,
  - atomic persistence guarantees introduced for startup are not automatically shared by import flows.

# Goals
- Create one reusable bootstrap pipeline for:
  - app startup,
  - local save import,
  - cloud save load.
- Reuse the same loading modal/splash, progress stages, and recap behavior across those entry points when catch-up is needed.
- Preserve deterministic results regardless of how the save entered the runtime.
- Align save integrity guarantees across startup/import/cloud load.

# Non-goals
- Rewriting all save management UX.
- Converting every state reset/import path into a full page reload.
- Implementing a general-purpose transactional store layer for every runtime mutation.
- Changing cloud sync conflict-resolution semantics beyond the load path itself.

# Locked decisions (v1)
## Shared bootstrap entry point
- The runtime must expose a reusable bootstrap/apply-save flow rather than only a startup-only path.
- Startup, local import, and cloud load must all route through that shared bootstrap orchestration when applying a save that may require catch-up.

## Shared loading UI
- The existing startup loading surface should be reused or generalized rather than creating a second, separate loading modal just for import/cloud flows.
- Stage/progress semantics should remain consistent across all bootstrap origins.

## Atomicity and persistence
- Shared bootstrap for import/load must follow the same atomic persistence rule as startup:
  - no durable partial write while bootstrap is in progress,
  - one final durable write only after successful completion.

## UX behavior
- If no meaningful catch-up/bootstrap work is required, the flow may complete quickly without a prolonged loading surface.
- If catch-up is significant, the loading UI should be shown and progress should be visible.

# Scope detail (draft)
## Runtime architecture
- Extract or generalize the current startup bootstrap orchestration into a reusable runtime API.
- Candidate shape (illustrative only):
  - `start()` uses shared bootstrap internally,
  - `applyImportedSave(...)` or `bootstrapSave(...)` for local/cloud paths.
- Ensure one code path owns:
  - hydration,
  - chunked offline catch-up,
  - progress updates,
  - recap generation,
  - final durable save.

## Origin-aware bootstrap state
- Track bootstrap origin/context so UI and logs can distinguish:
  - startup,
  - local import,
  - cloud load.
- Origin metadata may influence labels/copy, but should not fork core semantics.

## UI integration
- Make the loading surface render for shared bootstrap work regardless of origin.
- Ensure local import and cloud load can trigger that UI without full page reload.
- Keep close/interrupt behavior aligned with atomic persistence policy.

## Save management integration
- Update local import flow to route through shared bootstrap instead of direct `importSave`.
- Update cloud load flow to route through shared bootstrap instead of direct `importSave`.
- Keep reset/new-game flows out of scope unless they explicitly need the same bootstrap semantics.

## Reliability and regressions
- Ensure startup-specific guarantees from req057/req058 remain valid after generalization.
- Add regression coverage for local/cloud load paths using the shared bootstrap.

# Technical references likely impacted
- `src/core/runtime.ts`
- `src/core/runtime/offlineCatchUp.ts`
- `src/core/types.ts`
- `src/core/state.ts`
- `src/core/reducer.ts`
- `src/app/AppContainer.tsx`
- `src/app/components/StartupSplashScreen.tsx`
- `src/app/hooks/useGameRuntimeLifecycle.ts`
- `src/app/hooks/useSaveManagement.ts`
- `src/app/hooks/useCloudSave.tsx`
- `tests/core/runtime.test.ts`
- `tests/app/App.test.tsx`
- `tests/app/startupSplashScreen.test.tsx`
- `tests/app/cloudSavePanel.test.tsx`
- `tests/app/localSaveModal.test.tsx`
- `logics/request/req_057_make_startup_loading_non_blocking_with_visible_progress_and_background_processing.md`
- `logics/request/req_058_make_startup_offline_catch_up_atomic_and_prevent_partial_save_persistence.md`

# Acceptance criteria
- Local save import can trigger the shared loading/bootstrap UI when catch-up work is needed.
- Cloud save load can trigger the shared loading/bootstrap UI when catch-up work is needed.
- Startup, local import, and cloud load use the same core bootstrap pipeline and progress model.
- Shared bootstrap remains deterministic and preserves atomic persistence guarantees.
- Existing fast paths still complete without unnecessary UI delay when no catch-up is required.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Expected additions:
  - runtime tests for origin-agnostic/shared bootstrap behavior,
  - app tests for local import triggering the loading flow,
  - app tests for cloud load triggering the loading flow,
  - regressions ensuring recap/progress behavior remains consistent across origins.

# Risks / open points
- Generalizing startup bootstrap may expose assumptions that currently only hold during initial mount.
- UI state coordination must avoid colliding with other modals during import/cloud-triggered bootstrap.
- Shared bootstrap labels may need light origin-aware copy to avoid confusing users when loading from cloud/local.
- If import/load is initiated while gameplay UI is already active, overlay stacking and interruption handling must stay predictable.

# Backlog
- `logics/backlog/item_197_req059_extract_shared_runtime_bootstrap_pipeline_for_save_application.md`
- `logics/backlog/item_198_req059_add_origin_aware_bootstrap_state_and_shared_loading_surface_behavior.md`
- `logics/backlog/item_199_req059_route_local_import_and_cloud_load_through_shared_bootstrap.md`
- `logics/backlog/item_200_req059_add_regression_coverage_for_shared_bootstrap_origins.md`
