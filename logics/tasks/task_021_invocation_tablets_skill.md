## task_021_invocation_tablets_skill - Invocation Tablets skill
> From version: 0.8.10
> Status: Done
> Non-semantic edit: Add the missing legacy closure checklist for operator cleanup 2026-11-12.
> Understanding: 90%
> Confidence: 90%
> Progress: 100%

# Context
Derived from `logics/backlog/item_019_invocation_tablets_skill.md`.

# Plan
- [x] 1. Add Invocation skill to core definitions (types, skill list, skill color/icon).
- [x] 2. Add Invocation Tablet item (equipment definition + inventory metadata + icon mapping).
- [x] 3. Add recipe definition and wire it to the Invocation skill.
- [x] 4. Ensure selection/equipment/inventory UI surfaces the new skill/item correctly.
- [x] 5. Add/adjust tests for skill list, recipes, and inventory/equipment visibility.
- [x] FINAL: Update progress + confirm acceptance criteria.

# Validation
- npm run tests
- npm run lint
- npm run typecheck

# Report
1. Added Invocation skill (types, definitions, icon, and color) and mapped it to Intellect-based XP scaling.
2. Added Invocation Tablet as an equippable Amulet item with inventory metadata.
3. Expanded Invocation to 10 named recipes with descriptions and scaling costs/rewards.
4. Confirmed lint, typecheck, and test suite all pass.

# Notes

# Definition of Done (DoD)
- [x] Historical `Done` status retained; no further work is planned (operator decision 2026-11-12).

Legacy metadata migration only: this records the existing terminal state, not a retrospective assessment of delivery criteria. Original scope, validation evidence, and completion reports remain authoritative.
