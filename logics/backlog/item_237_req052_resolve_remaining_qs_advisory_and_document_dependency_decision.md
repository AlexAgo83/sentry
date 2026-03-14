## item_237_req052_resolve_remaining_qs_advisory_and_document_dependency_decision - req052 resolve remaining qs advisory and document dependency decision
> From version: 0.9.40
> Status: Ready
> Understanding: 96%
> Confidence: 93%
> Progress: 0%
> Complexity: Medium
> Theme: Security / Dependencies / CI
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`npm audit --omit=dev --audit-level=moderate` still reports the `qs` advisory. That leaves `req_052` partially unresolved and keeps dependency security status ambiguous.

# Scope
- In:
- Identify the exact dependency path that still pulls vulnerable `qs` ranges.
- Choose and implement a deterministic remediation path:
  - direct upgrade,
  - transitive upgrade,
  - or explicit override/pin if upstream lag remains.
- Document the decision and any temporary tradeoff if a full fix is blocked.
- Re-run audit visibility checks so the repository can confirm the issue is resolved or intentionally tracked.
- Out:
- No full dependency refresh across the whole backend/frontend stack.
- No attempt to eliminate unrelated advisories in the same item unless required by the chosen fix path.

# Acceptance criteria
- The `qs` advisory is either removed from audit output or explicitly documented as blocked with a concrete remediation path.
- The repository has a deterministic decision recorded for future updates.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_052_post_global_review_security_and_cloud_reliability_hardening.md`.
- Likely touch points:
  - `package.json`
  - `package-lock.json`
  - `.github/workflows/ci.yml`
  - `changelogs/*` or request notes if a temporary decision is needed
