## task_117_execute_req069_logics_metadata_normalization_across_backlog_items_230_to_233 - Execute req069 Logics metadata normalization across backlog items 230 to 233
> From version: 0.9.39
> Status: Done
> Understanding: 98%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Logics / CI / Process hygiene
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_230_req069_define_normalized_logics_metadata_contract_and_migration_rules.md`
- `logics/backlog/item_231_req069_normalize_recent_tasks_and_backlog_docs_missing_status.md`
- `logics/backlog/item_232_req069_normalize_remaining_priority_legacy_requests_tasks_and_backlog_docs.md`
- `logics/backlog/item_233_req069_align_logics_lint_flow_and_ci_behavior_with_the_normalized_metadata_contract.md`

Request reference:
- `logics/request/req_069_normalize_legacy_logics_metadata_and_reduce_workflow_drift.md`

This task normalizes the remaining relevant legacy Logics metadata so repository workflow behavior becomes less ambiguous and less sensitive to branch history, while keeping the cleanup pragmatic and compatible with the current tooling stack.

# Decisions (v1)
- `Status` is the canonical workflow indicator.
- Existing `Progress: 100%` usage may remain temporarily during migration, but it is transitional rather than canonical.
- Cleanup should happen in batches, starting with the most operationally relevant tasks/backlog docs.
- Tooling compatibility may exist during migration, but the end goal is normalized docs rather than permanent exceptions.

# Architecture summary
- Contract/migration rules define what “normalized” means.
- Cleanup batches then apply that contract to recent and still-relevant docs first.
- Additional priority legacy docs are normalized in later controlled batches.
- Lint/flow/CI behavior is aligned with the contract so the cleanup becomes durable rather than symbolic.

# Plan
- [x] 1. Execute `item_230` (metadata contract + migration rules):
  - Define the canonical Logics metadata contract and migration semantics.
  - Clarify the role of `Status` versus transitional indicators.
- [x] 2. Execute `item_231` (recent relevant cleanup):
  - Normalize recent/high-value task and backlog docs missing `Status`.
  - Keep edits narrow, mechanical, and reviewable.
- [x] 3. Execute `item_232` (remaining priority legacy cleanup):
  - Normalize additional priority legacy docs in controlled batches.
  - Move the repo materially closer to eliminating relevant `MISSING Status` drift.
- [x] 4. Execute `item_233` (tooling/CI alignment):
  - Align lint, flow, and CI behavior with the normalized metadata contract.
  - Keep transitional compatibility explicit where still needed.
- [x] FINAL: Update related Logics docs (request/backlog/task alignment)

# Validation
Final gate (mandatory at task end):
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `python3 -m unittest discover -s logics/skills/tests -p "test_*.py" -v`
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
