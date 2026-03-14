## item_221_req066_ship_initial_meta_progression_ui_and_goal_communication_surfaces - req066 ship initial meta progression UI and goal communication surfaces
> From version: 0.9.39
> Understanding: 94%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: Progression / UI / UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Long-term progression only helps retention if the player can see and understand it. Without clear surfaces for current goals, progress, and unlocked rewards, a new meta layer would remain too abstract to drive return motivation.

# Scope
- In:
- Add an initial UI surface or surfaces that communicate:
  - active milestones,
  - progress toward them,
  - unlocked rewards or benefits.
- Keep the UI directed and legible.
- Out:
- No giant progression hub redesign in this item.
- No advanced recurring/s seasonal systems.

# Acceptance criteria
- Players can understand what longer-term goals they are progressing toward.
- Meta progression benefits are visible enough to feel meaningful.
- The UI remains coherent with the existing app structure.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_066_add_long_term_meta_progression_and_return_drivers_across_sessions.md`.
- Likely touch points:
  - `src/app/components/*`
  - `src/app/selectors/*`
  - `tests/app/*`
- Delivered via:
  - `src/app/components/QuestsPanel.tsx`
  - `src/app/containers/QuestsPanelContainer.tsx`
  - `src/app/components/ShopPanel.tsx`
  - `src/app/containers/ShopPanelContainer.tsx`
  - `src/app/containers/RosterContainer.tsx`
