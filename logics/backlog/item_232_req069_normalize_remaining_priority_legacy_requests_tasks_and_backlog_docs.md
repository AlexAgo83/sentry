## item_232_req069_normalize_remaining_priority_legacy_requests_tasks_and_backlog_docs - req069 normalize remaining priority legacy requests, tasks, and backlog docs
> From version: 0.9.39
> Status: Done
> Understanding: 97%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Logics / Cleanup / Backlog hygiene
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
After the recent/high-value cleanup, the repository will still contain older priority legacy docs without normalized status metadata. Those remaining gaps should be cleaned in additional controlled batches to move toward a fully coherent baseline.

# Scope
- In:
- Normalize remaining priority legacy requests/tasks/backlog docs beyond the most recent operational batch.
- Keep cleanup organized and reviewable rather than one giant mechanical dump.
- Out:
- No attempt to perfect every archival doc in one pass.
- No workflow bypasses in place of cleanup.

# Acceptance criteria
- Additional priority legacy docs are normalized with explicit `Status`.
- Cleanup is done in manageable batches with low semantic risk.
- The repo moves materially closer to eliminating relevant `MISSING Status` drift.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_069_normalize_legacy_logics_metadata_and_reduce_workflow_drift.md`.
- Likely touch points:
  - `logics/request/*`
  - `logics/backlog/*`
  - `logics/tasks/*`
