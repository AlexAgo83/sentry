## item_224_req067_add_dungeon_readiness_and_risk_reward_value_cues - req067 add dungeon readiness and risk/reward value cues
> From version: 0.9.39
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: UX / Dungeon / Decision support
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Dungeon selection is one of the highest-cost decisions in the game, yet readiness and risk/reward remain harder to read than they should be. This is the first surface that should receive systematic value cues.

# Scope
- In:
- Add lightweight dungeon-facing cues such as:
  - readiness bands,
  - risk labels,
  - expected progression/reward hints,
  - clearer distinction between safe, close, and punishing choices.
- Reuse the shared value-cue contract rather than inventing one-off UI logic.
- Out:
- No dungeon balance changes in this item.
- No full dungeon screen redesign.

# Acceptance criteria
- Dungeon setup/selection surfaces communicate readiness and risk/reward more clearly.
- The cues remain lightweight and readable.
- The implementation stays consistent with shared value-cue helpers.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_067_improve_gameplay_choice_clarity_with_lightweight_systematic_value_cues.md`.
- Likely touch points:
  - `src/app/components/dungeon*`
  - `src/app/selectors/choiceValueCues.ts`
  - `tests/app/*dungeon*`
