## item_233_req069_align_logics_lint_flow_and_ci_behavior_with_the_normalized_metadata_contract - req069 align Logics lint, flow, and CI behavior with the normalized metadata contract
> From version: 0.9.39
> Understanding: 95%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium
> Theme: Logics / CI / Tooling alignment
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Metadata cleanup alone is not sufficient if Logics lint, flow tooling, and CI behavior do not clearly align with the new canonical contract. The tooling layer must reflect the normalized rules so the cleanup stays durable.

# Scope
- In:
- Review and adjust lint/flow/CI behavior so it matches the normalized metadata contract.
- Keep temporary compatibility explicit where migration is still in progress.
- Add targeted validation/regression checks where needed.
- Out:
- No unrelated CI redesign.
- No cosmetic Logics cleanup in this item.

# Acceptance criteria
- Logics lint/flow/CI behavior matches the intended metadata contract.
- Transitional compatibility is explicit and reviewable.
- The repo is less vulnerable to branch-history-sensitive surprises caused by legacy metadata drift.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_069_normalize_legacy_logics_metadata_and_reduce_workflow_drift.md`.
- Likely touch points:
  - `logics/skills/logics-doc-linter/*`
  - `logics/skills/logics-flow-manager/*`
  - `scripts/ci/*`
  - `.github/workflows/*`

