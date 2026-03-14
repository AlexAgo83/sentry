## item_208_req062_define_explicit_test_lane_contract_and_segmented_execution_commands - req062 define an explicit test lane contract and segmented execution commands
> From version: 0.9.38
> Status: Done
> Understanding: 96%
> Confidence: 94%
> Progress: 100%
> Complexity: Medium
> Theme: Quality / CI
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`Sentry` has a large and growing test suite, but the heaviest integration-oriented tests are still mostly discovered implicitly through folder traversal and broad `vitest` execution. This makes it harder to reason about ownership, execution cost, and what should belong to fast versus slow lanes.

# Scope
- In:
- Define explicit test lanes that reflect `Sentry`'s actual suite shape, for example:
  - fast/core,
  - app integration,
  - backend/runtime seam,
  - save/bootstrap compatibility.
- Add a script or scripts that validate lane membership and support segmented execution locally and in CI.
- Make heavy or broad tests opt into an explicit lane contract instead of remaining only implicitly grouped.
- Prefer incremental classification over a disruptive full test-suite rewrite.
- Out:
- No timeout-policy enforcement in this item.
- No new compatibility tests in this item.
- No Playwright flow redesign in this item.

# Acceptance criteria
- The repository exposes clear commands for running explicit Vitest lanes.
- A structural check exists to validate the lane contract.
- The initial contract covers the heaviest or most integration-oriented non-E2E tests.
- Lane definitions remain understandable and maintainable for contributors.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_062_strengthen_sentry_test_governance_with_explicit_lanes_timeout_policy_and_save_flow_compatibility.md`.
- Planned delivery via `logics/tasks/task_111_execute_req062_test_governance_and_save_flow_compatibility_across_backlog_items_208_to_211.md`.
- Likely touch points:
  - `package.json`
  - `scripts/*`
  - `tests/app/**`
  - `tests/backend/**`
  - `tests/core/**`
  - `vitest.ci.mjs`
