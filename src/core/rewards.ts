import type {
    ActionDefinition,
    DungeonDefinition,
    DungeonRewardProfile,
    RecipeDefinition,
    RecipeRewardProfile
} from "./types";

const roundTo = (value: number, digits = 2) => {
    const precision = 10 ** digits;
    return Math.round(value * precision) / precision;
};

export const getRecipeRewardTier = (unlockLevel: number) => {
    if (unlockLevel >= 30) {
        return 4;
    }
    if (unlockLevel >= 20) {
        return 3;
    }
    if (unlockLevel >= 10) {
        return 2;
    }
    return 1;
};

export const createRecipeRewardProfile = (
    unlockLevel: number,
    overrides?: Partial<RecipeRewardProfile>
): RecipeRewardProfile => {
    const tier = getRecipeRewardTier(unlockLevel);
    const baseProfileByTier: Record<number, RecipeRewardProfile> = {
        1: {
            tier: 1,
            skillXpBonus: 0,
            recipeXpBonus: 0,
            trivialityStartOffset: 10,
            trivialityPenaltyStep: 10,
            trivialityPenaltyPerStep: 0.1,
            minTrivialityMultiplier: 0.7
        },
        2: {
            tier: 2,
            skillXpBonus: 1,
            recipeXpBonus: 1,
            trivialityStartOffset: 10,
            trivialityPenaltyStep: 10,
            trivialityPenaltyPerStep: 0.1,
            minTrivialityMultiplier: 0.72
        },
        3: {
            tier: 3,
            skillXpBonus: 1,
            recipeXpBonus: 2,
            trivialityStartOffset: 12,
            trivialityPenaltyStep: 10,
            trivialityPenaltyPerStep: 0.08,
            minTrivialityMultiplier: 0.76
        },
        4: {
            tier: 4,
            skillXpBonus: 2,
            recipeXpBonus: 3,
            trivialityStartOffset: 14,
            trivialityPenaltyStep: 10,
            trivialityPenaltyPerStep: 0.08,
            minTrivialityMultiplier: 0.8
        }
    };

    return {
        ...baseProfileByTier[tier],
        ...overrides,
        tier: overrides?.tier ?? tier
    };
};

export const createDungeonRewardProfile = (
    tier: number,
    overrides?: Partial<DungeonRewardProfile>
): DungeonRewardProfile => {
    const safeTier = Number.isFinite(tier) ? Math.max(1, tier) : 1;
    return {
        combatXpMultiplier: roundTo(1 + ((safeTier - 1) * 0.1)),
        bossGoldMultiplier: roundTo(1 + ((safeTier - 1) * 0.12)),
        ...overrides,
        tier: overrides?.tier ?? safeTier
    };
};

export const resolveRecipeRewardProfile = (recipeDef: RecipeDefinition | null | undefined): RecipeRewardProfile => {
    if (recipeDef?.rewardProfile) {
        return recipeDef.rewardProfile;
    }
    return createRecipeRewardProfile(recipeDef?.unlockLevel ?? 1);
};

export const resolveDungeonRewardProfile = (definition: DungeonDefinition | null | undefined): DungeonRewardProfile => {
    if (definition?.rewardProfile) {
        return definition.rewardProfile;
    }
    return createDungeonRewardProfile(definition?.tier ?? 1);
};

export const getRecipeTrivialityMultiplier = (
    skillLevel: number,
    recipeDef: RecipeDefinition | null | undefined
) => {
    if (!Number.isFinite(skillLevel) || !recipeDef) {
        return 1;
    }
    const rewardProfile = resolveRecipeRewardProfile(recipeDef);
    const unlockLevel = recipeDef.unlockLevel ?? 1;
    const trivialityStartLevel = unlockLevel + rewardProfile.trivialityStartOffset;
    if (skillLevel <= trivialityStartLevel) {
        return 1;
    }
    const safePenaltyStep = Math.max(1, rewardProfile.trivialityPenaltyStep);
    const steps = Math.floor((skillLevel - trivialityStartLevel - 1) / safePenaltyStep) + 1;
    const penalty = steps * rewardProfile.trivialityPenaltyPerStep;
    return roundTo(Math.max(rewardProfile.minTrivialityMultiplier, 1 - penalty));
};

export const getActionProgressionGains = ({
    actionDef,
    recipeDef,
    skillLevel,
    xpMultiplier = 1
}: {
    actionDef: ActionDefinition;
    recipeDef: RecipeDefinition | null | undefined;
    skillLevel: number;
    xpMultiplier?: number;
}) => {
    const rewardProfile = resolveRecipeRewardProfile(recipeDef);
    const trivialityMultiplier = getRecipeTrivialityMultiplier(skillLevel, recipeDef);
    const skillXp = roundTo(
        (actionDef.xpSkill + rewardProfile.skillXpBonus) * xpMultiplier * trivialityMultiplier
    );
    const recipeXp = roundTo(
        (actionDef.xpRecipe + rewardProfile.recipeXpBonus) * xpMultiplier * trivialityMultiplier
    );

    return {
        rewardProfile,
        trivialityMultiplier,
        skillXp,
        recipeXp,
        totalXp: roundTo(skillXp + recipeXp)
    };
};

export const getDungeonBossGoldReward = (definition: DungeonDefinition) => {
    const baseGoldReward = Math.max(25, definition.tier * 75);
    return Math.max(0, Math.round(baseGoldReward * resolveDungeonRewardProfile(definition).bossGoldMultiplier));
};
