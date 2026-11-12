## task_072_dungeon_completion_counter_ui - Show completion badges
> From version: 0.9.9
> Owner: —
> Status: Done
> Non-semantic edit: Add the missing legacy closure checklist for operator cleanup 2026-11-12.
> Understanding: 95%
> Confidence: 90%
> Progress: 100%

# Summary
Display `xN` completion badges in the dungeon selection list and run/replay views.

# Dependencies
- item_086_dungeon_completion_counter_ui
- task_071_dungeon_completion_counter_state

# Steps
1. Add `xN` badge in dungeon selection cell UI.
2. Add `xN` badge near dungeon meta row in run/replay view.
3. Hide badge when count is 0.
4. Style using existing dungeon pill styles.

# Decisions
- Selection badge: right-aligned within the dungeon cell.
- Run/replay badge: placed in the meta row next to the Dungeon pill.
- Badge uses `xN` with a small star icon prefix.

# Acceptance criteria
- Selection list shows badge for dungeons with count > 0.
- Run/replay view shows badge for the active dungeon when count > 0.

# Definition of Done (DoD)
- [x] Historical `Done` status retained; no further work is planned (operator decision 2026-11-12).

Legacy metadata migration only: this records the existing terminal state, not a retrospective assessment of delivery criteria. Original scope, validation evidence, and completion reports remain authoritative.
