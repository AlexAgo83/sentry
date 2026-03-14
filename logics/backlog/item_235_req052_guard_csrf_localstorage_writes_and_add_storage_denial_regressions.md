## item_235_req052_guard_csrf_localstorage_writes_and_add_storage_denial_regressions - req052 guard CSRF localStorage writes and add storage-denial regressions
> From version: 0.9.40
> Status: Done
> Understanding: 100%
> Confidence: 98%
> Progress: 100%
> Complexity: Medium
> Theme: Security / Reliability / Frontend
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Cloud auth read paths already treat browser storage as fallible, but CSRF token writes/removals still use raw `localStorage.setItem/removeItem`. In storage-denied environments, login, refresh, or logout can still throw unexpectedly.

# Scope
- In:
- Wrap CSRF token writes/removals in safe guards consistent with the existing read path.
- Keep failure behavior graceful:
  - no runtime crash,
  - no broken logout path,
  - no hard failure for recoverable storage denial.
- Add focused tests for:
  - `localStorage.setItem` throwing during login/refresh token persistence,
  - `localStorage.removeItem` throwing during logout/cleanup,
  - cloud auth flows staying recoverable.
- Out:
- No redesign of the broader localStorage strategy.
- No removal of CSRF local storage as the chosen source of truth.

# Acceptance criteria
- CSRF token persistence/removal cannot crash cloud auth flows when storage writes are denied.
- Tests explicitly cover storage-denied behavior on login, refresh, and cleanup paths.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_052_post_global_review_security_and_cloud_reliability_hardening.md`.
- Likely touch points:
  - `src/app/api/cloudClient.ts`
  - `tests/app/api/cloudClient.storage.test.ts`
