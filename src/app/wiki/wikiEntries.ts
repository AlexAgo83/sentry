import { ITEM_DEFINITIONS, SKILL_DEFINITIONS, getRecipesForSkill } from "../../data/definitions";
import { DUNGEON_DEFINITIONS } from "../../data/dungeons";
import { EQUIPMENT_DEFINITIONS } from "../../data/equipment";
import type { RecipeDefinition, SkillId } from "../../core/types";
import type { WikiEntry, WikiRouteState, WikiSectionId } from "./wikiModel";

const ITEM_NAME_BY_ID = ITEM_DEFINITIONS.reduce<Record<string, string>>((acc, item) => {
    acc[item.id] = item.name;
    return acc;
}, {});

const formatItemDelta = (delta: Record<string, number> | undefined) => {
    if (!delta) {
        return "None";
    }
    const parts = Object.entries(delta)
        .filter(([, amount]) => Number.isFinite(amount) && amount > 0)
        .map(([itemId, amount]) => `${amount} ${ITEM_NAME_BY_ID[itemId] ?? itemId}`);
    return parts.length > 0 ? parts.join(", ") : "None";
};

const getSkillGroupLabel = (skillId: SkillId) => {
    const definition = SKILL_DEFINITIONS.find((entry) => entry.id === skillId);
    return definition?.name ?? skillId;
};

const buildSkillEntries = (): WikiEntry[] => {
    return SKILL_DEFINITIONS.map((skill) => ({
        id: skill.id,
        section: "skills",
        group: skill.id.startsWith("Combat") ? "Combat" : "Gathering & Crafting",
        title: skill.name,
        subtitle: `${(skill.baseInterval / 1000).toFixed(1)}s base loop`,
        description: skill.id.startsWith("Combat")
            ? "Used automatically during dungeon runs to resolve combat roles."
            : "Train this skill through recipes and use it to unlock stronger outputs over time.",
        tags: [
            skill.id.startsWith("Combat") ? "Combat" : "Utility",
            skill.baseInterval <= 2500 ? "Fast loop" : "Steady loop"
        ],
        facts: [
            { label: "Base interval", value: `${(skill.baseInterval / 1000).toFixed(1)}s` },
            { label: "Recipes", value: String(getRecipesForSkill(skill.id).length) },
            { label: "Role", value: skill.id.startsWith("Combat") ? "Dungeon role" : "Action training" }
        ]
    }));
};

const buildRecipeEntry = (skillId: SkillId, recipe: RecipeDefinition): WikiEntry => ({
    id: recipe.id,
    section: "recipes",
    group: getSkillGroupLabel(skillId),
    title: recipe.name,
    subtitle: `Unlock Lv ${recipe.unlockLevel ?? 1}`,
    description: recipe.description?.trim() || "A repeatable recipe that converts inputs into progression and resources.",
    tags: [
        `T${recipe.rewardProfile?.tier ?? recipe.unlockLevel ?? 1}`,
        recipe.itemCosts ? "Consumes items" : "No input cost",
        recipe.itemRewards || recipe.rareRewards ? "Produces loot" : "Pure XP"
    ],
    facts: [
        { label: "Skill", value: getSkillGroupLabel(skillId) },
        { label: "Base reward", value: `Skill +${recipe.rewardProfile?.skillXpBonus ?? 0} / Recipe +${recipe.rewardProfile?.recipeXpBonus ?? 0}` },
        { label: "Consumes", value: formatItemDelta(recipe.itemCosts) },
        { label: "Produces", value: formatItemDelta(recipe.itemRewards ?? recipe.rareRewards) }
    ]
});

const buildRecipeEntries = (): WikiEntry[] => {
    return SKILL_DEFINITIONS.flatMap((skill) => (
        getRecipesForSkill(skill.id).map((recipe) => buildRecipeEntry(skill.id, recipe))
    ));
};

const ITEM_CATEGORY_BY_ID: Record<string, { group: string; subtitle: string; description: string }> = {
    gold: { group: "Currency", subtitle: "Core currency", description: "Used for roster expansion and shop progression." },
    food: { group: "Consumables", subtitle: "Run sustain", description: "Keeps heroes supplied during dungeon preparation and action loops." },
    meat: { group: "Materials", subtitle: "Common drop", description: "Basic hunting material used in multiple food recipes." },
    bones: { group: "Materials", subtitle: "Common drop", description: "Secondary hunting drop used in sturdier recipes and dungeon prep." },
    herbs: { group: "Materials", subtitle: "Gathered resource", description: "Herbal ingredient for alchemy and healing-focused outputs." },
    fish: { group: "Materials", subtitle: "Gathered resource", description: "Fishing resource that feeds early and mid-tier cooking." },
    cloth: { group: "Materials", subtitle: "Crafting resource", description: "Soft material used in apparel and support-oriented crafts." },
    leather: { group: "Materials", subtitle: "Crafting resource", description: "Durable hide used in armor and utility gear." },
    wood: { group: "Materials", subtitle: "Crafting resource", description: "Flexible construction resource used by carpentry recipes." },
    stone: { group: "Materials", subtitle: "Crafting resource", description: "Heavy base material used in sturdy construction outputs." },
    ore: { group: "Materials", subtitle: "Crafting resource", description: "Raw metal source for smelting and better gear." },
    crystal: { group: "Materials", subtitle: "Arcane material", description: "Refined magical resource used in higher tier crafting." },
    ingot: { group: "Materials", subtitle: "Refined metal", description: "Smelted metal bar used for improved equipment." },
    tools: { group: "Crafted goods", subtitle: "Workshop output", description: "Utility output that supports multiple crafting progressions." },
    artifact: { group: "Crafted goods", subtitle: "Rare output", description: "Advanced crafted object tied to high-end progression." },
    garment: { group: "Crafted goods", subtitle: "Tailored output", description: "Wearable output used in apparel-oriented recipes." },
    armor: { group: "Crafted goods", subtitle: "Forged output", description: "Heavy crafted output tied to defensive progression." },
    furniture: { group: "Crafted goods", subtitle: "Carpentry output", description: "Decorative or structural crafted output." },
    tonic: { group: "Consumables", subtitle: "Potion item", description: "Light recovery item usually found in earlier dungeons." },
    elixir: { group: "Consumables", subtitle: "Potion item", description: "Improved recovery item tied to deeper dungeon tiers." },
    potion: { group: "Consumables", subtitle: "Potion item", description: "Core healing item frequently appearing in dungeon tables." }
};

const buildItemEntries = (): WikiEntry[] => {
    const equipmentIds = new Set(EQUIPMENT_DEFINITIONS.map((item) => item.id));
    return ITEM_DEFINITIONS.map((item) => {
        const equipment = EQUIPMENT_DEFINITIONS.find((entry) => entry.id === item.id);
        if (equipment) {
            return {
                id: item.id,
                section: "items",
                group: "Equipment",
                title: item.name,
                subtitle: `${equipment.slot} gear`,
                description: equipment.acquisitionSource === "dungeon"
                    ? "Equipment with dungeon identity and stronger specialized stat lines."
                    : "Equipable gear used to reinforce a hero build.",
                tags: [
                    equipment.rarityTier === "rare" ? "Rare" : "Core gear",
                    equipment.acquisitionSource === "dungeon" ? "Dungeon drop" : "General gear"
                ],
                facts: [
                    { label: "Slot", value: equipment.slot },
                    { label: "Source", value: equipment.acquisitionSource === "dungeon" ? "Dungeon drop" : "General progression" },
                    {
                        label: "Stats",
                        value: equipment.modifiers.map((modifier) => `${modifier.stat} +${modifier.value}`).join(", ")
                    }
                ]
            } satisfies WikiEntry;
        }

        const meta = ITEM_CATEGORY_BY_ID[item.id] ?? {
            group: "Materials",
            subtitle: "Core resource",
            description: "A reusable item that feeds recipes, progression or dungeon rewards."
        };

        return {
            id: item.id,
            section: "items",
            group: meta.group,
            title: item.name,
            subtitle: meta.subtitle,
            description: meta.description,
            tags: [meta.group],
            facts: [
                { label: "Category", value: meta.group },
                { label: "Use", value: meta.subtitle },
                { label: "Source", value: equipmentIds.has(item.id) ? "Equipment" : "Gameplay reward" }
            ]
        } satisfies WikiEntry;
    });
};

const buildLootIdentity = (entryIds: string[]) => {
    return entryIds
        .map((itemId) => ITEM_NAME_BY_ID[itemId] ?? itemId)
        .join(", ");
};

const buildDungeonEntries = (): WikiEntry[] => {
    return DUNGEON_DEFINITIONS.map((dungeon) => {
        const rareDrops = dungeon.lootTable.entries
            .filter((entry) => entry.weight <= 8)
            .map((entry) => entry.itemId);
        const commonDrops = dungeon.lootTable.entries
            .filter((entry) => entry.weight > 8)
            .map((entry) => entry.itemId);
        return {
            id: dungeon.id,
            section: "dungeons",
            group: `Tier ${dungeon.tier}`,
            title: dungeon.name,
            subtitle: `${dungeon.floorCount} floors · Boss ${dungeon.bossName}`,
            description: "Progression dungeon with escalating reward scaling and a distinct loot identity.",
            tags: [
                `T${dungeon.tier}`,
                `${dungeon.rewardProfile?.combatXpMultiplier.toFixed(2) ?? "1.00"}x Combat XP`,
                `${dungeon.rewardProfile?.bossGoldMultiplier.toFixed(2) ?? "1.00"}x Boss gold`
            ],
            facts: [
                { label: "Recommended power", value: String(dungeon.recommendedPower) },
                { label: "Boss mechanic", value: dungeon.bossMechanic },
                { label: "Loot identity", value: buildLootIdentity([...commonDrops.slice(0, 2), ...rareDrops.slice(0, 2)]) }
            ]
        };
    });
};

export const WIKI_SECTION_INTROS: Record<WikiSectionId, string> = {
    skills: "Learn what each skill is for, how fast it loops, and where it fits in your overall roster plan.",
    recipes: "Recipes are grouped by skill so you can compare unlock pacing, inputs and base rewards at a glance.",
    items: "Items combine core resources, consumables and equipment in one reference surface with lightweight filters.",
    dungeons: "Dungeon entries focus on progression order, boss identity and the kind of loot each run tends to deliver."
};

export const buildWikiEntries = (): WikiEntry[] => {
    return [
        ...buildSkillEntries(),
        ...buildRecipeEntries(),
        ...buildItemEntries(),
        ...buildDungeonEntries()
    ];
};

export const pickWikiRoute = (entries: WikiEntry[], route: WikiRouteState): WikiRouteState => {
    const sectionEntries = entries.filter((entry) => entry.section === route.section);
    if (sectionEntries.length === 0) {
        return route;
    }
    if (route.entryId && sectionEntries.some((entry) => entry.id === route.entryId)) {
        return route;
    }
    return {
        section: route.section,
        entryId: sectionEntries[0]?.id ?? null
    };
};
