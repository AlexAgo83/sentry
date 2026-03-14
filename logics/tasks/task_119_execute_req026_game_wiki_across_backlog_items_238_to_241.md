## task_119_execute_req026_game_wiki_across_backlog_items_238_to_241 - Execute req026 game wiki across backlog items 238 to 241
> From version: 0.9.40
> Status: Ready
> Understanding: 97%
> Confidence: 94%
> Progress: 0%
> Complexity: High
> Theme: UX / Navigation / Data-driven reference surface
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_238_req026_define_wiki_entry_contracts_and_data_driven_mapping_layer.md`
- `logics/backlog/item_239_req026_add_wiki_route_settings_entry_and_section_entry_state_model.md`
- `logics/backlog/item_240_req026_build_mobile_ready_list_detail_wiki_ui_for_core_sections.md`
- `logics/backlog/item_241_req026_add_wiki_regression_coverage_for_routing_mapping_and_responsive_navigation.md`

Request reference:
- `logics/request/req_026_game_wiki.md`

This task delivers the first in-game wiki as a canonical `/wiki` surface reachable from Settings. The implementation must stay data-driven, mobile-ready, and scoped to quick player lookup rather than long-form documentation tooling.

# Decisions (v1)
- The wiki is a player-facing in-game reference, not technical documentation.
- `/wiki` is the single canonical v1 surface.
- The first sections are:
  - `skills`
  - `recipes`
  - `items/equipment`
  - `dungeons`
- The layout should be `list + detail`, not long encyclopedia scrolling.
- Stable factual content must come from game data / selectors, not duplicated UI strings.
- Recipes remain grouped by skill.
- Items/equipment stay in one shared section with filters.
- Dungeons communicate reward / loot identity without exhaustive loot probability dumps.
- No full-text search or contextual deep links in v1.

# Architecture summary
- A wiki mapping layer derives normalized wiki entries from existing game data and small editorial-copy hooks.
- A route/state layer owns:
  - `/wiki`
  - Settings entry
  - section/entry restoration behavior
- A wiki UI layer renders:
  - section switcher
  - lightweight filters
  - entry list
  - detail panel
- Regression coverage protects mapping, navigation, and responsive usage.

# Plan
- [ ] 1. Execute `item_238` (wiki contracts and mapping layer):
  - Define normalized entry/view-model contracts.
  - Derive factual content from game data and controlled helper mappings.
- [ ] 2. Execute `item_239` (route and Settings access):
  - Add `/wiki`.
  - Add the Settings entry point.
  - Wire section/entry route state where practical.
- [ ] 3. Execute `item_240` (wiki UI):
  - Build the mobile-ready `list + detail` surface.
  - Ship the four v1 sections with the agreed organization rules.
- [ ] 4. Execute `item_241` (regression coverage):
  - Add tests for mapping, access, and responsive navigation.
  - Ensure the surface remains data-driven and navigable.
- [ ] FINAL: Update related Logics docs (request/backlog/task alignment)

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`
- `npm run test:e2e`
