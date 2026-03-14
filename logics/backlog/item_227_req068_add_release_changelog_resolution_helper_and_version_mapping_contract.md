## item_227_req068_add_release_changelog_resolution_helper_and_version_mapping_contract - req068 add a release changelog resolution helper and version-mapping contract
> From version: 0.9.39
> Status: Done
> Understanding: 97%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Release / Tooling
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The release workflow cannot reliably consume curated changelog content until the repo has an explicit mapping from tags to changelog files. That mapping should be deliberate and reusable rather than hidden inside ad hoc workflow shell logic.

# Scope
- In:
- Define how a tag version resolves to a changelog path.
- Add a helper script or equivalent workflow-safe mechanism that resolves the curated release body when present.
- Keep the current naming convention compatible in v1.
- Out:
- No GitHub release workflow wiring in this item.

# Acceptance criteria
- The repository has an explicit and reusable way to resolve a release changelog file from a tag version.
- Resolution behavior is understandable and auditable.
- Missing changelog behavior is explicit rather than ambiguous.

# Priority
- Impact: Medium
- Urgency: High

# Notes
- Derived from `logics/request/req_068_align_github_release_generation_with_curated_repository_changelogs.md`.
- Likely touch points:
  - `scripts/*`
  - `changelogs/*`
  - workflow helper code
- Delivered via:
  - `scripts/release/resolve-release-changelog.mjs`
  - `tests/scripts/release/resolveReleaseChangelog.test.ts`
