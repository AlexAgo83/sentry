# Logics Metadata Contract

Canonical indicators for workflow docs:

- Requests:
  - `From version`
  - `Status`
  - `Understanding`
  - `Confidence`
- Backlog items:
  - `From version`
  - `Status`
  - `Understanding`
  - `Confidence`
  - `Progress`
- Tasks:
  - `From version`
  - `Status`
  - `Understanding`
  - `Confidence`
  - `Progress`

Status model:

- `Draft`
- `Ready`
- `In progress`
- `Blocked`
- `Done`
- `Archived`

Migration rules:

- `Status` is the canonical workflow indicator.
- `Progress` remains useful on backlog items and tasks, but it does not replace `Status`.
- Legacy backlog/task docs that already represent completed work should be normalized to:
  - `Status: Done`
  - `Progress: 100%`
- Requests without an explicit terminal state should be normalized conservatively:
  - use `Ready` when the need remains open,
  - use `Done` only when linked delivery is complete and reflected by the workflow chain.

Operational rules:

- New docs and touched docs must not omit `Status`.
- Bulk legacy cleanup should stay mechanical and semantically conservative.
- CI and local mirrors should use the strict linter mode once the repository is normalized.
