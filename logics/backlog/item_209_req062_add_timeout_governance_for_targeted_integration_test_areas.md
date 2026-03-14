## item_209_req062_add_timeout_governance_for_targeted_integration_test_areas - req062 add timeout governance for targeted integration test areas
> From version: 0.9.38
> Status: Done
> Understanding: 95%
> Confidence: 93%
> Progress: 100%
> Complexity: Medium
> Theme: Quality / Reliability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
As the suite grows, targeted integration tests can drift toward local timeout overrides as a convenience mechanism. Without governance, this hides structural slowness, normalizes flaky behavior, and makes CI performance harder to manage.

# Scope
- In:
- Add a quality gate that scans targeted test areas for explicit per-test timeout overrides or equivalent escape hatches.
- Define a narrow allowlist mechanism for temporary exceptions with rationale.
- Focus first on the most integration-heavy areas where timeout drift is most likely:
  - `tests/app/**`,
  - compatibility/save-flow scenarios,
  - other explicitly designated slow Vitest lanes.
- Keep the policy incremental and practical rather than universal from day one.
- Out:
- No blanket refactor of every existing slow test in this item.
- No CI lane restructuring in this item beyond exposing the governance command.

# Acceptance criteria
- A dedicated validation command exists for timeout governance.
- Unapproved timeout overrides in targeted test areas fail validation.
- Temporary exceptions require explicit allowlisting and rationale.
- The policy is documented clearly enough that contributors know how to comply.

# Priority
- Impact: Medium
- Urgency: High

# Notes
- Derived from `logics/request/req_062_strengthen_sentry_test_governance_with_explicit_lanes_timeout_policy_and_save_flow_compatibility.md`.
- Planned delivery via `logics/tasks/task_111_execute_req062_test_governance_and_save_flow_compatibility_across_backlog_items_208_to_211.md`.
- Depends on explicit lane targeting from:
  - `logics/backlog/item_208_req062_define_explicit_test_lane_contract_and_segmented_execution_commands.md`
- Likely touch points:
  - `package.json`
  - `scripts/*`
  - `tests/app/**`
  - `tests/core/**`
