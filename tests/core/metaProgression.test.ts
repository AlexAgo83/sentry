import { describe, expect, it } from "vitest";

import { RESTED_DURATION_MS, RESTED_ENDURANCE_FLAT } from "../../src/core/constants";
import { gameReducer } from "../../src/core/reducer";
import { createInitialGameState, createPlayerState } from "../../src/core/state";
import {
    buildMetaMilestoneEntries,
    evaluateMetaProgression,
    getEffectiveRosterLimit,
    pickMetaProgressionSnapshot,
    resolveMetaProgressionEffects
} from "../../src/core/metaProgression";

describe("meta progression", () => {
    it("completes directed milestones from real state metrics", () => {
        const state = createInitialGameState("0.9.40");
        state.players["2"] = createPlayerState("2", "B");
        state.players["3"] = createPlayerState("3", "C");
        state.players["4"] = createPlayerState("4", "D");
        state.quests.completed.quest_1 = true;
        state.quests.completed.quest_2 = true;
        state.quests.completed.quest_3 = true;
        state.quests.completed.quest_4 = true;
        state.quests.completed.quest_5 = true;
        state.quests.completed.quest_6 = true;
        state.dungeon.completionCounts.dungeon_sanctuaire_noir = 1;
        state.players["1"].skills.CombatMelee.level = 15;
        state.players["2"].skills.CombatMelee.level = 15;
        state.players["3"].skills.CombatMelee.level = 15;
        state.players["4"].skills.CombatMelee.level = 15;

        const evaluation = evaluateMetaProgression(state.metaProgression, pickMetaProgressionSnapshot(state), 123456);

        expect(evaluation.newlyCompleted).toHaveLength(4);
        expect(resolveMetaProgressionEffects(evaluation.metaProgression)).toEqual({
            freeRosterSlots: 2,
            rosterSlotDiscountPct: 0.15,
            restedEnduranceFlatBonus: 1,
            restedDurationMultiplier: 1.5
        });
    });

    it("builds readable milestone entries and effective roster cap", () => {
        const state = createInitialGameState("0.9.40");
        state.players["2"] = createPlayerState("2", "B");
        state.players["3"] = createPlayerState("3", "C");
        state.players["4"] = createPlayerState("4", "D");
        state.metaProgression.milestones.meta_roster_established.completedAt = 1;

        const entries = buildMetaMilestoneEntries(pickMetaProgressionSnapshot(state));

        expect(entries[0]?.id).not.toBe("meta_roster_established");
        expect(entries.find((entry) => entry.id === "meta_roster_established")?.progressLabel).toBe("Unlocked");
        expect(getEffectiveRosterLimit(state)).toBe(state.rosterLimit + 1);
    });

    it("applies milestone rewards through reducer actions", () => {
        let state = createInitialGameState("0.9.40");
        state.rosterLimit = 5;
        state.inventory.items.gold = 30_000;
        state.metaProgression.milestones.meta_quest_board_regular.completedAt = 100;
        state.metaProgression.milestones.meta_warband_training.completedAt = 200;

        state = gameReducer(state, { type: "purchaseRosterSlot" });
        state = gameReducer(state, { type: "grantRestedBuff", timestamp: 5_000 });

        expect(state.rosterLimit).toBe(6);
        expect(state.inventory.items.gold).toBe(8_750);
        expect(state.players["1"].stats.temporaryMods).toContainEqual(expect.objectContaining({
            id: "rested",
            stat: "Endurance",
            value: RESTED_ENDURANCE_FLAT + 1,
            expiresAt: 5_000 + Math.round(RESTED_DURATION_MS * 1.5)
        }));
    });
});
