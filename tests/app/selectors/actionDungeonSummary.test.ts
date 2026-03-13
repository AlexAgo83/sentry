import { describe, expect, it } from "vitest";
import { startDungeonRun } from "../../../src/core/dungeon";
import { createInitialGameState, createPlayerState } from "../../../src/core/state";
import { selectActionDungeonSummaryFromState } from "../../../src/app/selectors/actionDungeonSummary";

describe("action dungeon summary selector", () => {
    it("builds a concise dungeon summary for the active hero in an active run", () => {
        let state = createInitialGameState("test");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Lyra");
        state.players["4"] = createPlayerState("4", "Orin");
        state.inventory.items.food = 20;

        state = startDungeonRun(
            state,
            "dungeon_ruines_humides",
            ["1", "2", "3", "4"],
            12345
        );

        const summary = selectActionDungeonSummaryFromState(state);

        expect(summary).not.toBeNull();
        expect(summary?.rows).toEqual([
            { label: "Dungeon", value: "Damp Ruins" },
            { label: "Floor", value: "1 / 10" },
            { label: "Status", value: expect.stringMatching(/^In combat:/) },
            { label: "Hero", value: "Ready" }
        ]);
    });

    it("returns null when the active hero is not assigned to an active dungeon run", () => {
        const state = createInitialGameState("test");

        expect(selectActionDungeonSummaryFromState(state)).toBeNull();
    });
});
