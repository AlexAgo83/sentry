import { describe, expect, it } from "vitest";
import { OFFLINE_SUMMARY_PREVIEW, shouldForceOfflineSummaryPreview } from "../../src/app/offlineSummaryPreview";

describe("offlineSummaryPreview", () => {
    it("enables the preview only for local dev when explicitly requested", () => {
        expect(shouldForceOfflineSummaryPreview({
            DEV: true,
            MODE: "development",
            VITE_FORCE_OFFLINE_SUMMARY_PREVIEW: "1"
        })).toBe(true);

        expect(shouldForceOfflineSummaryPreview({
            DEV: true,
            MODE: "test",
            VITE_FORCE_OFFLINE_SUMMARY_PREVIEW: "1"
        })).toBe(false);

        expect(shouldForceOfflineSummaryPreview({
            DEV: false,
            MODE: "production",
            VITE_FORCE_OFFLINE_SUMMARY_PREVIEW: "1"
        })).toBe(false);

        expect(shouldForceOfflineSummaryPreview({
            DEV: true,
            MODE: "development",
            VITE_E2E: true,
            VITE_FORCE_OFFLINE_SUMMARY_PREVIEW: "1"
        })).toBe(false);
    });

    it("ships a stable preview payload with player and inventory data", () => {
        expect(OFFLINE_SUMMARY_PREVIEW.players).toHaveLength(2);
        expect(OFFLINE_SUMMARY_PREVIEW.players[0]?.playerName).toBe("Astra");
        expect(OFFLINE_SUMMARY_PREVIEW.totalItemDeltas.gold).toBe(42);
        expect(OFFLINE_SUMMARY_PREVIEW.ticks).toBeGreaterThan(0);
    });
});
