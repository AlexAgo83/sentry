## task_108_execute_req059_shared_bootstrap_across_backlog_items_197_to_200 - Execute req059 shared bootstrap across backlog items 197 to 200
> From version: 0.9.38
> Understanding: 96%
> Confidence: 93%
> Progress: 0%
> Complexity: High
> Theme: Architecture / UX / Reliability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_197_req059_extract_shared_runtime_bootstrap_pipeline_for_save_application.md`
- `logics/backlog/item_198_req059_add_origin_aware_bootstrap_state_and_shared_loading_surface_behavior.md`
- `logics/backlog/item_199_req059_route_local_import_and_cloud_load_through_shared_bootstrap.md`
- `logics/backlog/item_200_req059_add_regression_coverage_for_shared_bootstrap_origins.md`

Request reference:
- `logics/request/req_059_unify_startup_local_import_and_cloud_load_bootstrap_with_shared_loading_flow.md`

This task unifies save application around one reusable bootstrap pipeline so startup, local import, and cloud load share the same loading surface, catch-up semantics, recap behavior, and atomic persistence guarantees.

# Decisions (v1)
- `GameRuntime` owns the shared bootstrap orchestration; UI only observes bootstrap state and triggers the correct entry point.
- Startup remains one origin of that pipeline, not a special-case orchestration branch.
- Local import and cloud load must stop using direct `importSave(...)` as their main apply path.
- Shared bootstrap must remain compatible with req057 non-blocking progress and req058 atomic persistence rules.

# Architecture summary
- The core extraction is runtime-first:
  - create one bootstrap/apply-save pipeline,
  - let startup/import/cloud call it with different origins.
- Bootstrap state should become origin-aware so the loading surface can be reused without inventing a second parallel modal system.
- Flow integration belongs at the save-application boundary:
  - parsing/auth/conflict decisions stay where they are,
  - actual save application moves to the shared bootstrap entry point.
- Regression coverage must exercise all origins because this is a cross-cutting refactor, not a startup-only change.

# Plan
- [ ] 1. Execute `item_197` (shared runtime bootstrap extraction):
  - Generalize startup bootstrap into a reusable runtime save-application pipeline.
  - Keep deterministic catch-up, recap, and final commit semantics centralized there.
- [ ] 2. Execute `item_198` (origin-aware state + shared loading surface):
  - Extend bootstrap state with origin metadata.
  - Reuse/generalize the loading surface and define overlay behavior for non-startup origins.
- [ ] 3. Execute `item_199` (local/cloud integration):
  - Rewire local import to the shared bootstrap entry point.
  - Rewire cloud load to the shared bootstrap entry point.
  - Preserve existing parsing/auth/conflict behavior around those integrations.
- [ ] 4. Execute `item_200` (regression + validation):
  - Add runtime and app-level regressions for startup/local/cloud shared bootstrap behavior.
  - Validate recap/progress/atomic persistence consistency across origins.
  - Run validation suite and fix failures.
- [ ] FINAL: Update related Logics docs (request/backlog/task alignment)

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`
