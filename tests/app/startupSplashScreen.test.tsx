import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StartupSplashScreen } from "../../src/app/components/StartupSplashScreen";

describe("StartupSplashScreen", () => {
    it("focuses the continue button when ready", () => {
        render(<StartupSplashScreen isReady onContinue={vi.fn()} />);

        const continueButton = screen.getByRole("button", { name: "Continue" });
        expect(document.activeElement).toBe(continueButton);
    });

    it("focuses the dialog container when continue is disabled", () => {
        render(<StartupSplashScreen isReady={false} onContinue={vi.fn()} />);

        const dialog = screen.getByRole("dialog", { name: "Loading" });
        expect(document.activeElement).toBe(dialog);
    });

    it("renders progress metadata while loading", () => {
        render(
            <StartupSplashScreen
                isReady={false}
                progressPct={42}
                stageLabel="Simulating offline progression"
                detail="Processing tick 12 / 100"
                onContinue={vi.fn()}
            />
        );

        expect(screen.getByRole("progressbar", { name: "Startup progress" })).toBeTruthy();
        expect(screen.getByText("42% - Simulating offline progression")).toBeTruthy();
        expect(screen.getByText("Processing tick 12 / 100")).toBeTruthy();
    });
});
