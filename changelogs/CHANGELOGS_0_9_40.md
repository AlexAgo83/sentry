# Changelog (`0.9.39 -> 0.9.40`)

## Major Highlights

- Added an internal dungeon balance simulator so dungeon difficulty can be diagnosed and tuned against reference parties instead of relying only on anecdotal runs.
- Introduced the first account-wide meta progression layer and lightweight value/readiness cues across action, quest, and dungeon surfaces.
- Hardened the release/tooling pipeline with curated changelog-driven GitHub releases, Logics metadata normalization, and a fully green local CI mirror including audit cleanup.

## Version 0.9.40

### Gameplay and balancing

- Added a real dungeon balance simulator backed by the actual runtime combat/lifecycle path, with canonical presets and tuning-friendly reports.
- Improved gameplay decision clarity with value cues on recipes and dungeons, readiness chips, and cleaner action summaries.
- Refined the hero `ACTION` and `QUESTS` surfaces after implementation with follow-up UI polish on focus cues, milestone layout, and offline recap preview behavior.

### Meta progression

- Added the first roster/account-wide milestone layer with unlock-driven rewards rather than pure flat multipliers.
- Surfaced milestone progress directly in the quests screen and wired early meta effects into the relevant UI flows.

### Release, quality, and project hygiene

- GitHub releases now consume curated versioned changelogs from `changelogs/` when available instead of relying only on generated notes.
- Normalized legacy Logics metadata and architecture docs to the new kit contract so strict status linting stays reliable.
- Cleared remaining npm audit findings and refreshed affected tests so the repository is back to `0` reported vulnerabilities.
- Updated the embedded Logics kit submodule and aligned new planning streams for the next open work:
  - game wiki,
  - onboarding guidance,
  - residual cloud/security hardening,
  - cloud orchestration modularization.

## Validation

- `npm run ci:local`
- `npm run release:changelog:validate`
