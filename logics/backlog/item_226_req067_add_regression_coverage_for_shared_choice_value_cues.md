## item_226_req067_add_regression_coverage_for_shared_choice_value_cues - req067 add regression coverage for shared choice value cues
> From version: 0.9.39
> Understanding: 95%
> Confidence: 93%
> Progress: 0%
> Complexity: Medium
> Theme: UX / Quality / Regression coverage
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Choice-value communication will regress easily if shared helpers and key decision surfaces are not covered by tests. The repo needs regression coverage to keep these cues coherent over time.

# Scope
- In:
- Add tests for shared value-cue derivation and key rendered surfaces.
- Validate that dungeon and action/recipe cues appear when expected and remain lightweight.
- Out:
- No additional UI features in this item.

# Acceptance criteria
- Shared cue derivation has regression coverage.
- Key dungeon and action/recipe surfaces are covered by rendering tests.
- The choice-clarity system can evolve without silent drift.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_067_improve_gameplay_choice_clarity_with_lightweight_systematic_value_cues.md`.
- Likely touch points:
  - `tests/app/*`
  - `tests/*selectors*`

