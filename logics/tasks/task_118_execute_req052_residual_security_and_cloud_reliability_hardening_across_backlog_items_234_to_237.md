## task_118_execute_req052_residual_security_and_cloud_reliability_hardening_across_backlog_items_234_to_237 - Execute req052 residual security and cloud reliability hardening across backlog items 234 to 237
> From version: 0.9.40
> Status: Ready
> Understanding: 97%
> Confidence: 94%
> Progress: 0%
> Complexity: High
> Theme: Security / Reliability / Cloud
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_234_req052_harden_auth_rate_limit_key_trust_boundary_and_proxy_awareness.md`
- `logics/backlog/item_235_req052_guard_csrf_localstorage_writes_and_add_storage_denial_regressions.md`
- `logics/backlog/item_236_req052_add_refresh_token_lifecycle_cleanup_policy_and_backend_coverage.md`
- `logics/backlog/item_237_req052_resolve_remaining_qs_advisory_and_document_dependency_decision.md`

Request reference:
- `logics/request/req_052_post_global_review_security_and_cloud_reliability_hardening.md`

This task finishes the residual hardening scope that remained open after earlier security/reliability work was absorbed by `req_047`. The remaining focus is narrow and concrete: remove the auth rate-limit trust-boundary weakness, make CSRF persistence write-safe, add explicit refresh-token cleanup, and close the remaining `qs` advisory decision.

# Decisions (v1)
- Treat this as a residual hardening pass, not a broad new security initiative.
- Keep player-facing cloud UX unchanged unless a fix requires clearer error handling.
- Prefer explicit, test-locked behavior over implicit environment heuristics.
- If the `qs` advisory cannot be fully removed immediately, document the exact decision and keep the remediation path deterministic.

# Architecture summary
- Backend auth/rate-limit logic should have explicit trust-boundary rules for client identity derivation.
- Frontend cloud client storage writes should treat browser storage as fallible on both read and write paths.
- Refresh-token persistence should have a bounded lifecycle policy instead of indefinite table growth.
- Dependency security follow-up should result in a repository-level recorded decision, not a lingering audit TODO.

# Plan
- [ ] 1. Execute `item_234` (rate-limit trust boundary):
  - Remove default trust in raw `x-forwarded-for`.
  - Add explicit proxy-aware mode only when configured.
  - Lock behavior with backend tests.
- [ ] 2. Execute `item_235` (CSRF storage write resilience):
  - Guard CSRF token writes/removals with safe storage handling.
  - Add regression tests for storage-denied scenarios.
- [ ] 3. Execute `item_236` (refresh-token cleanup):
  - Define the cleanup contract and implement bounded cleanup.
  - Add backend coverage to prove cleanup does not break refresh rotation.
- [ ] 4. Execute `item_237` (dependency advisory decision):
  - Resolve or explicitly document the remaining `qs` advisory path.
  - Update lockfile/config and validation visibility as needed.
- [ ] FINAL: Update related Logics docs (request/backlog/task alignment)

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`

Recommended:
- `npm run coverage:ci`
- `npm run build`
- `npm run test:e2e`
