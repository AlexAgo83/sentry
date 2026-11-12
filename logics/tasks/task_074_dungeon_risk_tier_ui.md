## task_074_dungeon_risk_tier_ui - Display risk tiers in dungeon selection
> From version: 0.9.10
> Owner: —
> Status: Done
> Non-semantic edit: Add the missing legacy closure checklist for operator cleanup 2026-11-12.
> Understanding: 95%
> Confidence: 93%
> Progress: 100%

# Summary
Show the risk tier label in each dungeon selection cell with compact styling.

# Dependencies
- item_088_dungeon_risk_tier_ui
- task_073_dungeon_risk_tier_model

# Steps
1. Render `Risk: <Tier>` in the dungeon selection cell.
2. Apply tier color accents (green/yellow/orange/red).
3. Add a subtle desktop tooltip: `Based on current party power`.
4. Ensure the label does not wrap on desktop and remains readable on mobile.

# Decisions
- Label format: `Risk: <Tier>`.
- Display only in the selection cell (v1).
- Colors: Low=green, Medium=yellow, High=orange, Deadly=red.

# Acceptance criteria
- Dungeon selection shows the correct tier label.
- Label updates when power changes.
- Tooltip appears on desktop hover only.

# Definition of Done (DoD)
- [x] Historical `Done` status retained; no further work is planned (operator decision 2026-11-12).

Legacy metadata migration only: this records the existing terminal state, not a retrospective assessment of delivery criteria. Original scope, validation evidence, and completion reports remain authoritative.
