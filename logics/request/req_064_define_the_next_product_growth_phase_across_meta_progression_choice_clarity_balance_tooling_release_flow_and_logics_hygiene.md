## req_064_define_the_next_product_growth_phase_across_meta_progression_choice_clarity_balance_tooling_release_flow_and_logics_hygiene - Define the next product growth phase across meta progression, choice clarity, balance tooling, release flow, and Logics hygiene
> From version: 0.9.40
> Understanding: 100%
> Confidence: 99%
> Complexity: High
> Theme: Product / Gameplay / Tooling / Release / Operations
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.
> Status: Done

# Needs
- The project has become meaningfully stronger on runtime safety, offline bootstrap flow, UI context, and CI governance.
- The next highest-value work is no longer just “more features”; it is about making the game more compelling to return to, easier to reason about, safer to balance, and easier to operate/release.
- Several improvement tracks now exist in parallel:
  - stronger long-term player goals,
  - clearer moment-to-moment decision value,
  - better internal balancing tooling,
  - a more intentional release/changelog flow,
  - cleanup of remaining Logics metadata debt.

# Context
- Recent delivered work improved:
  - startup/import/bootstrap safety,
  - reward scaling,
  - dungeon/action contextual UX,
  - test governance and CI reproducibility,
  - changelog generation as a project artifact.
- However, the project still has structural growth gaps:
  - the game loop could use stronger long-term motivation beyond short-term activity selection,
  - some gameplay choices remain too opaque from a player point of view,
  - balancing still relies mainly on manual reasoning instead of explicit simulation/reporting support,
  - GitHub release generation is still only loosely connected to the maintained changelog artifacts,
  - Logics docs still contain a large amount of legacy metadata drift (notably missing `Status` indicators in older tasks/backlog docs).
- These gaps do not all belong to the same technical layer, but they form a coherent next-phase initiative: make the project stronger as a game and as a maintained product.

# Goals
- Define the next growth phase of the project as a deliberate multi-track initiative instead of a collection of disconnected tweaks.
- Improve the game’s return motivation with stronger long-term progression goals and player-facing objectives.
- Make gameplay decisions more legible so players can understand why one action, recipe, or dungeon is worth choosing over another.
- Introduce safer balancing support through explicit tooling and repeatable diagnostics rather than ad hoc manual tuning only.
- Improve the release pipeline so maintained changelog artifacts can drive or support release communication more directly.
- Reduce operational ambiguity in Logics docs so workflow/CI behavior becomes more predictable and less sensitive to legacy drift.

# Non-goals
- Delivering all of these tracks in one implementation pass.
- Rewriting the entire game loop or replacing the existing Logics workflow system.
- Turning the project into a fully live-operated analytics-heavy service.
- Forcing one monolithic UI redesign for all existing screens.

# Locked decisions (v1)
## Treat this as a roadmap request, not a single code patch
- This request defines the next phase of product and engineering evolution.
- It is expected to branch into multiple backlog streams rather than one narrow implementation task.

## Prioritize player value and operational leverage together
- The next phase should not be split into “gameplay work later” and “tooling work now” as unrelated concerns.
- Player-facing motivation, design clarity, balance confidence, and release quality all contribute to the same outcome: a healthier product.

## Favor explicit systems over invisible heuristics
- If advanced content is better, the player should be able to perceive why.
- If a balance claim is made internally, tooling should help verify it.
- If a release artifact exists, the release workflow should be able to consume it intentionally.
- If Logics docs are part of CI and process, their metadata should be normalized instead of remaining half-legacy indefinitely.

# Scope detail (draft)
## A. Meta progression and long-term motivation
- Identify and define one or more longer-horizon player goals that create reasons to come back across sessions.
- Candidate directions include:
  - progression milestones,
  - collection/discovery goals,
  - dungeon progression ladders,
  - build or role specialization,
  - recurring challenge layers.
- The resulting design should reinforce session-to-session purpose rather than only immediate loop efficiency.

## B. Choice clarity and gameplay readability
- Improve how the game communicates the value of available choices:
  - expected XP/resource/loot value,
  - safety vs. risk,
  - progression relevance,
  - why higher-tier content matters.
- Preference should be given to lightweight, context-aware UI cues rather than heavy explanation panels everywhere.
- The game should increasingly answer:
  - what am I doing,
  - why should I pick this,
  - what do I gain by moving up.

## C. Balancing and simulation support
- Add or define internal tooling that can validate progression and balancing assumptions more systematically.
- Candidate capabilities include:
  - headless progression simulations,
  - recipe/dungeon comparison outputs,
  - reward efficiency reports,
  - regression alerts for tier inversion or broken progression ordering.
- Tooling should support deterministic comparison and be usable during iteration, not only after balance issues are already visible in play.

## D. Release and changelog flow
- Align the maintained `changelogs/` artifacts with actual release behavior more intentionally.
- Candidate directions include:
  - using versioned changelog files as release body input,
  - adding a fallback strategy only when no curated changelog exists,
  - clarifying how tags, assets, and release communication should interact.
- The release process should better reflect repository-maintained release documentation.

## E. Logics hygiene and workflow normalization
- Reduce remaining legacy metadata drift in Logics docs, especially where docs are complete but still lack normalized workflow indicators such as `Status`.
- The goal is not cosmetic cleanup only; it is to make workflow tooling and CI behavior more coherent and less branch-history-sensitive.
- This should be done pragmatically:
  - avoid breaking established history unnecessarily,
  - but stop carrying ambiguous metadata debt indefinitely.

# Product/architecture constraints
- Meta progression additions should build on existing runtime/save architecture rather than introducing opaque parallel progression stores without justification.
- Choice-clarity UI should reuse existing selectors/view-model layers wherever possible instead of pushing balance math into components.
- Balance tooling should remain deterministic and scriptable so results can be compared reliably over time.
- Release workflow improvements should preserve current release safety gates unless there is an explicit decision to relax them.
- Logics hygiene work should be compatible with the current linter/flow tools or evolve them deliberately, not by silently bypassing them everywhere.

# Technical references likely impacted
- `src/core/*`
- `src/data/*`
- `src/app/components/*`
- `src/app/selectors/*`
- `tests/*`
- `.github/workflows/release.yml`
- `.github/workflows/ci.yml`
- `scripts/ci/*`
- `scripts/quality/*`
- `changelogs/*`
- `logics/request/*`
- `logics/backlog/*`
- `logics/tasks/*`
- `logics/skills/*`

# Acceptance criteria
- A concrete next-phase plan exists for:
  - stronger meta progression,
  - clearer gameplay choice communication,
  - balance/simulation tooling,
  - release/changelog alignment,
  - Logics metadata normalization.
- The plan is decomposable into backlog items without collapsing all concerns into one oversized implementation task.
- The initiative improves both player-facing value and project maintainability/operability.
- Follow-up implementation work can be prioritized in slices without losing coherence across the full phase.

# Test expectations
- This request is primarily roadmap/architecture-oriented, but follow-up execution should expect:
  - gameplay regression tests for reward/value communication changes,
  - deterministic tooling validation for balance/simulation support,
  - CI/release workflow checks for changelog/release alignment,
  - Logics lint/workflow validation for metadata normalization work.

# Risks / open points
- Trying to ship every axis at once would create a vague and hard-to-finish mega-initiative.
- Meta progression can easily become grindy if it adds chores without meaningful new decisions.
- Choice-clarity UI can become noisy if too much data is exposed without hierarchy.
- Balance tooling can become maintenance-heavy if it is not tightly scoped to actual tuning questions.
- Logics cleanup can create churn if done mechanically without regard for how legacy docs are used.
- Release automation should not silently hide the distinction between curated human-facing notes and fallback generated notes.

# Follow-up requests
- `logics/request/req_065_add_an_internal_dungeon_balance_simulator_for_difficulty_diagnostics_and_tuning.md`
- `logics/request/req_066_add_long_term_meta_progression_and_return_drivers_across_sessions.md`
- `logics/request/req_067_improve_gameplay_choice_clarity_with_lightweight_systematic_value_cues.md`
- `logics/request/req_068_align_github_release_generation_with_curated_repository_changelogs.md`
- `logics/request/req_069_normalize_legacy_logics_metadata_and_reduce_workflow_drift.md`

# Suggested prioritization
- `req_065` first: establish dungeon balance diagnostics and tuning support.
- `req_067` second: improve player-facing decision clarity on the highest-impact gameplay surfaces.
- `req_066` third: add stronger long-term return motivation once short-term balance/readability is firmer.
- `req_068` fourth: align release output with curated changelog artifacts.
- `req_069` fifth: continue Logics normalization as operational hygiene without blocking product-facing work.

# Completion notes
- This parent roadmap request has been fulfilled by the decomposition and delivery of:
  - `logics/request/req_065_add_an_internal_dungeon_balance_simulator_for_difficulty_diagnostics_and_tuning.md`
  - `logics/request/req_066_add_long_term_meta_progression_and_return_drivers_across_sessions.md`
  - `logics/request/req_067_improve_gameplay_choice_clarity_with_lightweight_systematic_value_cues.md`
  - `logics/request/req_068_align_github_release_generation_with_curated_repository_changelogs.md`
  - `logics/request/req_069_normalize_legacy_logics_metadata_and_reduce_workflow_drift.md`
- Follow-up execution completed through tasks `113` to `117`.

# Used by
- `logics/tasks/task_114_execute_req066_meta_progression_across_backlog_items_219_to_222.md`
