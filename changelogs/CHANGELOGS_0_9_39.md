# Changelog (`0.9.38 -> 0.9.39`)

## Major Highlights

- Reworked startup and imported-save bootstrap flows so offline catch-up uses a shared loading pipeline with stronger persistence guarantees.
- Improved gameplay readability with away-duration context on the startup splash, reward scaling for higher-tier recipes and dungeons, and a contextual dungeon summary on the hero action screen.
- Strengthened repository quality gates with explicit test lanes, timeout governance, save/bootstrap compatibility coverage, and a real `npm run ci:local` mirror of the blocking GitHub Actions workflow.

## Version 0.9.39

### Save bootstrap and loading flow

- Startup offline catch-up is now atomic: partial startup progress is no longer persisted during bootstrap, and persistence resumes only after a successful final commit.
- Local import and cloud load now reuse the same bootstrap/loading surface as startup, including shared progress handling and aligned bootstrap origin metadata.
- The startup splash now shows the away duration so the player can immediately understand how much offline time is being simulated.

### Progression and UX

- Higher-tier recipes and dungeons now provide clearer progression value through explicit reward scaling instead of flat progression incentives.
- Action and recipe selection surfaces expose reward cues more clearly so players can understand why advanced content is worth using.
- The hero `ACTION` screen now shows a dungeon summary when the standard action summary is hidden because the hero is in combat.

### Testing and CI

- Added explicit Vitest lane governance, timeout policy enforcement, and a dedicated save/bootstrap compatibility suite.
- Introduced `npm run ci:local:fast` and `npm run ci:local` so the blocking GitHub Actions workflow can be reproduced locally with the same contracts.
- GitHub Actions now delegates its blocking validation path to the local CI mirror entry point.
- Stabilized Playwright smoke coverage around cloud-save flows and startup prompts.
- Removed the recurring Playwright `NO_COLOR` / `FORCE_COLOR` warning from repository `test:e2e` runs by normalizing the Playwright launcher environment.

### Logics and project hygiene

- Brought the related Logics request/backlog/task artifacts in line with delivered work, including request status updates and request auto-closure sync for older completed slices.

## Validation

- `npm run ci:local`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `python3 logics/skills/logics-flow-manager/scripts/logics_flow.py sync close-eligible-requests`
