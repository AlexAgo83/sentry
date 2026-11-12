## task_062_dungeon_taunt_targeting_rules - Dungeon taunt + targeting rules
> From version: 0.9.8
> Status: Done
> Non-semantic edit: Add the missing legacy closure checklist for operator cleanup 2026-11-12.
> Understanding: 95%
> Confidence: 93%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Context
Derived from `logics/backlog/item_076_dungeon_taunt_targeting_rules.md`

# Decisions
- Taunt source: simple v1 flag on party member state.
- Taunt duration: `TAUNT_DURATION_MS = 2500`.
- Bosses always respect taunt.

# Plan
- [x] 1. Add taunt fields (bonus + duration) and integrate with threat model.
- [x] 2. Implement stickiness thresholds (normal vs boss) and boss taunt enforcement.
- [x] 3. Add/adjust tests for taunt selection and boss stickiness.
- [x] FINAL: Update related Logics docs

# Validation
- npm run tests
- npm run lint

# Report
- Added taunt fields, boss stickiness rules, and tests for taunt-targeted selection.

# Definition of Done (DoD)
- [x] Historical `Done` status retained; no further work is planned (operator decision 2026-11-12).

Legacy metadata migration only: this records the existing terminal state, not a retrospective assessment of delivery criteria. Original scope, validation evidence, and completion reports remain authoritative.
