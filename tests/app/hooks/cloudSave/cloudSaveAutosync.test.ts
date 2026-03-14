import { describe, expect, it, vi } from "vitest";
import { createCloudAutosyncActions } from "../../../../src/app/hooks/cloudSave/cloudSaveAutosync";

describe("createCloudAutosyncActions", () => {
    it("escalates to conflict when local and cloud changed since the watermark", async () => {
        const setAutoSyncStatus = vi.fn();
        const setAutoSyncConflict = vi.fn();
        const setCloudMeta = vi.fn();
        const setHasCloudSave = vi.fn();
        const setError = vi.fn();
        const setStatus = vi.fn();

        const actions = createCloudAutosyncActions({
            accessToken: "token",
            autoSyncEnabled: true,
            autoSyncStatus: "idle",
            cloudMeta: null,
            hasCloudSave: true,
            isAvailable: true,
            isBackendAwake: true,
            localHasActiveDungeonRun: false,
            status: "ready",
            syncWatermark: {
                schemaVersion: 1,
                cloudRevision: 2,
                localFingerprint: "fp-local-a",
                updatedAtMs: 123
            },
            autoSyncConflict: null
        }, {
            setAutoSyncStatus,
            setAutoSyncConflict,
            setCloudMeta,
            setHasCloudSave,
            setError,
            setStatus
        }, {
            buildCurrentLocalSnapshot: () => ({
                payload: { version: "0.9.40" } as never,
                fingerprint: "fp-local-b"
            }),
            fetchLatestCloudSave: async () => ({
                payload: { version: "0.9.41" },
                meta: {
                    updatedAt: "2026-03-14T10:00:00.000Z",
                    virtualScore: 99,
                    appVersion: "0.9.41",
                    revision: 5
                }
            }),
            overwriteCloud: vi.fn(),
            loadCloud: vi.fn(async () => true),
            gameDispatch: vi.fn()
        });

        await actions.runAutoSyncBootstrap();

        expect(setAutoSyncStatus).toHaveBeenCalledWith("conflict");
        expect(setAutoSyncConflict).toHaveBeenCalledWith(expect.objectContaining({
            message: "Both local and cloud saves changed since the last sync. Choose which version to keep."
        }));
        expect(setCloudMeta).toHaveBeenCalledWith(expect.objectContaining({
            virtualScore: 99,
            appVersion: "0.9.41",
            revision: 5
        }));
        expect(setError).toHaveBeenCalledWith("Both local and cloud saves changed since the last sync. Choose which version to keep.");
        expect(setStatus).toHaveBeenCalledWith("ready");
    });
});
