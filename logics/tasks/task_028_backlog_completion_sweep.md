## task_028_backlog_completion_sweep - Complete remaining backlog items
> From version: 0.8.14
> Status: Done
> Understanding: 100%
> Confidence: 75%
> Progress: 100%

# Context
Sweep task to complete all backlog items that are not yet at 100%.

# Targets (not 100%)
- None.

# Plan
- [x] 1. Finish item_024: finalize docs + remaining validations if needed.
- [x] 2. Finish item_025: finalize docs + remaining validations if needed.
- [x] 3. Implement item_027: compact formatter applied everywhere (shop, sell, summaries, cloud meta).
- [x] 4. Implement item_028: action bonus tooltips + stun time line.
- [x] 5. Implement item_029: sell all + unit value.
- [x] 6. Implement item_030: last sync + visual diff in cloud panel.
- [x] 7. Implement item_031: “New” badges on menus/items with localStorage tracking.
- [x] 8. Implement item_032: memoized selectors + shallow equality where relevant.
- [x] FINAL: Update related Logics docs and backlog progress to 100%.

# Test plan
- Unit/UI tests for affected panels (Action, Inventory, Cloud, Shop).
- Run full suite: npm run tests, npm run lint, npm run typecheck.

# Risks & rollback
- Risk: UI regressions in core panels. Rollback by feature flag or reverting individual changes.

# Validation
- npm run tests
- npm run lint

# Report
- 

# Notes
- Derived from `logics/backlog/item_024_cloud_save_backend_and_conflict_ui.md`.
- Derived from `logics/backlog/item_025_db_dump_and_reset_utilities.md`.
- Derived from `logics/backlog/item_027_compact_number_formatting.md`.
- Derived from `logics/backlog/item_028_action_bonus_tooltips_and_stun_time.md`.
- Derived from `logics/backlog/item_029_inventory_sell_all_and_unit_value.md`.
- Derived from `logics/backlog/item_030_cloud_last_sync_and_meta_diff.md`.
- Derived from `logics/backlog/item_031_new_badges_for_menus_and_items.md`.
- Derived from `logics/backlog/item_032_selector_memoization_pass.md`.
