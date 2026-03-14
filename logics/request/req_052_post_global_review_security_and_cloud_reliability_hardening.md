## req_052_post_global_review_security_and_cloud_reliability_hardening - Post global review security and cloud reliability hardening
> From version: 0.9.40
> Status: Done
> Understanding: 100%
> Confidence: 98%
> Complexity: Medium
> Theme: Security / Reliability
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Address high-impact hardening gaps identified during the latest global review.
- Reduce authentication abuse and cloud sync fragility without changing player-facing flows.
- Keep implementation incremental and low-risk, with targeted regression tests.

# Context
- A large portion of the original hardening plan was already absorbed by:
  - `logics/request/req_047_security_pwa_offline_ci_hardening_and_maintainability.md`
  - backlog items `152` to `160`
- The project already has:
  - DB-backed auth rate limiting,
  - memory-only access token storage,
  - CSRF-based refresh flow,
  - broad automated validation (`lint`, `typecheck`, `test:ci`, `build`, `test:e2e`).
- This request now tracks the residual hardening gaps still confirmed as open:
  - trust boundary issue in auth rate-limit key derivation (client-controlled `x-forwarded-for`),
  - unguarded CSRF token writes to `localStorage`,
  - no lifecycle cleanup for refresh token rows,
  - one known low-severity transitive dependency advisory (`qs`).
- Constraints:
  - preserve current login/refresh UX,
  - avoid disruptive auth redesign,
  - keep compatibility with current backend and cloud flows.

# Goals
- Security
  - Prevent rate-limit bypass through spoofed forwarding headers.
  - Keep CSRF persistence resilient in constrained browser storage environments.
- Reliability / Ops
  - Cap refresh-token table growth with explicit cleanup policy and implementation.
  - Track and resolve the `qs` advisory with a deterministic dependency plan.
- Quality
  - Add tests that lock in each fix and avoid silent regressions.

# Non-goals
- Full auth protocol redesign (OAuth, MFA, password reset, session dashboard).
- Changing cloud save contracts or migration formats.
- Reworking all dependency policies in one pass.

# Scope detail (draft)
## A. Auth rate-limit trust boundary
- Update backend rate-limit keying to avoid trusting raw client headers by default.
- Support a safe proxy-aware mode only when explicitly configured.
- Add backend tests for:
  - forged `x-forwarded-for` cannot bypass limit in default mode,
  - configured trusted proxy mode still behaves as expected.

## B. CSRF storage write hardening
- Wrap CSRF `localStorage` writes/removals in safe guards (`try/catch`) consistent with read path.
- Ensure failures degrade gracefully (no runtime crash during login/refresh/logout).
- Add frontend tests for storage-denied scenarios.

## C. Refresh token lifecycle cleanup
- Define cleanup policy:
  - remove revoked/expired refresh tokens on a bounded schedule and/or during auth operations.
- Implement cleanup path with clear safety limits (batch delete).
- Add backend tests validating cleanup does not break refresh rotation.

## D. Dependency advisory follow-up
- Introduce explicit tracking/remediation item for `qs` advisory:
  - upgrade transitive chain when available or pin safe override if needed.
- Ensure CI visibility remains clear (no hidden vulnerability drift).

# Technical references likely impacted
- `backend/server.js`
- `backend/routes/auth.js`
- `src/app/api/cloudClient.ts`
- `tests/backend/cloudApi.test.ts`
- `tests/app/*` (cloud/auth focused suites)
- `package.json`
- `package-lock.json`

# Acceptance criteria
- Auth rate limiting cannot be bypassed by client-crafted forwarding headers in default deployment mode.
- CSRF token storage operations cannot crash cloud auth flows when browser storage access fails.
- Refresh token persistence has a documented and implemented cleanup mechanism.
- `qs` advisory has a documented remediation decision and an execution path.
- New/updated tests cover all above behaviors.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Recommended:
  - `npm run coverage:ci`
  - `npm run build`
  - `npm run test:e2e`

# Backlog
- `logics/backlog/item_234_req052_harden_auth_rate_limit_key_trust_boundary_and_proxy_awareness.md`
- `logics/backlog/item_235_req052_guard_csrf_localstorage_writes_and_add_storage_denial_regressions.md`
- `logics/backlog/item_236_req052_add_refresh_token_lifecycle_cleanup_policy_and_backend_coverage.md`
- `logics/backlog/item_237_req052_resolve_remaining_qs_advisory_and_document_dependency_decision.md`

# Task
- `logics/tasks/task_118_execute_req052_residual_security_and_cloud_reliability_hardening_across_backlog_items_234_to_237.md`

# Completion notes
- Auth rate limiting now ignores raw `x-forwarded-for` by default and only trusts forwarding headers when `AUTH_RATE_LIMIT_TRUST_PROXY=1` is set explicitly.
- CSRF token persistence/removal is now best-effort on write paths as well as read paths, with dedicated storage-denial regressions.
- Refresh-token lifecycle cleanup is implemented as a bounded stale-row cleanup during token issuance.
- The historical `qs` advisory is considered resolved in the current dependency graph and was re-validated during this task with a clean production audit.
