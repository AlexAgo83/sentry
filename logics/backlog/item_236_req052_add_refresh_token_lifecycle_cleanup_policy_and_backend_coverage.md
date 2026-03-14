## item_236_req052_add_refresh_token_lifecycle_cleanup_policy_and_backend_coverage - req052 add refresh-token lifecycle cleanup policy and backend coverage
> From version: 0.9.40
> Status: Done
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Reliability / Backend / Operations
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Refresh-token rotation exists, but there is no explicit cleanup policy for revoked/expired rows. Over time that can create unnecessary persistence growth and operational ambiguity.

# Scope
- In:
- Define and implement a bounded cleanup policy for refresh-token records.
- Choose a low-risk trigger strategy, for example:
  - cleanup during auth operations on a sampled/bounded schedule,
  - and/or explicit batch cleanup on refresh/login/logout paths.
- Enforce safety limits:
  - bounded delete size,
  - expired/revoked rows only,
  - no impact on current valid refresh rotation.
- Add backend tests proving cleanup does not break refresh semantics.
- Out:
- No separate scheduler/cron infrastructure in v1.
- No redesign of token schema beyond what cleanup needs.

# Acceptance criteria
- Refresh-token persistence has a documented cleanup policy and concrete implementation.
- Cleanup is bounded and safe.
- Backend tests prove refresh rotation still works correctly after cleanup runs.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_052_post_global_review_security_and_cloud_reliability_hardening.md`.
- Likely touch points:
  - `backend/routes/auth.js`
  - `backend/server.js`
  - `tests/backend/cloudApi.test.ts`
