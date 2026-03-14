## item_230_req069_define_normalized_logics_metadata_contract_and_migration_rules - req069 define the normalized Logics metadata contract and migration rules
> From version: 0.9.39
> Understanding: 96%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Logics / Process / Tooling
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Legacy Logics docs still mix older implicit conventions with newer explicit status metadata. Before large cleanup happens, the project needs a clear contract for what is canonical now and how migration should proceed.

# Scope
- In:
- Define the normalized metadata contract for requests, backlog items, and tasks.
- Clarify the role of `Status` versus older signals like `Progress: 100%`.
- Define pragmatic migration rules and batch priorities.
- Out:
- No bulk document normalization in this item.

# Acceptance criteria
- The project has an explicit metadata contract for Logics docs.
- Migration rules are clear enough to guide bulk cleanup safely.
- Canonical versus transitional indicators are unambiguous.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_069_normalize_legacy_logics_metadata_and_reduce_workflow_drift.md`.
- Likely touch points:
  - `logics/*`
  - linter/flow tooling docs

