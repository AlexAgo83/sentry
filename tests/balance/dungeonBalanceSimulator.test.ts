import { describe, expect, it } from "vitest";

import {
    createDefaultDungeonBalanceScenarios,
    formatDungeonBalanceReport,
    formatDungeonBalanceSummary,
    formatDungeonBalanceThresholdReport,
    runDungeonBalanceMatrix,
    scanDungeonBalanceThresholds,
    simulateDungeonBalanceScenario,
    summarizeDungeonBalanceResults
} from "../../src/core/dungeonBalance";

describe("dungeon balance simulator", () => {
    it("builds a full scenario matrix from dungeon definitions and presets", () => {
        const scenarios = createDefaultDungeonBalanceScenarios();

        expect(scenarios.length).toBeGreaterThan(0);
        expect(scenarios.some((scenario) => scenario.presetId === "standard" && scenario.targetBand === "close_clear")).toBe(true);
        expect(scenarios.some((scenario) => scenario.presetId === "aggressive" && scenario.targetBand === "safe_clear")).toBe(true);
    });

    it("simulates representative scenarios deterministically", () => {
        const scenarios = createDefaultDungeonBalanceScenarios(["standard"]);
        const blackSanctuaryClose = scenarios.find((scenario) => (
            scenario.dungeonId === "dungeon_sanctuaire_noir" && scenario.targetBand === "close_clear"
        ));

        expect(blackSanctuaryClose).toBeTruthy();
        if (!blackSanctuaryClose) {
            return;
        }

        const first = simulateDungeonBalanceScenario(blackSanctuaryClose);
        const second = simulateDungeonBalanceScenario(blackSanctuaryClose);

        expect(second).toEqual(first);
        expect(["likely_fail", "close_clear", "safe_clear"]).toContain(first.observedBand);
        expect(first.floorReached).toBeGreaterThanOrEqual(1);
        expect(first.floorReached).toBeLessThanOrEqual(first.floorCount);
    });

    it("formats reviewable reports from matrix results", () => {
        const scenarios = createDefaultDungeonBalanceScenarios(["standard"]).slice(0, 3);
        const results = runDungeonBalanceMatrix(scenarios);
        const report = formatDungeonBalanceReport(results);

        expect(results).toHaveLength(3);
        expect(report).toContain("Dungeon Balance Report");
        expect(report).toContain("target=");
        expect(report).toContain("observed=");
    });

    it("builds tuning-friendly summaries and threshold reports", () => {
        const scenarios = createDefaultDungeonBalanceScenarios(["standard"]).slice(0, 3);
        const results = runDungeonBalanceMatrix(scenarios);
        const summary = formatDungeonBalanceSummary(summarizeDungeonBalanceResults(results));
        const thresholds = scanDungeonBalanceThresholds({
            presetIds: ["standard"],
            minCombatLevel: 1,
            maxCombatLevel: 8,
            levelStep: 1
        });
        const thresholdReport = formatDungeonBalanceThresholdReport(thresholds);

        expect(summary).toContain("Dungeon Balance Summary");
        expect(summary).toContain("standard:");
        expect(thresholds.some((entry) => entry.presetId === "standard")).toBe(true);
        expect(thresholdReport).toContain("Dungeon Balance Thresholds");
        expect(thresholdReport).toContain("firstVictory=");
    });
});

if (process.env.DUNGEON_BALANCE_REPORT === "1") {
    describe("dungeon balance simulator report", () => {
        it("prints the default matrix for manual balancing review", () => {
            const scenarios = createDefaultDungeonBalanceScenarios();
            const results = runDungeonBalanceMatrix(scenarios);
            console.log(formatDungeonBalanceReport(results));
            expect(results).toHaveLength(scenarios.length);
        });
    });
}
