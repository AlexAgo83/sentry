# Changelog (`0.9.40 -> 0.9.41`)

## Major Highlights

- Added a full in-game wiki with section navigation, list/detail layout, lightweight filters, and direct access from `Settings`.
- Shipped a one-time onboarding system with first-minutes guidance, contextual hints, and dev-only onboarding controls.
- Finished the residual cloud/security hardening pass and refactored cloud save orchestration into smaller dedicated modules.

## Version 0.9.41

### Game wiki

- Added the new `/wiki` reference surface for `Skills`, `Recipes`, `Items`, and `Dungeons`.
- Built data-driven wiki entries from game definitions instead of maintaining a separate manual content layer.
- Added section-aware URLs, a panel header `Back` action, mobile-ready layout behavior, and follow-up UI polish for list spacing and detail badges.

### Onboarding and UX guidance

- Added a persisted first-minutes onboarding flow with compact intro steps and one-shot contextual hints on key screens.
- Moved onboarding debug controls out of general `Settings` and into `DevTools`.
- Refined the desktop onboarding hint as a floating bottom-left panel rendered through `document.body`, while preserving the existing mobile behavior.

### Cloud hardening and frontend modularization

- Hardened residual cloud/auth reliability paths, including safer client key trust handling, guarded CSRF storage writes, and refresh-token lifecycle cleanup coverage.
- Split cloud save orchestration into clearer seams for auth/profile handling, warmup/probing, autosync/conflict logic, and supporting bridges.
- Kept the full cloud save flow green after the refactor with targeted regression coverage.

### Quality and follow-up polish

- Stabilized CI after the wiki/onboarding rollout and kept the full local CI mirror green on the feature branch.
- Normalized legacy Logics cross-references so the blocking release CI workflow stays aligned with the current request/backlog/task graph.
- Updated the internal dungeon balance simulator version baseline to match the current app version.
- Polished wiki and onboarding panel flows after implementation based on desktop feedback.

## Validation

- `npm run ci:local`
- `npm run release:changelog:validate`
