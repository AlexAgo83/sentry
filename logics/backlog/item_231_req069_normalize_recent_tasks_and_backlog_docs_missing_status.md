## item_231_req069_normalize_recent_tasks_and_backlog_docs_missing_status - req069 normalize recent tasks and backlog docs that are missing Status
> From version: 0.9.39
> Understanding: 95%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium
> Theme: Logics / Cleanup / Workflow hygiene
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The most operationally relevant metadata drift currently lives in more recent tasks and backlog docs that are still likely to intersect with current tooling, reviews, or branch promotion ranges.

# Scope
- In:
- Add normalized `Status` indicators to recent and still-relevant task/backlog docs that currently only rely on `Progress` or older conventions.
- Keep edits mechanical and safe.
- Out:
- No full historical cleanup in this item.
- No linter/tooling rule changes in this item.

# Acceptance criteria
- The most recent relevant task/backlog docs no longer rely on missing `Status`.
- Edits remain narrow and workflow-safe.
- The cleanup reduces current operational ambiguity.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_069_normalize_legacy_logics_metadata_and_reduce_workflow_drift.md`.
- Likely touch points:
  - `logics/backlog/*`
  - `logics/tasks/*`

