## item_223_req067_define_shared_choice_value_view_models_and_formatting_helpers - req067 define shared choice-value view-models and formatting helpers
> From version: 0.9.39
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: UX / Architecture / Selectors
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Choice clarity will become inconsistent if each screen invents its own reward/risk/readiness language. The project needs shared view-models and formatting helpers so value cues stay coherent and remain grounded in real data.

# Scope
- In:
- Define shared derived models/helpers for presenting:
  - readiness bands,
  - expected gains,
  - lightweight risk/reward cues,
  - progression-fit indicators.
- Keep them reusable across gameplay surfaces.
- Out:
- No end-user UI rollout in this item.

# Acceptance criteria
- Shared value-cue view-models and helpers exist for the main cue types.
- The contract is lightweight enough to reuse across multiple screens.
- Presentation logic remains grounded in real runtime/data values.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_067_improve_gameplay_choice_clarity_with_lightweight_systematic_value_cues.md`.
- Likely touch points:
  - `src/app/selectors/choiceValueCues.ts`
  - `src/app/components/*`
  - `tests/app/selectors/*`
