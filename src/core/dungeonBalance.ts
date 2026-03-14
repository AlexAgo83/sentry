import { DUNGEON_DEFINITIONS, getDungeonDefinition } from "../data/dungeons";
import {
    getEquipmentModifiers
} from "../data/equipment";
import {
    DEFAULT_HP_MAX,
    DEFAULT_SKILL_XP_NEXT,
    STAT_PERCENT_PER_POINT,
    XP_NEXT_MULTIPLIER
} from "./constants";
import { applyDungeonTick, foodCostForFloor, getActiveDungeonRunIds, startDungeonRun } from "./dungeon";
import { createInitialGameState, createPlayerState } from "./state";
import { createBaseStats, resolveEffectiveStats } from "./stats";
import type {
    DungeonDefinition,
    DungeonId,
    DungeonRunEndReason,
    EquipmentSlotId,
    GameState,
    PlayerEquipmentState,
    PlayerId,
    PlayerState
} from "./types";

export type DungeonBalanceDifficultyBand = "likely_fail" | "close_clear" | "safe_clear";
export type DungeonBalanceGearMilestone = "baseline" | "refined" | "masterwork";
export type DungeonBalanceRole = "melee" | "ranged" | "support";
export type DungeonBalancePresetId = "standard" | "aggressive";

export interface DungeonBalancePresetDefinition {
    id: DungeonBalancePresetId;
    name: string;
    description: string;
    roles: [DungeonBalanceRole, DungeonBalanceRole, DungeonBalanceRole, DungeonBalanceRole];
}

export interface DungeonBalanceScenario {
    dungeonId: DungeonId;
    presetId: DungeonBalancePresetId;
    targetBand: DungeonBalanceDifficultyBand;
    combatLevel: number;
    gearMilestone: DungeonBalanceGearMilestone;
}

export interface DungeonBalanceResult {
    dungeonId: DungeonId;
    dungeonName: string;
    dungeonTier: number;
    recommendedPower: number;
    presetId: DungeonBalancePresetId;
    targetBand: DungeonBalanceDifficultyBand;
    observedBand: DungeonBalanceDifficultyBand;
    combatLevel: number;
    gearMilestone: DungeonBalanceGearMilestone;
    status: "victory" | "failed";
    endReason: DungeonRunEndReason;
    floorReached: number;
    floorCount: number;
    survivors: number;
    elapsedMs: number;
    remainingFood: number;
    averageHpRatio: number;
    minHpRatio: number;
}

export interface DungeonBalanceSummary {
    totalScenarios: number;
    exactBandMatches: number;
    harsherThanTarget: number;
    softerThanTarget: number;
    byPreset: Record<DungeonBalancePresetId, {
        totalScenarios: number;
        exactBandMatches: number;
        harsherThanTarget: number;
        softerThanTarget: number;
    }>;
}

export interface DungeonBalanceThreshold {
    dungeonId: DungeonId;
    dungeonName: string;
    dungeonTier: number;
    presetId: DungeonBalancePresetId;
    gearMilestone: DungeonBalanceGearMilestone;
    firstVictoryCombatLevel: number | null;
    firstSafeClearCombatLevel: number | null;
    lastLikelyFailCombatLevel: number | null;
    maxEvaluatedCombatLevel: number;
}

export interface DungeonBalanceThresholdScanOptions {
    presetIds?: DungeonBalancePresetId[];
    minCombatLevel?: number;
    maxCombatLevel?: number;
    levelStep?: number;
}

const SIMULATION_VERSION = "0.9.40";
const PARTY_IDS: PlayerId[] = ["1", "2", "3", "4"];
const SIMULATION_STEP_MS = 500;
const MAX_SIMULATION_STEPS = 20_000;

const MILESTONE_WEAPONS: Record<DungeonBalanceGearMilestone, Record<"melee" | "ranged" | "magic", string>> = {
    baseline: {
        melee: "rusty_blade",
        ranged: "simple_bow",
        magic: "apprentice_staff"
    },
    refined: {
        melee: "rusty_blade_refined",
        ranged: "simple_bow_refined",
        magic: "apprentice_staff_refined"
    },
    masterwork: {
        melee: "rusty_blade_masterwork",
        ranged: "simple_bow_masterwork",
        magic: "apprentice_staff_masterwork"
    }
};

const ROLE_EQUIPMENT: Record<DungeonBalanceRole, Record<Exclude<EquipmentSlotId, "Tablet" | "Weapon">, string>> = {
    melee: {
        Head: "iron_helm",
        Cape: "traveler_cape",
        Torso: "iron_cuirass",
        Legs: "iron_greaves",
        Hands: "forged_gauntlets",
        Feet: "iron_boots",
        Ring: "signet_ring",
        Amulet: "warding_amulet"
    },
    ranged: {
        Head: "hide_hood",
        Cape: "tanned_mantle",
        Torso: "hardened_jerkin",
        Legs: "studded_leggings",
        Hands: "leather_gloves",
        Feet: "simple_boots",
        Ring: "signet_ring",
        Amulet: "warding_amulet"
    },
    support: {
        Head: "cloth_cap",
        Cape: "silk_cloak",
        Torso: "linen_tunic",
        Legs: "worn_trousers",
        Hands: "silkweave_gloves",
        Feet: "weaver_boots",
        Ring: "signet_ring",
        Amulet: "warding_amulet"
    }
};

const MILESTONE_STAT_BONUS: Record<DungeonBalanceGearMilestone, number> = {
    baseline: 0,
    refined: 2,
    masterwork: 4
};

const BAND_ORDER: Record<DungeonBalanceDifficultyBand, number> = {
    likely_fail: 0,
    close_clear: 1,
    safe_clear: 2
};

export const DUNGEON_BALANCE_PRESETS: DungeonBalancePresetDefinition[] = [
    {
        id: "standard",
        name: "Standard Team",
        description: "1 melee / 2 ranged / 1 support",
        roles: ["melee", "ranged", "ranged", "support"]
    },
    {
        id: "aggressive",
        name: "Aggressive Team",
        description: "2 melee / 1 ranged / 1 support",
        roles: ["melee", "melee", "ranged", "support"]
    }
];

const PRESET_BY_ID = DUNGEON_BALANCE_PRESETS.reduce<Record<DungeonBalancePresetId, DungeonBalancePresetDefinition>>((acc, preset) => {
    acc[preset.id] = preset;
    return acc;
}, {} as Record<DungeonBalancePresetId, DungeonBalancePresetDefinition>);

const clampCombatLevel = (level: number) => Math.max(1, Math.min(120, Math.floor(level)));

const getGearMilestoneForDungeon = (definition: DungeonDefinition): DungeonBalanceGearMilestone => {
    if (definition.tier >= 8) {
        return "masterwork";
    }
    if (definition.tier >= 5) {
        return "refined";
    }
    return "baseline";
};

const computeSkillXpNextForLevel = (level: number) => {
    let xpNext = DEFAULT_SKILL_XP_NEXT;
    let currentLevel = 1;
    const safeLevel = clampCombatLevel(level);
    while (currentLevel < safeLevel) {
        xpNext = Math.floor(xpNext * XP_NEXT_MULTIPLIER);
        currentLevel += 1;
    }
    return xpNext;
};

const assignCombatLevels = (player: PlayerState, combatLevel: number): PlayerState => {
    const nextSkills = { ...player.skills };
    (["CombatMelee", "CombatRanged", "CombatMagic"] as const).forEach((skillId) => {
        const skill = nextSkills[skillId];
        if (!skill) {
            return;
        }
        nextSkills[skillId] = {
            ...skill,
            level: clampCombatLevel(combatLevel),
            xp: 0,
            xpNext: computeSkillXpNextForLevel(combatLevel)
        };
    });
    return {
        ...player,
        skills: nextSkills
    };
};

const buildStatsForRole = (
    role: DungeonBalanceRole,
    combatLevel: number,
    gearMilestone: DungeonBalanceGearMilestone
) => {
    const base = createBaseStats();
    const milestoneBonus = MILESTONE_STAT_BONUS[gearMilestone];
    const safeLevel = clampCombatLevel(combatLevel);
    base.Luck = Math.min(50, 2 + Math.floor(safeLevel * 0.04) + Math.floor(milestoneBonus / 2));

    if (role === "melee") {
        base.Strength = Math.min(50, 4 + Math.floor(safeLevel * 0.1) + milestoneBonus);
        base.Endurance = Math.min(50, 4 + Math.floor(safeLevel * 0.08) + milestoneBonus);
        base.Agility = Math.min(50, 2 + Math.floor(safeLevel * 0.04));
        return base;
    }

    if (role === "ranged") {
        base.Strength = Math.min(50, 3 + Math.floor(safeLevel * 0.06) + Math.floor(milestoneBonus / 2));
        base.Agility = Math.min(50, 5 + Math.floor(safeLevel * 0.12) + milestoneBonus);
        base.Endurance = Math.min(50, 3 + Math.floor(safeLevel * 0.07) + Math.floor(milestoneBonus / 2));
        return base;
    }

    base.Strength = Math.min(50, 3 + Math.floor(safeLevel * 0.05) + Math.floor(milestoneBonus / 2));
    base.Intellect = Math.min(50, 5 + Math.floor(safeLevel * 0.1) + milestoneBonus);
    base.Endurance = Math.min(50, 4 + Math.floor(safeLevel * 0.08) + Math.floor(milestoneBonus / 2));
    base.Agility = Math.min(50, 2 + Math.floor(safeLevel * 0.05));
    return base;
};

const assignLoadout = (
    role: DungeonBalanceRole,
    gearMilestone: DungeonBalanceGearMilestone
): PlayerEquipmentState => {
    const weaponTrack = role === "melee" ? "melee" : role === "ranged" ? "ranged" : "magic";
    const roleItems = ROLE_EQUIPMENT[role];
    const equipment: PlayerEquipmentState = {
        slots: {
            Head: roleItems.Head,
            Cape: roleItems.Cape,
            Torso: roleItems.Torso,
            Legs: roleItems.Legs,
            Hands: roleItems.Hands,
            Feet: roleItems.Feet,
            Ring: roleItems.Ring,
            Amulet: roleItems.Amulet,
            Weapon: MILESTONE_WEAPONS[gearMilestone][weaponTrack],
            Tablet: null
        },
        charges: {
            Head: null,
            Cape: null,
            Torso: null,
            Legs: null,
            Hands: null,
            Feet: null,
            Ring: null,
            Amulet: null,
            Weapon: null,
            Tablet: null
        }
    };
    return equipment;
};

const refreshPlayerVitals = (player: PlayerState): PlayerState => {
    const effective = resolveEffectiveStats(player.stats, 0, getEquipmentModifiers(player.equipment)).effective;
    const hpMax = Math.ceil(DEFAULT_HP_MAX * (1 + effective.Endurance * STAT_PERCENT_PER_POINT));
    return {
        ...player,
        hpMax,
        hp: hpMax
    };
};

const createBalancedPlayer = (
    playerId: PlayerId,
    role: DungeonBalanceRole,
    combatLevel: number,
    gearMilestone: DungeonBalanceGearMilestone
): PlayerState => {
    const player = createPlayerState(playerId, `${role}_${playerId}`);
    const equipped = {
        ...player,
        stats: {
            ...player.stats,
            base: buildStatsForRole(role, combatLevel, gearMilestone)
        },
        equipment: assignLoadout(role, gearMilestone)
    };
    return refreshPlayerVitals(assignCombatLevels(equipped, combatLevel));
};

const getFoodBudgetForDungeon = (definition: DungeonDefinition) => {
    let total = 0;
    for (let floor = 1; floor <= definition.floorCount; floor += 1) {
        total += foodCostForFloor(definition.tier, floor, definition.floorCount);
    }
    return total + 3;
};

const buildSimulationState = (scenario: DungeonBalanceScenario): { state: GameState; preset: DungeonBalancePresetDefinition } => {
    const preset = PRESET_BY_ID[scenario.presetId];
    let state = createInitialGameState(SIMULATION_VERSION, { seedHero: false });
    const players = PARTY_IDS.reduce<Record<PlayerId, PlayerState>>((acc, playerId, index) => {
        const role = preset.roles[index];
        acc[playerId] = createBalancedPlayer(playerId, role, scenario.combatLevel, scenario.gearMilestone);
        return acc;
    }, {} as Record<PlayerId, PlayerState>);
    const definition = getDungeonDefinition(scenario.dungeonId);
    const foodBudget = definition ? getFoodBudgetForDungeon(definition) : 30;
    state = {
        ...state,
        players,
        activePlayerId: PARTY_IDS[0],
        rosterOrder: PARTY_IDS.slice(),
        dungeon: {
            ...state.dungeon,
            setup: {
                ...state.dungeon.setup,
                autoRestart: false
            }
        },
        inventory: {
            ...state.inventory,
            items: {
                ...state.inventory.items,
                food: foodBudget,
                potion: 8,
                tonic: 4,
                elixir: 4
            }
        }
    };
    return { state, preset };
};

const classifyObservedBand = (
    status: "victory" | "failed",
    survivors: number,
    averageHpRatio: number,
    minHpRatio: number,
    remainingFood: number
): DungeonBalanceDifficultyBand => {
    if (status !== "victory") {
        return "likely_fail";
    }
    if (survivors === 4 && averageHpRatio >= 0.7 && minHpRatio >= 0.45 && remainingFood >= 3) {
        return "safe_clear";
    }
    return "close_clear";
};

export const createDefaultDungeonBalanceScenarios = (
    presetIds: DungeonBalancePresetId[] = DUNGEON_BALANCE_PRESETS.map((preset) => preset.id)
): DungeonBalanceScenario[] => {
    return DUNGEON_DEFINITIONS.flatMap((definition) => {
        const gearMilestone = getGearMilestoneForDungeon(definition);
        return presetIds.flatMap((presetId) => {
            const safePower = definition.recommendedPower + 4;
            return [
                {
                    dungeonId: definition.id,
                    presetId,
                    targetBand: "likely_fail" as const,
                    combatLevel: Math.max(1, definition.recommendedPower - 4),
                    gearMilestone
                },
                {
                    dungeonId: definition.id,
                    presetId,
                    targetBand: "close_clear" as const,
                    combatLevel: definition.recommendedPower,
                    gearMilestone
                },
                {
                    dungeonId: definition.id,
                    presetId,
                    targetBand: "safe_clear" as const,
                    combatLevel: safePower,
                    gearMilestone
                }
            ];
        });
    });
};

export const simulateDungeonBalanceScenario = (scenario: DungeonBalanceScenario): DungeonBalanceResult => {
    const definition = getDungeonDefinition(scenario.dungeonId);
    if (!definition) {
        throw new Error(`Unknown dungeon definition: ${scenario.dungeonId}`);
    }

    const { state: initialState } = buildSimulationState(scenario);
    let timestamp = 1_000_000;
    const started = startDungeonRun(initialState, scenario.dungeonId, PARTY_IDS, timestamp);
    const runId = started.dungeon.activeRunId;
    if (!runId) {
        throw new Error(`Failed to start dungeon scenario for ${scenario.dungeonId}`);
    }

    let state = started;
    let steps = 0;
    while (getActiveDungeonRunIds(state.dungeon).length > 0 && steps < MAX_SIMULATION_STEPS) {
        steps += 1;
        timestamp += SIMULATION_STEP_MS;
        state = applyDungeonTick(state, SIMULATION_STEP_MS, timestamp).state;
    }

    const endedRun = state.dungeon.runs[runId];
    const replay = state.dungeon.latestReplay;
    if (!endedRun || !replay) {
        throw new Error(`Dungeon scenario did not finalize correctly for ${scenario.dungeonId}`);
    }
    if (steps >= MAX_SIMULATION_STEPS && endedRun.status === "running") {
        throw new Error(`Dungeon scenario exceeded the simulation step budget for ${scenario.dungeonId}`);
    }

    const survivors = endedRun.party.filter((member) => member.hp > 0).length;
    const hpRatios = endedRun.party.map((member) => (member.hpMax > 0 ? member.hp / member.hpMax : 0));
    const averageHpRatio = hpRatios.reduce((total, ratio) => total + ratio, 0) / Math.max(1, hpRatios.length);
    const minHpRatio = hpRatios.length > 0 ? Math.min(...hpRatios) : 0;
    const remainingFood = Math.max(0, state.inventory.items.food ?? 0);
    const observedBand = classifyObservedBand(replay.status, survivors, averageHpRatio, minHpRatio, remainingFood);

    return {
        dungeonId: definition.id,
        dungeonName: definition.name,
        dungeonTier: definition.tier,
        recommendedPower: definition.recommendedPower,
        presetId: scenario.presetId,
        targetBand: scenario.targetBand,
        observedBand,
        combatLevel: scenario.combatLevel,
        gearMilestone: scenario.gearMilestone,
        status: replay.status,
        endReason: replay.endReason,
        floorReached: endedRun.floor,
        floorCount: endedRun.floorCount,
        survivors,
        elapsedMs: replay.elapsedMs,
        remainingFood,
        averageHpRatio: Number(averageHpRatio.toFixed(3)),
        minHpRatio: Number(minHpRatio.toFixed(3))
    };
};

export const runDungeonBalanceMatrix = (scenarios: DungeonBalanceScenario[]): DungeonBalanceResult[] => {
    return scenarios.map((scenario) => simulateDungeonBalanceScenario(scenario));
};

export const summarizeDungeonBalanceResults = (results: DungeonBalanceResult[]): DungeonBalanceSummary => {
    const byPreset = DUNGEON_BALANCE_PRESETS.reduce<DungeonBalanceSummary["byPreset"]>((acc, preset) => {
        acc[preset.id] = {
            totalScenarios: 0,
            exactBandMatches: 0,
            harsherThanTarget: 0,
            softerThanTarget: 0
        };
        return acc;
    }, {} as DungeonBalanceSummary["byPreset"]);

    return results.reduce<DungeonBalanceSummary>((acc, result) => {
        acc.totalScenarios += 1;
        const presetSummary = acc.byPreset[result.presetId];
        presetSummary.totalScenarios += 1;
        const observedOrder = BAND_ORDER[result.observedBand];
        const targetOrder = BAND_ORDER[result.targetBand];
        if (observedOrder === targetOrder) {
            acc.exactBandMatches += 1;
            presetSummary.exactBandMatches += 1;
        } else if (observedOrder < targetOrder) {
            acc.harsherThanTarget += 1;
            presetSummary.harsherThanTarget += 1;
        } else {
            acc.softerThanTarget += 1;
            presetSummary.softerThanTarget += 1;
        }
        return acc;
    }, {
        totalScenarios: 0,
        exactBandMatches: 0,
        harsherThanTarget: 0,
        softerThanTarget: 0,
        byPreset
    });
};

export const scanDungeonBalanceThresholds = (
    options: DungeonBalanceThresholdScanOptions = {}
): DungeonBalanceThreshold[] => {
    const presetIds = options.presetIds ?? DUNGEON_BALANCE_PRESETS.map((preset) => preset.id);
    const minCombatLevel = clampCombatLevel(options.minCombatLevel ?? 1);
    const maxCombatLevel = clampCombatLevel(options.maxCombatLevel ?? 60);
    const levelStep = Math.max(1, Math.floor(options.levelStep ?? 1));

    return DUNGEON_DEFINITIONS.flatMap((definition) => {
        const gearMilestone = getGearMilestoneForDungeon(definition);
        return presetIds.map((presetId) => {
            let firstVictoryCombatLevel: number | null = null;
            let firstSafeClearCombatLevel: number | null = null;
            let lastLikelyFailCombatLevel: number | null = null;

            for (let combatLevel = minCombatLevel; combatLevel <= maxCombatLevel; combatLevel += levelStep) {
                const result = simulateDungeonBalanceScenario({
                    dungeonId: definition.id,
                    presetId,
                    targetBand: "close_clear",
                    combatLevel,
                    gearMilestone
                });

                if (result.status === "victory" && firstVictoryCombatLevel === null) {
                    firstVictoryCombatLevel = combatLevel;
                }
                if (result.observedBand === "safe_clear" && firstSafeClearCombatLevel === null) {
                    firstSafeClearCombatLevel = combatLevel;
                    break;
                }
                if (result.observedBand === "likely_fail") {
                    lastLikelyFailCombatLevel = combatLevel;
                }
            }

            return {
                dungeonId: definition.id,
                dungeonName: definition.name,
                dungeonTier: definition.tier,
                presetId,
                gearMilestone,
                firstVictoryCombatLevel,
                firstSafeClearCombatLevel,
                lastLikelyFailCombatLevel,
                maxEvaluatedCombatLevel: maxCombatLevel
            };
        });
    });
};

export const formatDungeonBalanceReport = (results: DungeonBalanceResult[]) => {
    const lines = ["Dungeon Balance Report"];
    const sorted = [...results].sort((a, b) => {
        if (a.dungeonTier !== b.dungeonTier) {
            return a.dungeonTier - b.dungeonTier;
        }
        if (a.presetId !== b.presetId) {
            return a.presetId.localeCompare(b.presetId);
        }
        return a.targetBand.localeCompare(b.targetBand);
    });

    sorted.forEach((result) => {
        lines.push(
            [
                `T${result.dungeonTier}`,
                result.dungeonName,
                `[${result.presetId}]`,
                `target=${result.targetBand}`,
                `observed=${result.observedBand}`,
                `status=${result.status}/${result.endReason}`,
                `lvl=${result.combatLevel}`,
                `floor=${result.floorReached}/${result.floorCount}`,
                `survivors=${result.survivors}`,
                `avgHp=${Math.round(result.averageHpRatio * 100)}%`,
                `food=${result.remainingFood}`
            ].join(" | ")
        );
    });

    return lines.join("\n");
};

export const formatDungeonBalanceSummary = (summary: DungeonBalanceSummary) => {
    const lines = [
        "Dungeon Balance Summary",
        `Scenarios=${summary.totalScenarios} | exact=${summary.exactBandMatches} | harsher=${summary.harsherThanTarget} | softer=${summary.softerThanTarget}`
    ];

    DUNGEON_BALANCE_PRESETS.forEach((preset) => {
        const presetSummary = summary.byPreset[preset.id];
        lines.push(
            `${preset.id}: scenarios=${presetSummary.totalScenarios} | exact=${presetSummary.exactBandMatches} | harsher=${presetSummary.harsherThanTarget} | softer=${presetSummary.softerThanTarget}`
        );
    });

    return lines.join("\n");
};

export const formatDungeonBalanceThresholdReport = (thresholds: DungeonBalanceThreshold[]) => {
    const lines = ["Dungeon Balance Thresholds"];
    const sorted = [...thresholds].sort((a, b) => {
        if (a.dungeonTier !== b.dungeonTier) {
            return a.dungeonTier - b.dungeonTier;
        }
        return a.presetId.localeCompare(b.presetId);
    });

    sorted.forEach((threshold) => {
        lines.push(
            [
                `T${threshold.dungeonTier}`,
                threshold.dungeonName,
                `[${threshold.presetId}]`,
                `gear=${threshold.gearMilestone}`,
                `lastFail=${threshold.lastLikelyFailCombatLevel ?? "-"}`,
                `firstVictory=${threshold.firstVictoryCombatLevel ?? "-"}`,
                `firstSafe=${threshold.firstSafeClearCombatLevel ?? `>${threshold.maxEvaluatedCombatLevel}`}`
            ].join(" | ")
        );
    });

    return lines.join("\n");
};
