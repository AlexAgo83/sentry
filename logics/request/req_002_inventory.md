## req_002_inventory - Inventory
> From version: 0.3.1
> Understanding: 93%
> Confidence: 89%
> Status: Done
> Non-semantic edit: Add the missing legacy closure checklist for operator cleanup 2026-11-12.

# Needs
1. Add a global inventory shared across all players.
2. Add an inventory side panel (same layout style as Action status), opened via a button under "recruit new hero".
3. Introduce stackable items with no limits & svg asset; start with Hunting producing meat and Cooking consuming meat to produce food.
4. If required items are missing, the skill cannot start (stop the action).
5. Inventory changes must be saved in the same save schema and included in the offline recap.
6. Gold becomes global to the account, not per player.

# Notes
- Items are base-only for now (no quality/rarity).
- Scope for v1 is limited to Hunting/Cooking production/consumption.

# Context
Historical request closed as Done. The documented needs and linked delivery remain the reference; no additional work is planned after operator cleanup 2026-11-12.

# Backlog
- `logics/backlog/item_005_inventory.md`

# Definition of Ready (DoR)
- [x] Historical `Done` status retained; no further work is planned (operator decision 2026-11-12).

Legacy metadata migration only: this records the existing terminal state, not a retrospective assessment of delivery criteria. Original scope, validation evidence, and completion reports remain authoritative.
