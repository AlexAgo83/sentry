import { afterEach, describe, expect, it, vi } from "vitest";
import { attachCloudE2EBridge } from "../../../../src/app/hooks/cloudSave/cloudSaveBridge";

describe("attachCloudE2EBridge", () => {
    afterEach(() => {
        delete (window as unknown as { __E2E__?: Record<string, unknown> }).__E2E__;
    });

    it("hydrates access token and snapshot through the E2E bridge", () => {
        const setAccessToken = vi.fn();
        const setIsBackendAwake = vi.fn();
        const setWarmupRetrySeconds = vi.fn();
        const setError = vi.fn();
        const setStatus = vi.fn();
        const setHasCloudSave = vi.fn();
        const setCloudPayload = vi.fn();
        const setCloudMeta = vi.fn();
        const setCloudHasActiveDungeonRun = vi.fn();
        const setLastSyncAt = vi.fn();

        const detach = attachCloudE2EBridge({
            isEnabled: true,
            isAvailable: true,
            setAccessToken,
            setIsBackendAwake,
            setWarmupRetrySeconds,
            setError,
            setStatus,
            setHasCloudSave,
            setCloudPayload,
            setCloudMeta,
            setCloudHasActiveDungeonRun,
            setLastSyncAt
        });

        const bridge = (window as unknown as { __E2E__?: Record<string, (...args: unknown[]) => void> }).__E2E__;
        expect(bridge?.setCloudAccessToken).toBeTypeOf("function");
        expect(bridge?.setCloudSnapshot).toBeTypeOf("function");

        bridge?.setCloudAccessToken?.("token-123");
        expect(setAccessToken).toHaveBeenCalledWith("token-123");
        expect(setStatus).toHaveBeenCalledWith("ready");

        bridge?.setCloudSnapshot?.({
            payload: { dungeon: { activeRunId: "run-1" } },
            meta: {
                updatedAt: "2026-03-14T10:00:00.000Z",
                virtualScore: 42,
                appVersion: "0.9.40",
                revision: 3
            }
        });
        expect(setHasCloudSave).toHaveBeenCalledWith(true);
        expect(setCloudPayload).toHaveBeenCalledWith({ dungeon: { activeRunId: "run-1" } });
        expect(setCloudHasActiveDungeonRun).toHaveBeenCalledWith(true);
        expect(setCloudMeta).toHaveBeenCalledWith(expect.objectContaining({
            virtualScore: 42,
            appVersion: "0.9.40",
            revision: 3
        }));

        detach();
        expect(bridge?.setCloudAccessToken).toBeUndefined();
        expect(bridge?.setCloudSnapshot).toBeUndefined();
    });
});
