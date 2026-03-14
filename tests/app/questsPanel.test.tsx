import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuestsPanel } from "../../src/app/components/QuestsPanel";

const baseProps = {
    isCollapsed: false,
    onToggleCollapsed: () => {},
    completedCount: 1,
    totalCount: 4,
    completedMilestoneCount: 1,
    totalMilestoneCount: 4,
    milestones: [
        {
            id: "meta_roster_established",
            title: "Town Charter",
            subtitle: "Recruit 4 heroes to stabilize your roster.",
            rewardLabel: "+1 roster slot",
            progressLabel: "Unlocked",
            progressPct: 100,
            isCompleted: true
        },
        {
            id: "meta_quest_board_regular",
            title: "Quest Ledger",
            subtitle: "Complete 6 quests to earn better expansion terms.",
            rewardLabel: "-15% roster expansion cost",
            progressLabel: "2/6",
            progressPct: 33,
            isCompleted: false
        }
    ],
    tutorialQuests: [
        {
            id: "quest:tutorial:collect_meat",
            title: "Collect 100 Meat",
            subtitle: "Tutorial",
            progressLabel: "Collected 10/100",
            rewardGold: 60,
            isCompleted: false
        }
    ],
    skillQuests: [
        {
            id: "quest:skill:combat",
            title: "Reach Roaming Lv 10",
            subtitle: "Skill milestone",
            progressLabel: "Lv 8/10",
            rewardGold: 100,
            isCompleted: false
        }
    ],
    craftQuests: [
        {
            id: "quest:craft:cloth_cap",
            title: "Craft Cloth Cap x10",
            subtitle: "Equipable item",
            progressLabel: "Completed",
            rewardGold: 70,
            isCompleted: true
        },
        {
            id: "quest:craft:traveler_cape",
            title: "Craft Traveler Cape x10",
            subtitle: "Equipable item",
            progressLabel: "Crafted 4/10",
            rewardGold: 80,
            isCompleted: false
        }
    ]
};

describe("QuestsPanel", () => {
    it("renders sections and progress labels", () => {
        render(<QuestsPanel {...baseProps} />);
        expect(screen.getByText("Quests")).toBeTruthy();
        expect(screen.getAllByText("1/4")).toHaveLength(2);
        expect(screen.getByText("Milestones")).toBeTruthy();
        expect(screen.getByText("Town Charter")).toBeTruthy();
        expect(screen.getByText("Unlock: -15% roster expansion cost")).toBeTruthy();
        expect(screen.getByText("Quest Ledger")).toBeTruthy();
        expect(screen.getByText("Unlocked milestones")).toBeTruthy();
        expect(screen.getByText("Tutorial Quests")).toBeTruthy();
        expect(screen.getByText("Skill Quests")).toBeTruthy();
        expect(screen.getByText("Craft Quests")).toBeTruthy();
        expect(screen.getByText("Lv 8/10")).toBeTruthy();
        expect(screen.getByText("Completed")).toBeTruthy();
    });

    it("marks completed quests with completed styling", () => {
        const { container } = render(<QuestsPanel {...baseProps} />);
        const completedTile = container.querySelector(".ts-quest-tile.is-completed");
        expect(completedTile).toBeTruthy();
        expect(screen.getByText("Town Charter")).toBeTruthy();
    });
});
