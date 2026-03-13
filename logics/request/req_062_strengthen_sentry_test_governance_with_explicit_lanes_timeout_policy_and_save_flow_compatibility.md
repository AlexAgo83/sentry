## req_062_strengthen_sentry_test_governance_with_explicit_lanes_timeout_policy_and_save_flow_compatibility - Strengthen Sentry test governance with explicit lanes, timeout policy, and save-flow compatibility coverage
> From version: 0.9.38
> Understanding: 94%
> Confidence: 93%
> Complexity: Medium
> Theme: Quality / CI / Reliability
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- The project already has a broad test surface, but it lacks a strong structural contract for how tests are grouped, governed, and enforced in CI.
- Runtime/save/bootstrap flows are critical product seams and should have a more explicit compatibility and persistence test layer.
- Test performance and reliability should remain manageable as the suite grows, without normalizing ad hoc timeouts or unclear ownership of heavy tests.

# Context
- `Sentry` already has substantial quality gates:
  - lint,
  - typecheck,
  - CI Vitest config,
  - coverage thresholds,
  - Playwright smoke,
  - bundle checks,
  - flaky checks.
- The current CI is effective but mostly linear and tool-oriented rather than explicitly organized around test lanes and product-critical contracts.
- Recent work around:
  - startup loading,
  - atomic startup persistence,
  - shared bootstrap between startup/import/cloud,
  - save flow reliability,
  increases the need for durable regression coverage around runtime/save behavior.
- Comparison with `electrical-plan-editor` suggests several patterns are realistically transferable:
  - explicit lane ownership for heavier UI/integration tests,
  - timeout governance instead of uncontrolled per-test overrides,
  - compatibility-style persistence tests,
  - informative CI reporting for slow or structurally risky test areas.
- Not all patterns should be copied:
  - generic UI modularization gates are likely too project-specific,
  - `Sentry` should focus first on runtime, persistence, bootstrap, and save-flow reliability.

# Goals
- Introduce a clearer testing contract for `Sentry` by defining explicit test lanes with enforceable boundaries.
- Add governance around test timeout overrides so slow tests are visible and justified instead of silently normalized.
- Add a dedicated compatibility/regression layer for:
  - startup bootstrap,
  - local import,
  - cloud load,
  - persistence and migration-sensitive save flows.
- Improve CI visibility into test suite shape and slow areas without creating unnecessary maintenance burden.

# Non-goals
- Replacing the current Vitest or Playwright stack.
- Rewriting the entire existing test suite into a new folder taxonomy in one pass.
- Introducing generic UI line-budget or component modularization gates unrelated to `Sentry`'s current pain points.
- Turning all informative CI reporting into blocking gates from day one.
- Solving every historical flakiness source in the same request.

# Locked decisions (v1)
## Explicit lanes
- The test suite must define a small number of named lanes that reflect how `Sentry` actually behaves in CI.
- Candidate lanes for v1:
  - fast/unit-core,
  - app integration,
  - backend/runtime seam,
  - save/bootstrap compatibility,
  - e2e smoke.
- Heavy or broad integration tests must belong to an explicit lane contract rather than being discovered implicitly.

## Timeout governance
- Per-test timeout overrides should be treated as exceptions, not the default scaling mechanism for a growing suite.
- A validation script may allow a temporary allowlist, but each exception must be explicit and justified.

## Save/bootstrap compatibility coverage
- `Sentry` must gain a more explicit test layer for persistence-sensitive flows:
  - save serialization round-trips,
  - migration/rehydration invariants,
  - startup catch-up bootstrap semantics,
  - local import and cloud load application semantics,
  - interruption/partial-persistence safety where applicable.
- These tests should be deterministic and prefer direct runtime/store seams over browser-only coverage.

## CI reporting posture
- Reporting for slow tests or lane composition may start as informational before becoming blocking.
- Structural checks that protect test-lane contract and timeout governance can be blocking once stable.

# Scope detail (draft)
## Test lane contract
- Introduce a script or scripts that:
  - enumerate tests belonging to explicit lanes,
  - fail when designated heavy suites are not classified correctly,
  - support running individual lanes in CI and locally.
- The first target should be the tests most likely to grow in cost:
  - `tests/app/**`,
  - selected runtime/save scenario tests,
  - selected backend seam tests.
- Avoid a large rename-only migration unless classification clearly benefits from it.

## Timeout policy
- Add a quality gate that scans for explicit `test`/`it` timeout overrides or equivalent patterns in targeted test areas.
- Permit narrowly scoped temporary exceptions only through a documented allowlist.
- Prefer decomposing or reclassifying slow tests over increasing local timeouts.

## Save-flow compatibility layer
- Add a dedicated layer, directory, or naming convention for tests that protect runtime/save compatibility semantics.
- Focus on invariants rather than UI details:
  - persisted save can still hydrate,
  - imported save flows use expected bootstrap/persistence semantics,
  - startup bootstrap remains deterministic,
  - partial persistence protection remains intact,
  - schema-sensitive payloads are safely normalized or rejected.

## CI evolution
- Evolve CI from one long undifferentiated test block toward clearer execution phases or jobs.
- A realistic v1 may still keep one main workflow but should expose:
  - lane validation,
  - lane execution,
  - optional slow-test reporting.
- Parallelization can be introduced later if CI duration justifies it.

## Observability of suite health
- Add at least one informative report to surface suite health trends, such as:
  - slowest tests,
  - lane composition summary,
  - compatibility-suite coverage summary.
- Keep informative reports non-blocking at first unless they directly protect a correctness contract.

# Technical references likely impacted
- `package.json`
- `.github/workflows/ci.yml`
- `vitest.ci.mjs`
- `playwright.config.ts`
- `scripts/flaky-check.js`
- `scripts/run-tests.js`
- `tests/app/**`
- `tests/core/**`
- `tests/backend/**`
- `tests/offlinePersistence.test.ts`
- `tests/offlineLoop.test.ts`
- `tests/core/runtime.test.ts`
- `tests/app/startupSplashScreen.test.tsx`
- `tests/app/localSaveModal.test.tsx`
- `tests/app/cloudSavePanel.test.tsx`
- `tests/app/offlineRecapModal.test.tsx`
- `src/core/runtime.ts`
- `src/core/serialization.ts`
- `src/core/state.ts`
- `src/app/hooks/useSaveManagement.ts`
- `src/app/hooks/useCloudSave.tsx`
- `logics/request/req_057_make_startup_loading_non_blocking_with_visible_progress_and_background_processing.md`
- `logics/request/req_058_make_startup_offline_catch_up_atomic_and_prevent_partial_save_persistence.md`
- `logics/request/req_059_unify_startup_local_import_and_cloud_load_bootstrap_with_shared_loading_flow.md`

# Acceptance criteria
- The repository defines explicit test lanes for the heaviest or most integration-oriented parts of the suite.
- CI validates that lane classification remains coherent as the suite grows.
- A timeout-governance check exists for targeted test areas and rejects unapproved per-test timeout overrides.
- `Sentry` gains a dedicated save/bootstrap compatibility regression layer or equivalent explicit coverage contract.
- CI exposes at least one informative test-health report beyond raw pass/fail.
- Existing mandatory checks remain runnable locally with clear commands.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Expected additions:
  - lane contract validation command,
  - timeout governance validation command,
  - targeted save/bootstrap compatibility tests,
  - optional slow-test or lane-summary reporting command.

# Risks / open points
- Over-segmenting the suite too early could create maintenance overhead without enough payoff.
- A strict timeout policy can be noisy if introduced before the slowest tests are understood.
- Save/bootstrap compatibility tests may expose current architecture seams that are not yet easy to drive deterministically.
- CI restructuring should avoid duplicating expensive test execution unnecessarily.

# Backlog
- `logics/backlog/item_208_req062_define_explicit_test_lane_contract_and_segmented_execution_commands.md`
- `logics/backlog/item_209_req062_add_timeout_governance_for_targeted_integration_test_areas.md`
- `logics/backlog/item_210_req062_add_save_and_bootstrap_compatibility_regression_suite.md`
- `logics/backlog/item_211_req062_integrate_lane_validation_timeout_policy_and_suite_health_reporting_into_ci.md`
