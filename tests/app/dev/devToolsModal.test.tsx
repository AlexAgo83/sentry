import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DevToolsModal } from "../../../src/app/components/DevToolsModal";

describe("DevToolsModal", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        window.localStorage.removeItem("sentry.debug.renderCounts");
        window.localStorage.removeItem("sentry.debug.profiler");
    });

    it("toggles localStorage flags and exposes renderCounts actions", () => {
        const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
        const onSetOnboardingEnabled = vi.fn();
        const onResetOnboarding = vi.fn();
        render(
            <DevToolsModal
                onboardingEnabled={true}
                onSetOnboardingEnabled={onSetOnboardingEnabled}
                onResetOnboarding={onResetOnboarding}
                onClose={() => {}}
                onSimulateOffline={() => {}}
                onSimulateOfflineHour={() => {}}
                onSimulateOfflineDay={() => {}}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Disable onboarding" }));
        expect(onSetOnboardingEnabled).toHaveBeenCalledWith(false);

        fireEvent.click(screen.getByRole("button", { name: "Reset onboarding" }));
        expect(onResetOnboarding).toHaveBeenCalledTimes(1);

        const printButton = screen.getByRole("button", { name: "Print renderCounts" });
        const resetButton = screen.getByRole("button", { name: "Reset renderCounts" });
        expect((printButton as HTMLButtonElement).disabled).toBe(true);
        expect((resetButton as HTMLButtonElement).disabled).toBe(true);

        fireEvent.click(screen.getByRole("button", { name: "Toggle renderCounts" }));
        expect(window.localStorage.getItem("sentry.debug.renderCounts")).toBe("1");
        expect((printButton as HTMLButtonElement).disabled).toBe(false);
        expect((resetButton as HTMLButtonElement).disabled).toBe(false);

        fireEvent.click(printButton);
        expect(spy).toHaveBeenCalledWith("[renderCounts]", expect.any(Object));

        fireEvent.click(resetButton);
        expect(spy).toHaveBeenCalledWith("[renderCounts] reset");

        fireEvent.click(screen.getByRole("button", { name: "Toggle profiler" }));
        expect(window.localStorage.getItem("sentry.debug.profiler")).toBe("1");
    });
});
