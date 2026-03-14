## task_116_execute_req068_release_changelog_alignment_across_backlog_items_227_to_229 - Execute req068 release/changelog alignment across backlog items 227 to 229
> From version: 0.9.39
> Status: Done
> Understanding: 97%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Release / Changelog / Tooling
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_227_req068_add_release_changelog_resolution_helper_and_version_mapping_contract.md`
- `logics/backlog/item_228_req068_wire_github_release_workflow_to_curated_changelog_with_fallback.md`
- `logics/backlog/item_229_req068_document_release_changelog_usage_and_add_validation_checks.md`

Request reference:
- `logics/request/req_068_align_github_release_generation_with_curated_repository_changelogs.md`

This task aligns GitHub release generation with curated repository changelog files so authored version notes can drive public release communication when available, while keeping the workflow robust through an explicit fallback path.

# Decisions (v1)
- Curated changelog files are the preferred source of truth for release bodies when present.
- Missing curated changelog files should not hard-fail the release workflow in v1.
- Generated release notes remain the fallback.
- Existing release safety gates stay intact.
- The current changelog naming convention remains acceptable in v1 to avoid unnecessary migration churn.

# Architecture summary
- A helper or equivalent contract resolves tag version to changelog path.
- The release workflow consumes curated changelog content when found.
- If no curated file exists, the workflow falls back to generated notes.
- Documentation and lightweight validation make the convention maintainable for contributors.

# Plan
- [x] 1. Execute `item_227` (resolution helper + mapping contract):
  - Define and implement tag-to-changelog resolution behavior.
  - Keep it simple, explicit, and workflow-safe.
- [x] 2. Execute `item_228` (workflow wiring):
  - Update GitHub release automation to prefer curated changelog content with fallback.
  - Preserve current release validation gates.
- [x] 3. Execute `item_229` (docs + validation):
  - Document how changelog files participate in the release flow.
  - Add lightweight validation or warning support if appropriate.
- [x] FINAL: Update related Logics docs (request/backlog/task alignment)

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`
