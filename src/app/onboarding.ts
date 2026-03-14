import type { AppActiveScreen, AppActiveSidePanel } from "./AppView";
import type { OnboardingUiState } from "../core/types";

export type OnboardingIntroStepId = "welcome" | "first_steps";
export type OnboardingHintId = "action" | "inventory" | "dungeon" | "shop" | "quests";

export type OnboardingSurface =
    | {
        kind: "intro";
        id: OnboardingIntroStepId;
        title: string;
        body: string;
        primaryLabel: string;
        secondaryLabel: string;
    }
    | {
        kind: "hint";
        id: OnboardingHintId;
        title: string;
        body: string;
    };

export type ResolveOnboardingSurfaceInput = {
    onboarding: OnboardingUiState;
    activeScreen: AppActiveScreen;
    activeSidePanel: AppActiveSidePanel;
    playerCount: number;
    isBlocked: boolean;
    hasCompletedQuest: boolean;
};

const INTRO_STEPS: Array<Omit<Extract<OnboardingSurface, { kind: "intro" }>, "kind">> = [
    {
        id: "welcome",
        title: "Welcome to Sentry",
        body: "Train heroes, gear them up, then push deeper dungeons when your roster is ready.",
        primaryLabel: "Next",
        secondaryLabel: "Skip tips"
    },
    {
        id: "first_steps",
        title: "First priorities",
        body: "Start with hero actions, watch Quests for milestones, then recruit up to four heroes to unlock dungeon runs.",
        primaryLabel: "Start exploring",
        secondaryLabel: "Skip tips"
    }
];

const HINTS: Record<OnboardingHintId, Omit<Extract<OnboardingSurface, { kind: "hint" }>, "kind">> = {
    action: {
        id: "action",
        title: "Action panel",
        body: "Pick a skill, then choose a recipe to train it and generate resources over time."
    },
    inventory: {
        id: "inventory",
        title: "Inventory",
        body: "Use Inventory and Equip to inspect drops, compare gear and improve each hero build."
    },
    dungeon: {
        id: "dungeon",
        title: "Dungeon setup",
        body: "Dungeon runs need four available heroes. Use readiness cues to judge whether your party is prepared."
    },
    shop: {
        id: "shop",
        title: "Shop upgrades",
        body: "Expand your roster here and check long-term account bonuses as your milestones unlock."
    },
    quests: {
        id: "quests",
        title: "Quest board",
        body: "Quest and milestone rewards are a reliable guide for what to do next."
    }
};

export const resolveOnboardingSurface = ({
    onboarding,
    activeScreen,
    activeSidePanel,
    playerCount,
    isBlocked,
    hasCompletedQuest
}: ResolveOnboardingSurfaceInput): OnboardingSurface | null => {
    if (!onboarding.enabled || isBlocked || playerCount <= 0) {
        return null;
    }

    const introStep = INTRO_STEPS[onboarding.introStepIndex];
    const shouldShowIntro = onboarding.introStepIndex < INTRO_STEPS.length && playerCount <= 3 && !hasCompletedQuest;
    if (shouldShowIntro && introStep) {
        return { kind: "intro", ...introStep };
    }

    const pickHint = (hintId: OnboardingHintId) => {
        if (onboarding.dismissedHintIds[hintId]) {
            return null;
        }
        return { kind: "hint", ...HINTS[hintId] } satisfies OnboardingSurface;
    };

    if (activeScreen === "dungeon") {
        return pickHint("dungeon");
    }

    if (activeScreen !== "main") {
        return null;
    }

    switch (activeSidePanel) {
        case "action":
            return pickHint("action");
        case "inventory":
        case "equipment":
            return pickHint("inventory");
        case "shop":
            return pickHint("shop");
        case "quests":
            return pickHint("quests");
        default:
            return null;
    }
};
