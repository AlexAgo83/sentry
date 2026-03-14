## req_068_align_github_release_generation_with_curated_repository_changelogs - Align GitHub release generation with curated repository changelogs
> From version: 0.9.39
> Understanding: 99%
> Confidence: 98%
> Complexity: Medium
> Theme: Release / Tooling / Changelog
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.
> Status: Done

# Needs
- The repository now maintains versioned changelog artifacts in `changelogs/`, but GitHub releases are still generated separately.
- This creates drift between:
  - the curated changelog tracked in the repo,
  - and the public release notes shown on GitHub.
- The release workflow should intentionally consume curated changelog content when available.

# Context
- A release tag currently triggers the GitHub release workflow.
- The current release workflow relies on generated GitHub release notes rather than repository-maintained version changelog files.
- That is acceptable as a fallback, but it is weaker than using the authored changelog when one exists.

# Goals
- Make GitHub release notes use the curated version changelog when available.
- Keep a safe fallback path for releases that do not yet have a dedicated changelog file.
- Make the release process more intentional and less duplicated.

# Non-goals
- Building a heavyweight release management platform.
- Requiring manual GitHub UI editing for every release.
- Changing the version/tagging model in this request.

# Locked decisions (v1)
## Curated changelog first
- If a versioned changelog file exists for the tag being released, it should be the source of truth for the release body.

## Generated notes remain a fallback
- If no curated changelog exists, generated release notes may still be used.
- This keeps the release pipeline resilient while favoring authored notes.

## Prefer robustness over hard failure in v1
- The release workflow should not fail solely because a curated changelog file is missing in v1.
- Missing curated changelogs should fall back cleanly to generated notes.

## Preserve existing release safety gates
- Release validation steps should remain intact unless explicitly revisited later.
- Existing changelog naming may remain as-is in v1 to avoid unnecessary migration churn.

# Scope detail (draft)
## Workflow behavior
- Detect the changelog file matching the tag version.
- Feed that content into the GitHub release body when found.
- Fall back to generated notes when not found.

## Repository conventions
- Clarify the mapping between:
  - tag `vX.Y.Z`
  - changelog file naming
  - release workflow expectations.

## Optional follow-up
- Add a small validation or warning if a release tag is created without a matching changelog file.

# Product/architecture constraints
- The workflow should remain simple and auditable.
- Failure behavior should be explicit if the changelog lookup is malformed.
- The repository changelog should not silently diverge from the release body anymore when a curated file exists.

# Technical references likely impacted
- `.github/workflows/release.yml`
- `changelogs/*`
- `package.json`
- `readme.md`
- `tests` or workflow validation scripts if needed

# Acceptance criteria
- A release tag can publish a GitHub release that uses the curated changelog file as body content when present.
- The workflow still works when no curated changelog file exists, using a clearly defined fallback.
- The mapping between version/tag/changelog is documented enough for normal release use.

# Test expectations
- Follow-up execution should expect:
  - workflow/script validation,
  - local dry-run or helper script checks if introduced,
  - documentation updates for the release path.

# Risks / open points
- File naming mismatches could silently break release note selection if not handled carefully.
- Overcomplicating the workflow would not be worth it for a simple release need.

# Follow-up candidates
- release-body resolution helper
- workflow updates
- changelog naming/usage documentation

# Backlog
- `logics/backlog/item_227_req068_add_release_changelog_resolution_helper_and_version_mapping_contract.md`
- `logics/backlog/item_228_req068_wire_github_release_workflow_to_curated_changelog_with_fallback.md`
- `logics/backlog/item_229_req068_document_release_changelog_usage_and_add_validation_checks.md`

# Implemented in
- `logics/tasks/task_116_execute_req068_release_changelog_alignment_across_backlog_items_227_to_229.md`
