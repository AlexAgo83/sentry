## item_234_req052_harden_auth_rate_limit_key_trust_boundary_and_proxy_awareness - req052 harden auth rate-limit key trust boundary and proxy awareness
> From version: 0.9.40
> Status: Done
> Understanding: 100%
> Confidence: 98%
> Progress: 100%
> Complexity: Medium
> Theme: Security / Backend
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The backend still derives auth rate-limit keys from raw `x-forwarded-for` input by default. That keeps a trust-boundary weakness alive: a client can spoof forwarding headers and potentially evade per-route abuse limits.

# Scope
- In:
- Change rate-limit key derivation so default deployments do not trust client-supplied forwarding headers.
- Add an explicit proxy-aware mode only when configured intentionally.
- Document the runtime contract for:
  - default direct deployment behavior,
  - trusted proxy behavior,
  - fallback to request socket IP.
- Add backend regression tests for:
  - spoofed `x-forwarded-for` does not change the key in default mode,
  - trusted proxy mode still resolves expected client identity.
- Out:
- No redesign of the full auth/rate-limit model.
- No infra-specific proxy autodetection heuristics.

# Acceptance criteria
- Default deployments no longer trust raw forwarding headers for auth rate limiting.
- Any proxy-aware behavior is opt-in and test-covered.
- Tests prove spoofed forwarding headers cannot bypass the auth limiter in default mode.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_052_post_global_review_security_and_cloud_reliability_hardening.md`.
- Likely touch points:
  - `backend/server.js`
  - `tests/backend/cloudApi.test.ts`
