import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ShopPanelContainer } from "../../src/app/containers/ShopPanelContainer";
import { createInitialGameState } from "../../src/core/state";
import { createGameStore } from "../../src/store/gameStore";
import type { GameStore } from "../../src/store/gameStore";

let testStore: GameStore;

vi.mock("../../src/app/game", () => ({
    get gameStore() {
        return testStore;
    }
}));

describe("ShopPanelContainer", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("renders meta roster discount without triggering unstable store selection loops", () => {
        const state = createInitialGameState("0.9.40");
        state.appReady = true;
        state.metaProgression.milestones.meta_quest_board_regular.completedAt = 1_000;
        testStore = createGameStore(state);

        render(<ShopPanelContainer />);

        expect(screen.getByText("Shop")).toBeTruthy();
        expect(screen.getByText("Meta discount: -15%")).toBeTruthy();
        expect(screen.getByText(/Current cap:/)).toBeTruthy();
    });
});
