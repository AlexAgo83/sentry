import type { OfflineSummaryState } from "../core/types";

export const shouldForceOfflineSummaryPreview = (env: {
    DEV?: boolean;
    MODE?: string;
    VITE_E2E?: boolean | string;
    VITE_FORCE_OFFLINE_SUMMARY_PREVIEW?: string;
}) => {
    return Boolean(
        env.DEV
        && env.MODE !== "test"
        && !env.VITE_E2E
        && env.VITE_FORCE_OFFLINE_SUMMARY_PREVIEW === "1"
    );
};

export const OFFLINE_SUMMARY_PREVIEW: OfflineSummaryState = {
    durationMs: 5_400_000,
    processedMs: 5_400_000,
    ticks: 1_080,
    capped: false,
    totalItemDeltas: {
        bones: 18,
        meat: 7,
        gold: 42
    },
    players: [
        {
            playerId: "preview-1",
            playerName: "Astra",
            actionId: "Hunting",
            recipeId: "hunt_small_game",
            skillXpGained: 128,
            recipeXpGained: 84,
            skillLevelGained: 1,
            recipeLevelGained: 1,
            itemDeltas: {
                bones: 12,
                meat: 7
            },
            dungeonGains: {
                combatXp: {},
                itemDeltas: {}
            }
        },
        {
            playerId: "preview-2",
            playerName: "Bram",
            actionId: null,
            recipeId: null,
            isInDungeon: true,
            skillXpGained: 0,
            recipeXpGained: 0,
            skillLevelGained: 0,
            recipeLevelGained: 0,
            itemDeltas: {},
            dungeonGains: {
                combatXp: {
                    CombatMelee: 64
                },
                itemDeltas: {
                    gold: 42,
                    bones: 6
                }
            }
        }
    ]
};
