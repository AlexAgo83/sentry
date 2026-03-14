import type { GameState, MetaMilestoneState, MetaProgressionState } from "./types";

export type MetaProgressionSnapshot = {
    players: GameState["players"];
    quests: GameState["quests"];
    dungeonCompletionCounts: GameState["dungeon"]["completionCounts"];
    metaProgression: GameState["metaProgression"];
    rosterLimit: GameState["rosterLimit"];
};

export type MetaMilestoneId =
    | "meta_roster_established"
    | "meta_quest_board_regular"
    | "meta_black_sanctuary_breaker"
    | "meta_warband_training";

type MetaMilestoneReward =
    | { type: "freeRosterSlots"; amount: number }
    | { type: "rosterSlotDiscountPct"; amount: number }
    | { type: "restedBuffBonus"; enduranceFlat: number; durationMultiplierBonus: number };

type MetaMilestoneDefinition = {
    id: MetaMilestoneId;
    title: string;
    subtitle: string;
    rewardLabel: string;
    resolveCurrent: (state: MetaProgressionSnapshot) => number;
    target: number;
    rewards: MetaMilestoneReward[];
};

export type MetaMilestoneEntry = {
    id: MetaMilestoneId;
    title: string;
    subtitle: string;
    rewardLabel: string;
    progressLabel: string;
    current: number;
    target: number;
    progressPct: number;
    isCompleted: boolean;
};

export type MetaProgressionEffects = {
    freeRosterSlots: number;
    rosterSlotDiscountPct: number;
    restedEnduranceFlatBonus: number;
    restedDurationMultiplier: number;
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const getCompletedQuestCount = (state: Pick<MetaProgressionSnapshot, "quests">) => (
    Object.values(state.quests.completed ?? {}).filter(Boolean).length
);

const getTotalCombatLevelAcrossRoster = (state: Pick<MetaProgressionSnapshot, "players">) => (
    Object.values(state.players).reduce((total, player) => {
        const levels = [
            player.skills.CombatMelee?.level ?? 0,
            player.skills.CombatRanged?.level ?? 0,
            player.skills.CombatMagic?.level ?? 0
        ];
        return total + Math.max(...levels);
    }, 0)
);

const getBlackSanctuaryClearCount = (state: Pick<MetaProgressionSnapshot, "dungeonCompletionCounts">) => (
    state.dungeonCompletionCounts?.dungeon_sanctuaire_noir ?? 0
);

export const META_MILESTONE_DEFINITIONS: MetaMilestoneDefinition[] = [
    {
        id: "meta_roster_established",
        title: "Town Charter",
        subtitle: "Recruit 4 heroes to stabilize your roster.",
        rewardLabel: "+1 roster slot",
        resolveCurrent: (state) => Object.keys(state.players).length,
        target: 4,
        rewards: [{ type: "freeRosterSlots", amount: 1 }]
    },
    {
        id: "meta_quest_board_regular",
        title: "Quest Ledger",
        subtitle: "Complete 6 quests to earn better expansion terms.",
        rewardLabel: "-15% roster expansion cost",
        resolveCurrent: getCompletedQuestCount,
        target: 6,
        rewards: [{ type: "rosterSlotDiscountPct", amount: 0.15 }]
    },
    {
        id: "meta_black_sanctuary_breaker",
        title: "Sanctuary Breaker",
        subtitle: "Clear Black Sanctuary to prove your roster can push deeper.",
        rewardLabel: "+1 roster slot",
        resolveCurrent: getBlackSanctuaryClearCount,
        target: 1,
        rewards: [{ type: "freeRosterSlots", amount: 1 }]
    },
    {
        id: "meta_warband_training",
        title: "Warcamp Discipline",
        subtitle: "Reach 60 total combat levels across your roster.",
        rewardLabel: "Rested buff +1 END · +50% duration",
        resolveCurrent: getTotalCombatLevelAcrossRoster,
        target: 60,
        rewards: [{ type: "restedBuffBonus", enduranceFlat: 1, durationMultiplierBonus: 0.5 }]
    }
];

const EMPTY_MILESTONE: MetaMilestoneState = {
    completedAt: null
};

export const createMetaProgressionState = (): MetaProgressionState => ({
    milestones: META_MILESTONE_DEFINITIONS.reduce<Record<string, MetaMilestoneState>>((acc, definition) => {
        acc[definition.id] = { ...EMPTY_MILESTONE };
        return acc;
    }, {})
});

export const normalizeMetaProgressionState = (input?: MetaProgressionState | null): MetaProgressionState => ({
    milestones: META_MILESTONE_DEFINITIONS.reduce<Record<string, MetaMilestoneState>>((acc, definition) => {
        const completedAtRaw = input?.milestones?.[definition.id]?.completedAt;
        acc[definition.id] = {
            completedAt: Number.isFinite(completedAtRaw) ? Math.max(0, Math.floor(completedAtRaw as number)) : null
        };
        return acc;
    }, {})
});

export const buildMetaMilestoneEntries = (state: MetaProgressionSnapshot): MetaMilestoneEntry[] => {
    const normalized = normalizeMetaProgressionState(state.metaProgression);
    return META_MILESTONE_DEFINITIONS.map((definition) => {
        const current = Math.max(0, Math.floor(definition.resolveCurrent(state)));
        const safeTarget = Math.max(1, definition.target);
        const isCompleted = Boolean(normalized.milestones[definition.id]?.completedAt);
        return {
            id: definition.id,
            title: definition.title,
            subtitle: definition.subtitle,
            rewardLabel: definition.rewardLabel,
            progressLabel: isCompleted ? "Unlocked" : `${Math.min(current, safeTarget)}/${safeTarget}`,
            current,
            target: safeTarget,
            progressPct: isCompleted ? 100 : clampPercent((current / safeTarget) * 100),
            isCompleted
        };
    }).sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));
};

export const resolveMetaProgressionEffects = (metaProgression: MetaProgressionState | null | undefined): MetaProgressionEffects => {
    const normalized = normalizeMetaProgressionState(metaProgression);
    return META_MILESTONE_DEFINITIONS.reduce<MetaProgressionEffects>((acc, definition) => {
        if (!normalized.milestones[definition.id]?.completedAt) {
            return acc;
        }
        definition.rewards.forEach((reward) => {
            if (reward.type === "freeRosterSlots") {
                acc.freeRosterSlots += reward.amount;
                return;
            }
            if (reward.type === "rosterSlotDiscountPct") {
                acc.rosterSlotDiscountPct += reward.amount;
                return;
            }
            acc.restedEnduranceFlatBonus += reward.enduranceFlat;
            acc.restedDurationMultiplier += reward.durationMultiplierBonus;
        });
        return acc;
    }, {
        freeRosterSlots: 0,
        rosterSlotDiscountPct: 0,
        restedEnduranceFlatBonus: 0,
        restedDurationMultiplier: 1
    });
};

export const getEffectiveRosterLimit = (state: Pick<GameState, "rosterLimit" | "metaProgression">) => {
    return Math.max(1, state.rosterLimit + resolveMetaProgressionEffects(state.metaProgression).freeRosterSlots);
};

export const pickMetaProgressionSnapshot = (state: Pick<GameState, "players" | "quests" | "dungeon" | "metaProgression" | "rosterLimit">): MetaProgressionSnapshot => ({
    players: state.players,
    quests: state.quests,
    dungeonCompletionCounts: state.dungeon.completionCounts,
    metaProgression: state.metaProgression,
    rosterLimit: state.rosterLimit
});

export const evaluateMetaProgression = (
    metaProgression: MetaProgressionState | null | undefined,
    state: MetaProgressionSnapshot,
    timestamp: number
): { metaProgression: MetaProgressionState; newlyCompleted: MetaMilestoneId[] } => {
    const normalized = normalizeMetaProgressionState(metaProgression);
    const nextMilestones = { ...normalized.milestones };
    const newlyCompleted: MetaMilestoneId[] = [];

    META_MILESTONE_DEFINITIONS.forEach((definition) => {
        const current = definition.resolveCurrent(state);
        if (current < definition.target) {
            return;
        }
        if (nextMilestones[definition.id]?.completedAt) {
            return;
        }
        nextMilestones[definition.id] = {
            completedAt: timestamp
        };
        newlyCompleted.push(definition.id);
    });

    return {
        metaProgression: {
            milestones: nextMilestones
        },
        newlyCompleted
    };
};

export const getMetaMilestoneDefinition = (milestoneId: MetaMilestoneId) => (
    META_MILESTONE_DEFINITIONS.find((definition) => definition.id === milestoneId) ?? null
);
