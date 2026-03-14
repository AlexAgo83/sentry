## item_239_req026_add_wiki_route_settings_entry_and_section_entry_state_model - req026 add wiki route, settings entry, and section/entry state model
> From version: 0.9.40
> Status: Done
> Understanding: 100%
> Confidence: 100%
> Progress: 100%
> Complexity: Medium
> Theme: Navigation / Routing / UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The wiki needs a clean, canonical access path. Without a dedicated route and a stable section/entry state model, the wiki would feel bolted on and later deep-linking or restoration would become inconsistent.

# Scope
- In:
- Add the canonical wiki route at `/wiki`.
- Add the `Wiki` entry point from Settings.
- Define the section/entry selection state model for the wiki surface.
- Support lightweight route-addressable restoration when practical:
  - section hint
  - selected entry hint
- Keep `/wiki` as the single canonical v1 surface.
- Out:
- No complete content rendering in this item.
- No contextual deep links from the rest of the app beyond Settings.

# Acceptance criteria
- Players can access the wiki from Settings.
- Navigating to `/wiki` renders the wiki shell.
- The route can preserve or restore the active section and, when feasible, a selected entry.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_026_game_wiki.md`.
- Likely touch points:
  - `src/app/routes*`
  - `src/app/components/Settings*`
  - `src/app/App*`
  - wiki screen/container state helpers
