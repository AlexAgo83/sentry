import { describe, expect, it } from "vitest";

import { getDungeonValueCues, getRecipeValueCues } from "../../../src/app/selectors/choiceValueCues";
import { DUNGEON_DEFINITIONS } from "../../../src/data/dungeons";
import { getRecipeDefinition } from "../../../src/data/definitions";

describe("choice value cues", () => {
    it("derives dungeon readiness and reward focus cues", () => {
        const definition = DUNGEON_DEFINITIONS.find((entry) => entry.id === "dungeon_sanctuaire_noir");
        expect(definition).toBeTruthy();
        if (!definition) {
            return;
        }

        const cues = getDungeonValueCues(definition, 24, true);

        expect(cues.readiness?.label).toBe("Close call");
        expect(cues.rewardFocus.label).toBe("Combat XP");
    });

    it("derives recipe progression fit and reward cues", () => {
        const recipe = getRecipeDefinition("Roaming", "roaming_heroic_siege");
        expect(recipe).toBeTruthy();
        if (!recipe) {
            return;
        }

        const cues = getRecipeValueCues(recipe, 30, true, false);

        expect(cues.progressionFit.label).toBe("Great next step");
        expect(cues.rewardFocus.label).toBe("High XP");
    });
});
