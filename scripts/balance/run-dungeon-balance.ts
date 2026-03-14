import {
    createDefaultDungeonBalanceScenarios,
    formatDungeonBalanceReport,
    formatDungeonBalanceSummary,
    formatDungeonBalanceThresholdReport,
    runDungeonBalanceMatrix,
    scanDungeonBalanceThresholds,
    summarizeDungeonBalanceResults,
    type DungeonBalancePresetId
} from "../../src/core/dungeonBalance";

const parsePresetIds = (value: string | undefined): DungeonBalancePresetId[] | undefined => {
    if (!value) {
        return undefined;
    }
    const presetIds = value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
    const allowed = new Set<DungeonBalancePresetId>(["standard", "aggressive"]);
    if (presetIds.some((presetId) => !allowed.has(presetId as DungeonBalancePresetId))) {
        throw new Error(`Unsupported preset list: ${value}`);
    }
    return presetIds as DungeonBalancePresetId[];
};

const args = process.argv.slice(2);
const readArgValue = (flag: string) => {
    const index = args.indexOf(flag);
    if (index === -1) {
        return undefined;
    }
    return args[index + 1];
};

const presetIds = parsePresetIds(readArgValue("--presets"));
const minCombatLevel = Number.parseInt(readArgValue("--min-level") ?? "", 10);
const maxCombatLevel = Number.parseInt(readArgValue("--max-level") ?? "", 10);
const levelStep = Number.parseInt(readArgValue("--level-step") ?? "", 10);
const includeThresholds = !args.includes("--no-thresholds");

const scenarios = createDefaultDungeonBalanceScenarios(presetIds);
const results = runDungeonBalanceMatrix(scenarios);
const summary = summarizeDungeonBalanceResults(results);

console.log(formatDungeonBalanceSummary(summary));
console.log("");
console.log(formatDungeonBalanceReport(results));

if (includeThresholds) {
    console.log("");
    console.log(formatDungeonBalanceThresholdReport(scanDungeonBalanceThresholds({
        presetIds,
        minCombatLevel: Number.isFinite(minCombatLevel) ? minCombatLevel : undefined,
        maxCombatLevel: Number.isFinite(maxCombatLevel) ? maxCombatLevel : undefined,
        levelStep: Number.isFinite(levelStep) ? levelStep : undefined
    })));
}
