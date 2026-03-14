## req_069_normalize_legacy_logics_metadata_and_reduce_workflow_drift - Normalize legacy Logics metadata and reduce workflow drift
> From version: 0.9.39
> Understanding: 98%
> Confidence: 97%
> Complexity: Medium
> Theme: Process / Logics / CI hygiene
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.
> Status: Done

# Needs
- The project still carries a large amount of legacy Logics metadata drift, especially older backlog/task docs without normalized `Status` indicators.
- This drift creates ambiguity in workflow tooling and can surface unexpectedly in CI depending on branch history or diff range.
- The project needs a pragmatic normalization pass plus guardrails so the debt stops growing.

# Context
- Recent CI hardening improved Logics workflow handling, but older docs still reflect pre-normalized conventions.
- Some requests are normalized while many older tasks/backlog docs still rely only on `Progress` or older implicit states.
- This is not just cosmetic:
  - it affects lint behavior,
  - it complicates branch promotion flows,
  - and it weakens confidence in workflow tooling.

# Goals
- Stop the metadata drift from continuing.
- Normalize legacy Logics docs in a controlled way so CI/tooling assumptions become more reliable.
- Clarify what the minimum metadata contract should be for requests, backlog items, and tasks.
- Reduce branch-history-sensitive surprises in Logics gates.

# Non-goals
- Rewriting the full Logics workflow model from scratch.
- Reformatting old docs purely for style with no workflow value.
- Making every historical doc perfect before any other work can continue.

# Locked decisions (v1)
## Stop drift first, then clean in batches
- The first priority is to ensure new or touched docs follow the normalized metadata contract.
- Legacy cleanup should then happen in controlled batches, not as one giant risky rewrite.
- Cleanup should start with the most operationally relevant docs first:
  - recent or still-referenced tasks,
  - recent backlog items,
  - older historical docs later.

## Keep the metadata contract explicit
- `Status` should be the canonical workflow indicator.
- Older signals such as `Progress: 100%` may still exist, but they should not remain the only meaningful state marker indefinitely.

## Pragmatic compatibility
- Tooling may need temporary compatibility behavior during migration, but the end goal is normalized docs rather than permanent exceptions.
- The long-term target should be that no relevant legacy docs remain without normalized `Status`.

# Scope detail (draft)
## Metadata normalization
- Add missing `Status` indicators to legacy requests/backlog/tasks in prioritized batches.
- Ensure status values are consistent with current linter expectations.
- Keep temporary compatibility with `Progress: 100%` during migration, but treat it as transitional rather than canonical.

## Tooling alignment
- Review current lint/flow assumptions so they match the intended metadata contract.
- Keep migration behavior explicit where branch-history or release promotion flows are affected.

## Operational hygiene
- Establish a practical maintenance path so old drift does not reappear after the cleanup.

# Product/architecture constraints
- The cleanup should avoid unnecessary semantic edits to old docs.
- Bulk changes must remain reviewable and safe.
- CI behavior should become clearer, not more magical.

# Technical references likely impacted
- `logics/request/*`
- `logics/backlog/*`
- `logics/tasks/*`
- `logics/skills/logics-doc-linter/*`
- `logics/skills/logics-flow-manager/*`
- `scripts/ci/*`

# Acceptance criteria
- A clear normalized Logics metadata contract is enforced for current work.
- Legacy docs can be cleaned in batches without ambiguous status semantics.
- CI/workflow behavior becomes less sensitive to historical metadata drift.

# Test expectations
- Follow-up execution should expect:
  - Logics linter validation,
  - workflow tool validation,
  - targeted regression checks on CI/logics-flow behavior where needed.

# Risks / open points
- Mechanical bulk edits can create noise if not scoped carefully.
- Temporary compatibility behavior can become permanent if the migration is never completed.
- The cleanup should prioritize workflow value, not churn for its own sake.

# Follow-up candidates
- metadata contract clarification
- batch normalization of legacy backlog/tasks
- linter/tooling alignment
- CI regression coverage for Logics workflow behavior

# Backlog
- `logics/backlog/item_230_req069_define_normalized_logics_metadata_contract_and_migration_rules.md`
- `logics/backlog/item_231_req069_normalize_recent_tasks_and_backlog_docs_missing_status.md`
- `logics/backlog/item_232_req069_normalize_remaining_priority_legacy_requests_tasks_and_backlog_docs.md`
- `logics/backlog/item_233_req069_align_logics_lint_flow_and_ci_behavior_with_the_normalized_metadata_contract.md`
