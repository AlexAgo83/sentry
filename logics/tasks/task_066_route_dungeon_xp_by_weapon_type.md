## task_066_route_dungeon_xp_by_weapon_type - Route dungeon XP by weapon type
> From version: 0.9.9
> Status: Done
> Non-semantic edit: Add the missing legacy closure checklist for operator cleanup 2026-11-12.
> Understanding: 97%
> Confidence: 94%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Context
Derived from `logics/backlog/item_080_route_dungeon_xp_by_weapon_type.md`

# Decisions
- Weapon type is the sole XP router.
- Missing weapon defaults to Melee.
- If weapon changes mid-run, XP routing updates immediately.

# Plan
- [ ] 1. Update dungeon combat XP routing in `src/core/dungeon.ts` to select the weapon-type skill.
- [ ] 2. Ensure offline/replay determinism with the new routing.
- [ ] 3. Update tests for XP attribution.
- [ ] FINAL: Update related Logics docs

# Validation
- npm run tests
- npm run lint

# Report
- Routed dungeon combat XP to the weapon-type combat skill, with immediate updates on weapon changes.
- Updated offline/replay aggregation to track combat XP by skill deterministically.

# Definition of Done (DoD)
- [x] Historical `Done` status retained; no further work is planned (operator decision 2026-11-12).

Legacy metadata migration only: this records the existing terminal state, not a retrospective assessment of delivery criteria. Original scope, validation evidence, and completion reports remain authoritative.
