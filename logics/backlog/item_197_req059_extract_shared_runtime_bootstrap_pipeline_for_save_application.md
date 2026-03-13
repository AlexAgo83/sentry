## item_197_req059_extract_shared_runtime_bootstrap_pipeline_for_save_application - req059 extract a shared runtime bootstrap pipeline for save application
> From version: 0.9.38
> Understanding: 97%
> Confidence: 94%
> Progress: 0%
> Complexity: High
> Theme: Architecture / Runtime
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The runtime bootstrap logic is currently startup-centric. Local import and cloud load bypass it by directly applying `gameRuntime.importSave(...)`, which duplicates behavior and prevents reuse of the non-blocking bootstrap pipeline.

# Scope
- In:
- Extract/generalize the startup bootstrap orchestration into a reusable runtime entry point for applying a save.
- Ensure the shared pipeline owns:
  - hydration,
  - chunked offline catch-up,
  - progress updates,
  - recap generation,
  - final durable save.
- Keep startup `start()` built on top of that shared bootstrap path rather than maintaining divergent orchestration.
- Preserve deterministic output parity for identical input save + timestamps.
- Out:
- No UI copy or modal choreography changes in this item.
- No direct local/cloud flow rewiring in this item.

# Acceptance criteria
- Runtime exposes a shared bootstrap/apply-save path reusable beyond startup.
- Startup uses that shared path internally instead of a separate startup-only orchestration branch.
- Shared bootstrap preserves req057 responsiveness behavior and req058 atomic persistence guarantees.
- Deterministic final state remains equivalent to current startup semantics.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_059_unify_startup_local_import_and_cloud_load_bootstrap_with_shared_loading_flow.md`.
- Planned delivery via `logics/tasks/task_108_execute_req059_shared_bootstrap_across_backlog_items_197_to_200.md`.
- Depends on prior startup work from:
  - `logics/request/req_057_make_startup_loading_non_blocking_with_visible_progress_and_background_processing.md`
  - `logics/request/req_058_make_startup_offline_catch_up_atomic_and_prevent_partial_save_persistence.md`
- Likely touch points:
  - `src/core/runtime.ts`
  - `src/core/runtime/offlineCatchUp.ts`
  - `src/core/types.ts`
  - `src/core/state.ts`
  - `src/core/reducer.ts`
  - `tests/core/runtime.test.ts`
