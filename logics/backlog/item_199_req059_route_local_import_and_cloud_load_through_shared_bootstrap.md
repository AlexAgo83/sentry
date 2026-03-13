## item_199_req059_route_local_import_and_cloud_load_through_shared_bootstrap - req059 route local import and cloud load through the shared bootstrap pipeline
> From version: 0.9.38
> Understanding: 96%
> Confidence: 92%
> Progress: 0%
> Complexity: Medium
> Theme: Integration / Save Flows
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even with a shared runtime bootstrap available, local import and cloud load will keep bypassing it until their integration paths are explicitly rewired away from direct `gameRuntime.importSave(...)`.

# Scope
- In:
- Update local save import flow to use the shared bootstrap/apply-save path.
- Update cloud save load flow to use the shared bootstrap/apply-save path.
- Ensure those flows reuse shared progress/recap semantics and inherit atomic persistence guarantees.
- Preserve existing validation/parsing/auth/conflict behavior around those flows; only the actual save-application step changes.
- Out:
- No redesign of import prompts or cloud conflict UI.
- No changes to reset/new-game unless required by integration fallout.

# Acceptance criteria
- Local import no longer applies saves via the old direct import path.
- Cloud load no longer applies saves via the old direct import path.
- Both flows can trigger the shared loading surface when meaningful catch-up is required.
- Both flows remain safe under req058 persistence rules.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_059_unify_startup_local_import_and_cloud_load_bootstrap_with_shared_loading_flow.md`.
- Planned delivery via `logics/tasks/task_108_execute_req059_shared_bootstrap_across_backlog_items_197_to_200.md`.
- Depends on:
  - `logics/backlog/item_197_req059_extract_shared_runtime_bootstrap_pipeline_for_save_application.md`
  - `logics/backlog/item_198_req059_add_origin_aware_bootstrap_state_and_shared_loading_surface_behavior.md`
- Likely touch points:
  - `src/app/hooks/useSaveManagement.ts`
  - `src/app/hooks/useCloudSave.tsx`
  - `src/core/runtime.ts`
  - `tests/app/cloudSavePanel.test.tsx`
  - `tests/app/localSaveModal.test.tsx`
  - `tests/app/App.test.tsx`
