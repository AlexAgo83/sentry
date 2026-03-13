import { describe, expect, it } from "vitest";
import {
    createDungeonRewardProfile,
    createRecipeRewardProfile,
    getActionProgressionGains,
    getDungeonBossGoldReward
} from "../../src/core/rewards";
import type { ActionDefinition, DungeonDefinition, RecipeDefinition } from "../../src/core/types";

const baseActionDefinition: ActionDefinition = {
    id: "Roaming",
    skillId: "Roaming",
    staminaCost: 10,
    goldReward: 1,
    xpSkill: 1,
    xpRecipe: 2,
    stunTime: 5_000
};

describe("reward calculators", () => {
    it("gives higher-tier recipes better progression payoff than trivial starter recipes", () => {
        const lowTierRecipe: RecipeDefinition = {
            id: "roaming_skirmish",
            skillId: "Roaming",
            name: "Border Skirmish",
            unlockLevel: 1,
            rewardProfile: createRecipeRewardProfile(1)
        };
        const highTierRecipe: RecipeDefinition = {
            id: "roaming_heroic_siege",
            skillId: "Roaming",
            name: "Heroic Siege",
            unlockLevel: 30,
            rewardProfile: createRecipeRewardProfile(30)
        };

        const trivialStarterGains = getActionProgressionGains({
            actionDef: baseActionDefinition,
            recipeDef: lowTierRecipe,
            skillLevel: 30
        });
        const highTierGains = getActionProgressionGains({
            actionDef: baseActionDefinition,
            recipeDef: highTierRecipe,
            skillLevel: 30
        });

        expect(trivialStarterGains.trivialityMultiplier).toBeLessThan(1);
        expect(highTierGains.trivialityMultiplier).toBe(1);
        expect(highTierGains.skillXp).toBeGreaterThan(trivialStarterGains.skillXp);
        expect(highTierGains.recipeXp).toBeGreaterThan(trivialStarterGains.recipeXp);
        expect(highTierGains.totalXp).toBeGreaterThan(trivialStarterGains.totalXp);
    });

    it("gives higher-tier dungeons stronger boss gold multipliers", () => {
        const tierOneDungeon: DungeonDefinition = {
            id: "dungeon_ruines_humides",
            name: "Damp Ruins",
            tier: 1,
            floorCount: 10,
            recommendedPower: 1,
            bossName: "Fenwatch Brute",
            bossMechanic: "burst",
            rewardProfile: createDungeonRewardProfile(1),
            lootTable: { rewardsPerClear: 1, entries: [] }
        };
        const tierEightDungeon: DungeonDefinition = {
            ...tierOneDungeon,
            id: "dungeon_trone_braise",
            name: "Ember Throne",
            tier: 8,
            rewardProfile: createDungeonRewardProfile(8)
        };

        expect(tierEightDungeon.rewardProfile?.combatXpMultiplier).toBeGreaterThan(
            tierOneDungeon.rewardProfile?.combatXpMultiplier ?? 0
        );
        expect(getDungeonBossGoldReward(tierEightDungeon)).toBeGreaterThan(getDungeonBossGoldReward(tierOneDungeon));
    });
});
