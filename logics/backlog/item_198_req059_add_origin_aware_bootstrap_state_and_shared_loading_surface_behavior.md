## item_198_req059_add_origin_aware_bootstrap_state_and_shared_loading_surface_behavior - req059 add origin-aware bootstrap state and shared loading surface behavior
> From version: 0.9.38
> Understanding: 95%
> Confidence: 91%
> Progress: 100%
> Complexity: Medium
> Theme: UI / State
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The loading surface is currently treated as a startup-only overlay. If bootstrap becomes reusable for local/cloud save application, UI state must distinguish bootstrap origin and render the same loading surface coherently outside initial mount.

# Scope
- In:
- Extend bootstrap state to carry origin/context metadata (for example: `startup`, `localImport`, `cloudLoad`).
- Reuse or generalize the current startup loading surface so it can render for any bootstrap origin.
- Define overlay behavior when bootstrap is triggered while the app is already open:
  - visibility,
  - blocking semantics,
  - interaction with existing modals.
- Allow origin-aware copy/details when helpful, without changing core stage semantics.
- Out:
- No rewiring of local/cloud import actions themselves in this item.
- No broader modal architecture redesign.

# Acceptance criteria
- Bootstrap state can distinguish startup, local import, and cloud load.
- The shared loading surface can render correctly for any bootstrap origin.
- Overlay/modal behavior remains predictable when bootstrap is triggered after the app is already interactive.
- Existing startup loading behavior does not regress.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_059_unify_startup_local_import_and_cloud_load_bootstrap_with_shared_loading_flow.md`.
- Planned delivery via `logics/tasks/task_108_execute_req059_shared_bootstrap_across_backlog_items_197_to_200.md`.
- Depends on:
  - `logics/backlog/item_197_req059_extract_shared_runtime_bootstrap_pipeline_for_save_application.md`
- Likely touch points:
  - `src/core/types.ts`
  - `src/core/state.ts`
  - `src/core/reducer.ts`
  - `src/app/AppContainer.tsx`
  - `src/app/components/StartupSplashScreen.tsx`
  - `src/app/styles/startup.css`
  - `tests/app/startupSplashScreen.test.tsx`
  - `tests/app/App.test.tsx`
