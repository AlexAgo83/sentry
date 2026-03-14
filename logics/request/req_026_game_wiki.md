## req_026_game_wiki - In-game wiki at /wiki
> From version: 0.9.40
> Status: Done
> Understanding: 100%
> Confidence: 100%

# Needs
- Add an in-game wiki accessible at `/wiki`.
- Add a `Wiki` button in `Settings` that navigates to `/wiki`.

# Context
- Players need a quick reference for gameplay rules and systems without leaving the game.
- The wiki should be available from the Settings screen as an entry point.

# Goals
- Provide a lightweight, readable in-game wiki page.
- Keep navigation clear and consistent with existing UI patterns.
- Help players answer common gameplay questions without leaving the game.
- Prefer a data-driven reference over a fully manual editorial wiki.

# Locked decisions (v1)
- Route: `/wiki`.
- Entry point: Settings screen button labeled `Wiki`.
- Audience: player-facing in-game help, not technical documentation.
- Scope: `skills`, `recipes`, `items/equipment`, and `dungeons`.
- Source of truth: derive factual values from existing game data/definitions, with short editorial copy only where raw data is not enough.
- Visibility: keep v1 fully readable without discovery gating.
- Information policy: show exact values when they are stable and trustworthy; otherwise prefer short descriptive text.
- Interaction model: read-only reference surface in v1, with simple section navigation/filtering rather than search-heavy knowledge tooling.
- Layout model: `list + detail` rather than long encyclopedia-style scrolling.
- Recipe organization: group recipes by skill in the wiki rather than flattening every recipe into one undifferentiated list.
- Item organization: keep a single `items/equipment` section in v1, but support lightweight filtering for `materials`, `consumables`, and `gear`.
- Dungeon presentation: show tier, boss, reward identity, and high-level loot identity, but not exhaustive full loot-table probability dumps in v1.
- Search: no free-text search in v1; use sections, grouping, and lightweight filters instead.
- Context links: do not add deep contextual wiki entry points from the rest of the game in the first version.
- Tone: primarily functional and reference-oriented, with only light editorial flavor text.
- Responsiveness: mobile-ready in v1, not desktop-only.
- Entry detail depth: use lightweight but meaningful detail panels rather than extremely terse cards or long encyclopedia pages.
- Visibility policy: include both unlocked and not-yet-unlocked entries in v1 so the wiki also supports forward planning.
- Item provenance: show simple acquisition context when confidently known (for example crafted, dungeon drop, boss reward, common loot source).
- Dungeon readiness: do not surface party-specific readiness calculations inside the wiki; keep the wiki as a static reference, and leave contextual readiness to the dungeon setup screen.
- Sorting: prefer progression order where it helps the player, and alphabetical order where progression order is not meaningful.
- Section guidance: each section may have a very short overview/helper line explaining how to read the entries.
- URL model: support section/entry-addressable state if reasonably cheap, so the route can reopen on a specific section or entity.
- Localization posture: structure the editorial copy so future localization is possible, but English-only content is acceptable in v1.
- Canonical surface: treat `/wiki` as the single canonical wiki surface in v1.

# Scope detail (v1)
- UI:
  - Add a Settings row/button leading to `/wiki`.
  - Create a dedicated Wiki screen/page.
  - Keep the visual language aligned with the game UI rather than a generic documentation page.
  - Use a `list + detail` presentation:
    - section switcher / filters / entry list
    - focused detail panel for the selected entry
  - Keep entry panels rich enough to answer practical player questions without turning them into long documentation articles.
- Content:
  - Skills:
    - what the skill does
    - notable unlock/value cues
    - linked recipes/actions where relevant
  - Recipes:
    - inputs, outputs, reward tier/value orientation, and unlock context
    - organize entries under their parent skill
  - Items / equipment:
    - category, use, likely acquisition context, and important effects
    - keep one shared section with filters rather than splitting into separate pages in v1
    - show simple provenance / acquisition context when confidently known
  - Dungeons:
    - tier, boss, loot identity, and high-level difficulty/reward framing
    - avoid exhaustive loot-table dumps in v1
    - do not include dynamic party readiness calculations
  - Keep the first version read-only.
- Navigation:
  - Provide a simple section switcher and lightweight filters/anchors.
  - Optimize for quick lookup rather than long-form scrolling only.
  - Do not add full-text search in v1.
  - Support section/entry-addressable state when practical.

# Architecture direction
- Do not implement the wiki as a large hand-written static page.
- Build the wiki as a dedicated route-backed surface with three layers:
  - data sources:
    - existing game definitions in `src/data/**`
    - stable domain helpers/selectors for computed labels or relationships where raw data is not directly presentable
  - wiki view-model layer:
    - map raw game data into normalized wiki entries per section
    - keep factual values derived from the game data instead of duplicated in UI code
    - allow a small editorial copy layer for short descriptions that data alone cannot express cleanly
- wiki UI layer:
    - section navigation
    - lightweight filters/anchors
    - responsive entry list/detail panels aligned with the game UI
- Prefer normalized `WikiEntry`-style models over section-specific ad hoc rendering logic in page components.
- Keep v1 read-only and deterministic; avoid CMS-like authoring, markdown pipelines, or advanced search indexing.
- Keep the design extensible so later sections such as `resources`, `status effects`, or `meta progression` can be added without reworking the route structure.
- Do not assume future top-nav promotion; v1 should work well as a Settings-entry destination first.
- Design the view-models so unlocked state, progression ordering, provenance labels, and short editorial intros can be layered without duplicating source data.

# Technical references to update
- `src/app/routes`
- `src/app/components/Settings*`
- `src/app/screens` or `src/app/components` (new Wiki screen)
- `src/app/containers` (if needed for routing)
- `src/data/**`
- shared selector / formatter helpers if data needs shaping for presentation
- optional short-form editorial copy map keyed by section/entity identifiers

# Acceptance criteria
- Navigating to `/wiki` shows the wiki screen.
- Settings includes a `Wiki` button that opens `/wiki`.
- Wiki v1 covers `skills`, `recipes`, `items/equipment`, and `dungeons`.
- Content pulls its stable factual data from the existing game definitions instead of duplicating values manually in UI code.
- Wiki content is readable on desktop and mobile.
- The page is useful as an in-game reference without requiring external docs.
- Recipes are grouped by skill.
- Items and equipment are filterable within a shared section.
- Dungeons communicate reward identity without requiring raw full loot-table dumps.
- Locked and unlocked entries can both be browsed in v1.
- Each section can explain itself briefly without requiring separate documentation pages.
- Opening `/wiki` with a section/entry hint can restore the intended subsection when the route supports it.

# Risks / open points
- Whether to expose every raw number or keep some advanced formulas out of the first iteration.
- Localization is still open; English-only is acceptable for v1 if needed.
- Whether later versions should add contextual “Learn more” links from item / dungeon / skill surfaces after the core wiki route proves useful.

# Backlog
- `logics/backlog/item_238_req026_define_wiki_entry_contracts_and_data_driven_mapping_layer.md`
- `logics/backlog/item_239_req026_add_wiki_route_settings_entry_and_section_entry_state_model.md`
- `logics/backlog/item_240_req026_build_mobile_ready_list_detail_wiki_ui_for_core_sections.md`
- `logics/backlog/item_241_req026_add_wiki_regression_coverage_for_routing_mapping_and_responsive_navigation.md`

# Task
- `logics/tasks/task_119_execute_req026_game_wiki_across_backlog_items_238_to_241.md`
