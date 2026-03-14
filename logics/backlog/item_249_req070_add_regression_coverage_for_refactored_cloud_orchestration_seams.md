## item_249_req070_add_regression_coverage_for_refactored_cloud_orchestration_seams - req070 add regression coverage for refactored cloud orchestration seams
> From version: 0.9.40
> Status: Ready
> Understanding: 96%
> Confidence: 93%
> Progress: 0%
> Complexity: Medium
> Theme: Testing / Frontend / Cloud / Reliability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
A structural refactor of cloud orchestration is risky unless the behavior around auth, warmup, autosync, and conflict handling is locked down by regression coverage that matches the new seams.

# Scope
- In:
- Add or update targeted tests around the refactored modules/seams.
- Preserve integration-style confidence for:
  - login/register/refresh,
  - warmup retry and offline behavior,
  - profile fetch/update,
  - autosync bootstrap,
  - autosync conflict detection and resolution.
- Keep existing compat and smoke coverage green after the refactor.
- Out:
- No full rewrite of all cloud tests.
- No new player-facing cloud features.

# Acceptance criteria
- The refactor lands with regression coverage strong enough to detect behavior drift across the main cloud/save flows.
- Test coverage aligns with the new module seams without replacing the higher-level integration signals already in the repo.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_070_modularize_cloud_save_orchestration_and_reduce_frontend_regression_risk.md`.
- Likely touch points:
  - `tests/app/*cloud*`
  - `tests/compat/saveBootstrapCompatibility.test.ts`
  - `tests/e2e/smoke.spec.ts`
  - `src/app/hooks/useCloudSave.tsx`
