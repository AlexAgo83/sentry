## item_210_req062_add_save_and_bootstrap_compatibility_regression_suite - req062 add a save and bootstrap compatibility regression suite
> From version: 0.9.38
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Reliability / Runtime
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Persistence, import, cloud load, and startup bootstrap are now among the most critical correctness seams in `Sentry`, but their regression coverage is still distributed across general tests rather than expressed as one explicit compatibility layer with stable invariants.

# Scope
- In:
- Introduce a dedicated compatibility-style regression layer or naming convention for save/bootstrap-sensitive tests.
- Cover invariants around:
  - serialization/rehydration round-trips,
  - startup bootstrap determinism,
  - local import application semantics,
  - cloud load application semantics,
  - partial-persistence safety and interruption-sensitive behavior where applicable.
- Prefer direct runtime/store seams and deterministic fixtures over browser-only assertions.
- Keep the suite narrow and high-signal, focused on product-critical invariants rather than duplicating all existing UI tests.
- Out:
- No full refactor of unrelated UI modal tests in this item.
- No new user-facing UX changes in this item.

# Acceptance criteria
- `Sentry` has an explicit compatibility regression surface for save/bootstrap flows.
- The suite protects core persistence and bootstrap invariants with deterministic tests.
- Import and cloud load semantics are covered at the runtime/application boundary, not only via UI smoke tests.
- The suite is structured so it can be run independently as part of a dedicated lane.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_062_strengthen_sentry_test_governance_with_explicit_lanes_timeout_policy_and_save_flow_compatibility.md`.
- Planned delivery via `logics/tasks/task_111_execute_req062_test_governance_and_save_flow_compatibility_across_backlog_items_208_to_211.md`.
- Depends on save/bootstrap architecture from:
  - `logics/request/req_057_make_startup_loading_non_blocking_with_visible_progress_and_background_processing.md`
  - `logics/request/req_058_make_startup_offline_catch_up_atomic_and_prevent_partial_save_persistence.md`
  - `logics/request/req_059_unify_startup_local_import_and_cloud_load_bootstrap_with_shared_loading_flow.md`
- Likely touch points:
  - `tests/core/runtime.test.ts`
  - `tests/offlinePersistence.test.ts`
  - `tests/offlineLoop.test.ts`
  - `tests/app/localSaveModal.test.tsx`
  - `tests/app/cloudSavePanel.test.tsx`
  - `tests/app/startupSplashScreen.test.tsx`
  - `src/core/runtime.ts`
  - `src/core/serialization.ts`
  - `src/app/hooks/useSaveManagement.ts`
  - `src/app/hooks/useCloudSave.tsx`
