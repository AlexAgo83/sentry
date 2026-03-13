// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GameRuntime } from "../../src/core/runtime";
import { createInitialGameState } from "../../src/core/state";
import { createGameStore } from "../../src/store/gameStore";
import { toGameSave } from "../../src/core/serialization";
import type { GameSave } from "../../src/core/types";

const buildPersistence = (save: GameSave | null = null) => ({
    load: () => save,
    save: vi.fn()
});

describe("save/bootstrap compatibility", () => {
    const documentListeners: Record<string, Array<(event?: { type: string }) => void>> = {};
    const windowListeners: Record<string, Array<(event?: { type: string }) => void>> = {};

    beforeEach(() => {
        documentListeners.visibilitychange = [];
        windowListeners.beforeunload = [];
        (globalThis as any).document = {
            visibilityState: "visible",
            addEventListener: vi.fn((type: string, handler: (event?: { type: string }) => void) => {
                documentListeners[type] = documentListeners[type] ?? [];
                documentListeners[type].push(handler);
            }),
            removeEventListener: vi.fn((type: string, handler: (event?: { type: string }) => void) => {
                documentListeners[type] = (documentListeners[type] ?? []).filter((fn) => fn !== handler);
            }),
            dispatchEvent: (event: { type: string }) => {
                (documentListeners[event.type] ?? []).forEach((handler) => handler(event));
                return true;
            }
        };
        (globalThis as any).window = {
            setInterval: vi.fn(() => 0),
            clearInterval: vi.fn(),
            addEventListener: vi.fn((type: string, handler: (event?: { type: string }) => void) => {
                windowListeners[type] = windowListeners[type] ?? [];
                windowListeners[type].push(handler);
            }),
            removeEventListener: vi.fn((type: string, handler: (event?: { type: string }) => void) => {
                windowListeners[type] = (windowListeners[type] ?? []).filter((fn) => fn !== handler);
            })
        };
        vi.spyOn(Date, "now").mockReturnValue(10000);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete (globalThis as any).document;
        delete (globalThis as any).window;
    });

    it("recomputes startup catch-up from the last durable save after an interrupted bootstrap", async () => {
        let resolveCatchUp: ((value: any) => void) | null = null;
        const base = createInitialGameState("0.9.39");
        const durableSave = toGameSave(base);
        durableSave.lastTick = 1000;

        const interruptedStore = createGameStore(base);
        const interruptedPersistence = buildPersistence(durableSave);
        const interruptedRuntime = new GameRuntime(interruptedStore, interruptedPersistence, "0.9.39");
        vi.spyOn(interruptedRuntime as never, "runOfflineCatchUpChunked" as never).mockImplementation(() => (
            new Promise((resolve) => {
                resolveCatchUp = resolve;
            })
        ));

        interruptedRuntime.start({ nonBlockingStartup: true });
        await vi.waitFor(() => {
            expect(interruptedStore.getState().startupBootstrap.isRunning).toBe(true);
        });
        windowListeners.beforeunload[0]?.({ type: "beforeunload" });
        interruptedRuntime.stop();

        expect(interruptedPersistence.save).not.toHaveBeenCalled();
        expect(resolveCatchUp).not.toBeNull();

        const resumedStore = createGameStore(base);
        const resumedPersistence = buildPersistence(durableSave);
        const resumedRuntime = new GameRuntime(resumedStore, resumedPersistence, "0.9.39");
        resumedRuntime.start({ nonBlockingStartup: true });

        await vi.waitFor(() => {
            expect(resumedStore.getState().startupBootstrap.stage).toBe("ready");
        });

        expect(resumedStore.getState().offlineSummary).not.toBeNull();
        expect(resumedPersistence.save).toHaveBeenCalledTimes(1);
    });

    it("keeps local import atomic until the shared bootstrap completes", async () => {
        let resolveCatchUp: ((value: any) => void) | null = null;
        const base = createInitialGameState("0.9.39");
        const importedSave = toGameSave(base);
        importedSave.lastTick = 1000;
        const store = createGameStore(base);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.9.39");
        runtime.start();

        vi.spyOn(runtime as never, "runOfflineCatchUpChunked" as never).mockImplementation(() => (
            new Promise((resolve) => {
                resolveCatchUp = resolve;
            })
        ));

        const importPromise = runtime.importSave(importedSave, { origin: "localImport" });
        await vi.waitFor(() => {
            expect(store.getState().startupBootstrap.origin).toBe("localImport");
            expect(store.getState().startupBootstrap.isRunning).toBe(true);
        });

        expect(persistence.save).not.toHaveBeenCalled();
        if (!resolveCatchUp) {
            throw new Error("Expected deferred import catch-up resolver");
        }
        const completeImportCatchUp = resolveCatchUp as (value: any) => void;
        completeImportCatchUp({
            processedMs: 9000,
            ticks: 2,
            capped: false,
            totalItemDeltas: {},
            playerItemDeltas: {},
            dungeonItemDeltasByPlayer: {},
            dungeonCombatXpByPlayer: {}
        });
        await importPromise;

        expect(store.getState().startupBootstrap.stage).toBe("ready");
        expect(store.getState().offlineSummary).not.toBeNull();
        expect(persistence.save).toHaveBeenCalledTimes(1);
    });

    it("keeps cloud load on the shared bootstrap contract", async () => {
        const base = createInitialGameState("0.9.39");
        const importedSave = toGameSave(base);
        importedSave.lastTick = 1000;
        const store = createGameStore(base);
        const persistence = buildPersistence(null);
        const runtime = new GameRuntime(store, persistence, "0.9.39");
        runtime.start();

        await runtime.importSave(importedSave, { origin: "cloudLoad" });

        expect(store.getState().startupBootstrap.origin).toBe("cloudLoad");
        expect(store.getState().startupBootstrap.stage).toBe("ready");
        expect(store.getState().offlineSummary).not.toBeNull();
        expect(persistence.save).toHaveBeenCalledTimes(1);
    });
});
