## item_238_req026_define_wiki_entry_contracts_and_data_driven_mapping_layer - req026 define wiki entry contracts and data-driven mapping layer
> From version: 0.9.40
> Status: Ready
> Understanding: 96%
> Confidence: 93%
> Progress: 0%
> Complexity: High
> Theme: Architecture / Data / Selectors
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The wiki request should not become a hand-written static page that drifts away from the game data. The project first needs a normalized wiki entry contract and a mapping layer that derives factual content from existing definitions.

# Scope
- In:
- Define normalized `WikiEntry`-style contracts for the initial sections:
  - `skills`
  - `recipes`
  - `items/equipment`
  - `dungeons`
- Build a data-driven mapping layer that transforms existing game definitions into those entries.
- Support:
  - progression-aware ordering metadata,
  - unlocked/locked visibility markers,
  - simple provenance / reward identity labels,
  - optional short editorial copy hooks keyed by entity id.
- Out:
- No route or Settings entry in this item.
- No final wiki UI surface in this item.

# Acceptance criteria
- The repo has a clear wiki entry contract that can back all four v1 sections.
- Stable factual values are derived from existing data/definitions rather than duplicated in UI code.
- The mapping layer is extensible enough to support later sections without redesigning the contract.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_026_game_wiki.md`.
- Likely touch points:
  - `src/data/**`
  - `src/app/selectors/**`
  - `src/core/**`
  - optional editorial copy map file
