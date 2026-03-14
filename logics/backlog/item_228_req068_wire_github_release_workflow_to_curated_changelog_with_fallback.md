## item_228_req068_wire_github_release_workflow_to_curated_changelog_with_fallback - req068 wire the GitHub release workflow to curated changelog content with fallback
> From version: 0.9.39
> Understanding: 97%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Release / GitHub Actions
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Curated changelog resolution only helps if the GitHub release workflow actually consumes it. The workflow must prefer the curated changelog body when present while retaining a robust fallback path.

# Scope
- In:
- Update the release workflow so:
  - curated changelog content is used as the release body when found,
  - generated notes remain a fallback when not found,
  - existing release safety gates remain intact.
- Out:
- No broader release process redesign.
- No hard failure policy when changelog content is missing in v1.

# Acceptance criteria
- Tag-driven releases can publish with curated changelog content automatically when available.
- Missing changelog files fall back cleanly instead of breaking the workflow.
- Existing release validation remains intact.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_068_align_github_release_generation_with_curated_repository_changelogs.md`.
- Likely touch points:
  - `.github/workflows/release.yml`
  - release helper scripts
- Delivered via:
  - `.github/workflows/release.yml`
