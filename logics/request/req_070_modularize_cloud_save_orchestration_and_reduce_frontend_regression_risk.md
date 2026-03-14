## req_070_modularize_cloud_save_orchestration_and_reduce_frontend_regression_risk - Modularize cloud save orchestration and reduce frontend regression risk
> From version: 0.9.40
> Status: Ready
> Understanding: 96%
> Confidence: 93%
> Complexity: Medium
> Theme: Frontend / Cloud / Maintainability / Reliability
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- The current cloud-save frontend orchestration is functionally rich but concentrated in one large hook, making future changes riskier than they need to be.
- `src/app/hooks/useCloudSave.tsx` currently combines authentication, backend warmup, online/offline handling, sync watermark state, conflict resolution, profile updates, and E2E wiring in one place.
- This creates a hotspot where unrelated changes can easily regress cloud login, cloud load, autosync, or conflict handling.
- The project needs a clearer internal structure before more cloud/save features or reliability work accumulate on top of the current shape.

# Context
- The project already has strong cloud/save coverage and several recent improvements:
  - shared bootstrap flow,
  - atomic startup persistence,
  - cloud warmup handling,
  - test governance and compatibility coverage.
- Residual security hardening is already tracked separately in:
  - `logics/request/req_052_post_global_review_security_and_cloud_reliability_hardening.md`
- This request is intentionally different:
  - it focuses on maintainability and frontend orchestration boundaries,
  - not on auth security protocol or backend policy changes.
- Current audit observations:
  - `src/app/hooks/useCloudSave.tsx` is over 1000 lines,
  - it contains several independent responsibilities with separate state machines,
  - the code remains workable today, but it is the clearest frontend regression hotspot for future cloud/save work.

# Goals
- Reduce the blast radius of cloud/save changes by splitting responsibilities into smaller, well-named units.
- Make cloud orchestration easier to reason about, test, and extend.
- Keep current player-facing behavior unchanged while improving internal structure.
- Clarify boundaries between:
  - authentication/profile lifecycle,
  - backend warmup and availability probing,
  - cloud save sync/conflict orchestration,
  - test/E2E bridge helpers.

# Non-goals
- Rewriting the cloud system from scratch.
- Changing backend APIs or cloud payload formats.
- Shipping new player-facing cloud features as part of this refactor.
- Replacing existing integration coverage with purely unit-level abstractions.

# Scope detail (draft)
## A. Responsibility split
- Extract smaller internal modules/hooks/services from `useCloudSave.tsx`.
- Target boundaries should likely include:
  - auth/profile session handling,
  - warmup/probe/retry lifecycle,
  - autosync and conflict management,
  - sync watermark persistence helpers,
  - optional E2E-only bridge attachment.

## B. State contract cleanup
- Keep the public `CloudSaveController` surface stable where practical.
- Reduce implicit coupling between unrelated state updates.
- Make transitions clearer for statuses such as:
  - `idle`,
  - `authenticating`,
  - `warming`,
  - `ready`,
  - `offline`,
  - autosync `conflict`.

## C. Testability improvements
- Make smaller orchestration pieces independently testable where that adds value.
- Preserve or improve current integration-style coverage for:
  - login/register/refresh,
  - cloud load and overwrite,
  - autosync conflict escalation,
  - warmup retry behavior,
  - profile updates.

## D. Regression-resistant wiring
- Keep the provider/hook entry surface stable for the app.
- Avoid moving complexity from one giant hook into one giant helper file.
- Prefer explicit module seams over hidden utility sprawl.

# Product/architecture constraints
- Player-facing behavior should remain unchanged unless a bug fix is explicitly needed.
- Existing E2E and compat tests must continue to reflect the true cloud flow.
- The refactor should stay incremental:
  - introduce seams first,
  - then move logic,
  - then tighten tests.
- The resulting architecture should still be easy to debug locally without chasing logic across too many files.

# Technical references likely impacted
- `src/app/hooks/useCloudSave.tsx`
- `src/app/api/cloudClient.ts`
- `src/app/containers/*`
- `src/app/components/*cloud*`
- `tests/app/*cloud*`
- `tests/compat/saveBootstrapCompatibility.test.ts`
- `tests/e2e/smoke.spec.ts`

# Acceptance criteria
- `useCloudSave.tsx` no longer owns all major cloud responsibilities directly in one monolithic body.
- Auth/profile, warmup, and sync/conflict logic have clearer internal seams.
- The public cloud-save behavior remains stable from a player perspective.
- Existing cloud/save tests still pass, and targeted regression coverage is added where the new seams justify it.
- Future cloud/save work can be implemented against smaller modules without reopening the entire orchestration file.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Recommended:
  - `npm run coverage:ci`
  - `npm run test:e2e`
  - `npm run ci:local`

# Risks / open points
- A refactor without enough integration validation could silently break warmup or autosync semantics.
- Over-splitting could make the cloud flow harder to trace during debugging.
- Preserving behavior while moving logic will require careful tests around status transitions and side effects.

# Follow-up candidates
- Stronger typed internal cloud state machine contracts.
- Dedicated cloud diagnostics/devtools helpers.
- More focused component/controller tests around cloud UX states.

# Backlog
- `logics/backlog/item_246_req070_define_cloud_orchestration_module_boundaries_and_public_contracts.md`
- `logics/backlog/item_247_req070_extract_auth_profile_and_warmup_flows_from_use_cloud_save.md`
- `logics/backlog/item_248_req070_extract_autosync_conflict_and_sync_watermark_orchestration.md`
- `logics/backlog/item_249_req070_add_regression_coverage_for_refactored_cloud_orchestration_seams.md`

# Task
- `logics/tasks/task_121_execute_req070_cloud_orchestration_modularization_across_backlog_items_246_to_249.md`
