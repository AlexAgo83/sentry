## item_240_req026_build_mobile_ready_list_detail_wiki_ui_for_core_sections - req026 build mobile-ready list/detail wiki UI for core sections
> From version: 0.9.40
> Status: Done
> Understanding: 100%
> Confidence: 100%
> Progress: 100%
> Complexity: High
> Theme: UI / UX / Information architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even with good data contracts, the wiki will fail if the UI behaves like a generic documentation dump. The first shipped surface must support quick lookup through a clear list/detail layout that works on both desktop and mobile.

# Scope
- In:
- Build the dedicated wiki screen with:
  - section switcher,
  - lightweight filters,
  - progression-aware entry listing,
  - detail panels rich enough to answer common player questions.
- Cover the v1 sections:
  - `skills`
  - `recipes` grouped by skill
  - `items/equipment` with shared-section filters
  - `dungeons` with reward / loot identity
- Add short section-level helper text where useful.
- Keep the visual language aligned with the game UI.
- Out:
- No free-text search in this item.
- No deep contextual “Learn more” links from the rest of the app.

# Acceptance criteria
- The wiki uses a `list + detail` layout instead of long encyclopedia-style scrolling.
- Recipes are grouped by skill.
- Items/equipment are filterable in a shared section.
- Dungeons communicate reward identity without needing raw loot-table dumps.
- The surface is readable and usable on desktop and mobile.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_026_game_wiki.md`.
- Likely touch points:
  - new wiki screen/components
  - shared wiki styles
  - view-model selectors from `item_238`
