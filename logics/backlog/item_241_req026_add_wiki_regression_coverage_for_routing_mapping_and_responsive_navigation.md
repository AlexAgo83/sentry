## item_241_req026_add_wiki_regression_coverage_for_routing_mapping_and_responsive_navigation - req026 add wiki regression coverage for routing, mapping, and responsive navigation
> From version: 0.9.40
> Status: Ready
> Understanding: 94%
> Confidence: 92%
> Progress: 0%
> Complexity: Medium
> Theme: Testing / Regression coverage
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The wiki will span routing, derived data mapping, and a responsive information-heavy surface. Without targeted regression coverage, future gameplay or UI changes could silently desynchronize the wiki from the game or break navigation.

# Scope
- In:
- Add regression coverage for:
  - wiki entry mapping / selector logic,
  - route and Settings access,
  - section/entry restoration behavior when supported,
  - core desktop/mobile navigation flows for the wiki UI.
- Validate that factual content stays data-driven for representative entries in each v1 section.
- Out:
- No snapshot-heavy visual testing strategy.
- No exhaustive coverage of every single wiki entry.

# Acceptance criteria
- The wiki mapping layer has targeted tests.
- Route/Settings access is covered.
- Responsive navigation behavior is covered at the most important flow level.
- The tests are strong enough to catch contract drift between game data and wiki output.

# Priority
- Impact: Medium
- Urgency: High

# Notes
- Derived from `logics/request/req_026_game_wiki.md`.
- Likely touch points:
  - `tests/app/**`
  - `tests/app/selectors/**`
  - `tests/e2e/**` or focused integration tests if needed
