import { describe, expect, it } from "vitest";
import { resolveOnboardingSurface } from "../../src/app/onboarding";

const baseOnboarding = {
    enabled: true,
    introStepIndex: 0,
    dismissedHintIds: {}
} as const;

describe("resolveOnboardingSurface", () => {
    it("shows intro steps before contextual hints", () => {
        expect(resolveOnboardingSurface({
            onboarding: baseOnboarding,
            activeScreen: "main",
            activeSidePanel: "action",
            playerCount: 1,
            isBlocked: false,
            hasCompletedQuest: false
        })).toMatchObject({
            kind: "intro",
            id: "welcome"
        });

        expect(resolveOnboardingSurface({
            onboarding: { ...baseOnboarding, introStepIndex: 1 },
            activeScreen: "main",
            activeSidePanel: "action",
            playerCount: 1,
            isBlocked: false,
            hasCompletedQuest: false
        })).toMatchObject({
            kind: "intro",
            id: "first_steps"
        });
    });

    it("switches to contextual hints after intro is done", () => {
        expect(resolveOnboardingSurface({
            onboarding: { ...baseOnboarding, introStepIndex: 2 },
            activeScreen: "main",
            activeSidePanel: "shop",
            playerCount: 2,
            isBlocked: false,
            hasCompletedQuest: false
        })).toMatchObject({
            kind: "hint",
            id: "shop"
        });
    });

    it("suppresses dismissed or blocked hints", () => {
        expect(resolveOnboardingSurface({
            onboarding: {
                enabled: true,
                introStepIndex: 2,
                dismissedHintIds: { shop: true }
            },
            activeScreen: "main",
            activeSidePanel: "shop",
            playerCount: 2,
            isBlocked: false,
            hasCompletedQuest: false
        })).toBeNull();

        expect(resolveOnboardingSurface({
            onboarding: { ...baseOnboarding, introStepIndex: 2 },
            activeScreen: "dungeon",
            activeSidePanel: "action",
            playerCount: 4,
            isBlocked: true,
            hasCompletedQuest: false
        })).toBeNull();
    });
});
