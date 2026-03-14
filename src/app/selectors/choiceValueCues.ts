import { getRecipeTrivialityMultiplier, resolveRecipeRewardProfile, resolveDungeonRewardProfile } from "../../core/rewards";
import { resolveDungeonRiskTier } from "../../core/dungeon";
import type { DungeonDefinition, RecipeDefinition } from "../../core/types";

export type ChoiceCueTone = "good" | "neutral" | "warn" | "danger";

export interface ChoiceValueCue {
    label: string;
    tone: ChoiceCueTone;
}

export interface DungeonValueCues {
    readiness: ChoiceValueCue | null;
    rewardFocus: ChoiceValueCue;
}

export interface RecipeValueCues {
    progressionFit: ChoiceValueCue;
    rewardFocus: ChoiceValueCue;
}

const createCue = (label: string, tone: ChoiceCueTone): ChoiceValueCue => ({ label, tone });

export const getDungeonValueCues = (
    definition: DungeonDefinition,
    currentPower: number,
    usesPartyPower: boolean
): DungeonValueCues => {
    const readiness = usesPartyPower
        ? (() => {
            const recommendedPower = definition.recommendedPower * 2;
            const riskTier = resolveDungeonRiskTier(currentPower, recommendedPower);
            if (riskTier === "Low") {
                return createCue("Farm-ready", "good");
            }
            if (riskTier === "Medium") {
                return createCue("On curve", "neutral");
            }
            if (riskTier === "High") {
                return createCue("Stretch clear", "warn");
            }
            return createCue("Push later", "danger");
        })()
        : null;

    const rewardProfile = resolveDungeonRewardProfile(definition);
    const rewardFocus = definition.tier >= 8
        ? createCue("Apex loot", "danger")
        : definition.tier >= 5
            ? createCue("Rare drops + XP", "warn")
            : rewardProfile.combatXpMultiplier >= 1.2
                ? createCue("Combat XP", "neutral")
                : createCue("Starter progression", "good");

    return {
        readiness,
        rewardFocus
    };
};

export const getRecipeValueCues = (
    recipeDef: RecipeDefinition,
    skillLevel: number,
    unlocked: boolean,
    hasEquipableOutput: boolean
): RecipeValueCues => {
    const unlockLevel = recipeDef.unlockLevel ?? 1;
    const rewardProfile = resolveRecipeRewardProfile(recipeDef);

    const progressionFit = !unlocked
        ? createCue(unlockLevel - skillLevel <= 5 ? "Next unlock" : "Future unlock", "neutral")
        : (() => {
            const triviality = getRecipeTrivialityMultiplier(skillLevel, recipeDef);
            if (triviality < 0.9) {
                return createCue("Low XP", "warn");
            }
            if (skillLevel <= unlockLevel + 2) {
                return createCue("Great next step", "good");
            }
            return createCue("Steady training", "neutral");
        })();

    const rewardFocus = hasEquipableOutput
        ? createCue("Gear craft", "good")
        : rewardProfile.tier >= 4
            ? createCue("High XP", "warn")
            : rewardProfile.tier >= 3
                ? createCue("Strong XP", "neutral")
                : createCue("Basic output", "neutral");

    return {
        progressionFit,
        rewardFocus
    };
};
