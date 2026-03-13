import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DUNGEON_DEFINITIONS } from "../../src/data/dungeons";
import { DungeonSetupView } from "../../src/app/components/dungeonScreen/components/DungeonSetupView";

describe("DungeonSetupView", () => {
    it("shows reward payoff cues for higher-tier dungeons", () => {
        render(
            <DungeonSetupView
                definitions={[DUNGEON_DEFINITIONS[4]!]}
                selectedDungeonId={DUNGEON_DEFINITIONS[4]!.id}
                safeCompletionCounts={{}}
                usesPartyPower={false}
                currentPower={0}
                riskTooltip="Risk"
                onSelectDungeon={() => {}}
                canEnterDungeon={false}
                sortedPlayers={[]}
                selectedPartyPlayerIds={[]}
                unavailablePartyPlayerIds={[]}
                combatLabelBySkillId={{}}
                onTogglePartyPlayer={() => {}}
                hasPartySelection={false}
                safeRequiredFoodForStart={1}
                safeFoodCount={0}
                hasEnoughFood={false}
                itemNameById={{}}
                discoveredItemIds={{}}
                inventoryItems={{}}
            />
        );

        expect(screen.getByText("Reward T5 · Combat XP x1.40 · Boss gold x1.48")).toBeTruthy();
    });
});
