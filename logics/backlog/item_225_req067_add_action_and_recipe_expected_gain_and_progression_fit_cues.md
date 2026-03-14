## item_225_req067_add_action_and_recipe_expected_gain_and_progression_fit_cues - req067 add action and recipe expected-gain and progression-fit cues
> From version: 0.9.39
> Understanding: 100%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: UX / Actions / Recipes
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Actions and recipes are frequent choices, but they still need clearer signals for why one option is a better next step than another. The game should expose expected gains and progression fit without turning these surfaces into noisy dashboards.

# Scope
- In:
- Add lightweight value cues on action/recipe decision surfaces, such as:
  - expected progression payoff,
  - reward hints,
  - progression-fit or “good next step” signals.
- Keep the presentation compact and consistent with the shared cue contract.
- Out:
- No broad rework of every hero/status panel in this item.

# Acceptance criteria
- Action and recipe choice surfaces communicate expected value more clearly.
- The cues remain lightweight and understandable.
- Presentation stays consistent with the shared value-cue system.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_067_improve_gameplay_choice_clarity_with_lightweight_systematic_value_cues.md`.
- Likely touch points:
  - `src/app/components/*Action*`
  - `src/app/selectors/choiceValueCues.ts`
  - `tests/app/*action*`
