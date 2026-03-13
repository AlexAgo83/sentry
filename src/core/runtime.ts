import {
    CombatSkillId,
    GameSave,
    GameState,
    ItemDelta,
    OfflinePlayerSummary,
    OfflineSummaryState,
    PerformanceState,
    PlayerId
} from "./types";
import { isPlayerAssignedToActiveDungeonRun } from "./dungeon";
import { createInitialGameState } from "./state";
import { toGameSave } from "./serialization";
import { GameStore } from "../store/gameStore";
import { PersistenceAdapter } from "../adapters/persistence/types";
import { OFFLINE_CAP_DAYS, RESTED_THRESHOLD_MS } from "./constants";
import { OfflineCatchUpResult, runOfflineCatchUp } from "./runtime/offlineCatchUp";

const DAY_MS = 24 * 60 * 60 * 1000;
const resolveOfflineCapDays = () => {
    const raw = import.meta.env?.VITE_OFFLINE_CAP_DAYS;
    const parsed = typeof raw === "string" ? Number(raw) : Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : OFFLINE_CAP_DAYS;
};
const OFFLINE_CAP_MS = resolveOfflineCapDays() * DAY_MS;

export class GameRuntime {
    private intervalId: number | null = null;
    private hiddenAt: number | null = null;
    private hasStarted = false;
    private lastPersistAt: number | null = null;
    private persistenceFailureCount = 0;
    private persistenceDisabled = false;
    private hasLoggedPersistenceError = false;
    private persistenceRetryAt: number | null = null;
    private static readonly MAX_CATCH_UP_MS = 500;
    private static readonly MAX_OFFLINE_CATCH_UP_MS = OFFLINE_CAP_MS;
    private static readonly MAX_OFFLINE_STEP_MS = 5000;
    private static readonly PERSIST_INTERVAL_MS = 1500;
    private static readonly PERSIST_RETRY_BASE_MS = 10000;
    private static readonly PERSIST_RETRY_MAX_MS = 60000;
    private static readonly STARTUP_CHUNK_BUDGET_MS = 12;
    private static readonly STARTUP_CHUNK_MAX_TICKS = 64;
    private static readonly DRIFT_EMA_ALPHA = 0.15;
    private static readonly OFFLINE_DEBUG_ENABLE_KEY = "sentry.debug.offline";
    private visibilityHandler?: () => void;
    private unloadHandler?: () => void;
    private startupRunToken = 0;

    constructor(
        private readonly store: GameStore,
        private readonly persistence: PersistenceAdapter,
        private readonly version: string
    ) {}

    start = (options?: { nonBlockingStartup?: boolean }) => {
        if (options?.nonBlockingStartup) {
            void this.startNonBlocking();
            return;
        }
        if (this.hasStarted) {
            return;
        }
        this.hasStarted = true;
        const save = this.persistence.load();
        this.store.dispatch({ type: "hydrate", save, version: this.version });
        this.bindVisibility();
        this.bindUnload();
        if (!this.isDocumentVisible()) {
            const lastTick = this.store.getState().loop.lastTick;
            const hiddenAt = lastTick ?? Date.now();
            this.hiddenAt = hiddenAt;
            this.store.dispatch({ type: "setHiddenAt", hiddenAt });
            return;
        }
        this.runStartupOfflineCatchUp();
        this.startLoop();
    };

    private startNonBlocking = async () => {
        if (this.hasStarted) {
            return;
        }
        this.hasStarted = true;
        const runToken = ++this.startupRunToken;
        this.setStartupBootstrap(
            {
                stage: "loadSave",
                stageLabel: "Loading save data",
                progressPct: 4,
                isRunning: true,
                detail: null,
                awayDurationMs: null,
                processedTicks: 0,
                totalTicks: 0,
                processedMs: 0,
                totalMs: 0
            },
            true
        );
        try {
            const save = this.persistence.load();
            if (!this.isStartupRunActive(runToken)) {
                return;
            }
            this.setStartupBootstrap({
                stage: "hydrateState",
                stageLabel: "Hydrating state",
                progressPct: 16,
                detail: null
            });
            this.store.dispatch({ type: "hydrate", save, version: this.version });
            if (!this.isStartupRunActive(runToken)) {
                return;
            }
            this.bindVisibility();
            this.bindUnload();
            if (!this.isDocumentVisible()) {
                const lastTick = this.store.getState().loop.lastTick;
                const hiddenAt = lastTick ?? Date.now();
                this.hiddenAt = hiddenAt;
                this.store.dispatch({ type: "setHiddenAt", hiddenAt });
                this.setStartupBootstrap({
                    stage: "ready",
                    stageLabel: "Ready",
                    progressPct: 100,
                    isRunning: false,
                    detail: null
                });
                return;
            }
            await this.runStartupOfflineCatchUpNonBlocking(runToken);
            if (!this.isStartupRunActive(runToken)) {
                return;
            }
            this.setStartupBootstrap({
                stage: "assetWarmup",
                stageLabel: "Preparing assets",
                progressPct: 96,
                detail: "Finalizing startup"
            });
            await this.yieldToMainThread();
            if (!this.isStartupRunActive(runToken)) {
                return;
            }
            this.setStartupBootstrap({
                stage: "finalizeReady",
                stageLabel: "Finalizing",
                progressPct: 99,
                detail: null
            });
            this.startLoop();
            this.setStartupBootstrap({
                stage: "ready",
                stageLabel: "Ready",
                progressPct: 100,
                isRunning: false,
                detail: null
            });
        } catch (error) {
            if (this.isStartupRunActive(runToken)) {
                this.setStartupBootstrap({
                    stage: "error",
                    stageLabel: "Startup error",
                    progressPct: 100,
                    isRunning: false,
                    detail: error instanceof Error ? error.message : "Failed to complete startup bootstrap"
                });
            }
            this.hasStarted = false;
            console.error("Startup bootstrap failed", error);
        }
    };

    stop = () => {
        this.pauseLoop();
        this.hasStarted = false;
        this.startupRunToken += 1;
        this.unbindVisibility();
        this.unbindUnload();
    };

    simulateOffline = (durationMs: number) => {
        if (!Number.isFinite(durationMs) || durationMs <= 0) {
            return;
        }
        const now = Date.now();
        const start = Math.max(0, now - durationMs);
        const perfStart = this.getPerfTimestamp();
        const beforeState = this.store.getState();
        const result = this.runOfflineCatchUp(start, now);
        const afterState = this.store.getState();
        const awayMs = now - start;
        const summary = this.buildOfflineSummary(
            beforeState,
            afterState,
            awayMs,
            result.processedMs,
            result.ticks,
            result.capped,
            result.playerItemDeltas,
            result.totalItemDeltas,
            result.dungeonItemDeltasByPlayer,
            result.dungeonCombatXpByPlayer
        );
        if (summary) {
            this.store.dispatch({ type: "setOfflineSummary", summary });
        }
        if (awayMs >= RESTED_THRESHOLD_MS) {
            this.store.dispatch({ type: "grantRestedBuff", timestamp: now });
        }
        const prevEma = this.store.getState().perf.driftEmaMs;
        const driftMs = 0;
        const driftEmaMs = prevEma === 0
            ? driftMs
            : prevEma + (driftMs - prevEma) * GameRuntime.DRIFT_EMA_ALPHA;
        this.updatePerf(perfStart, {
            lastDeltaMs: durationMs,
            lastDriftMs: driftMs,
            driftEmaMs,
            lastOfflineTicks: result.ticks,
            lastOfflineDurationMs: durationMs
        });
        this.persist({ force: true });
    };

    reset = () => {
        const initialState = createInitialGameState(this.version, { seedHero: false });
        const save = toGameSave(initialState);
        this.persist({ force: true, save });
        this.store.dispatch({ type: "hydrate", save, version: this.version });
    };

    importSave = (save: GameSave) => {
        this.persist({ force: true, save });
        this.store.dispatch({ type: "hydrate", save, version: this.version });
    };

    retryPersistence = () => {
        this.persist({ force: true, allowDisabled: true });
    };

    private startLoop = () => {
        if (this.intervalId) {
            window.clearInterval(this.intervalId);
        }
        const { loopInterval } = this.store.getState().loop;
        this.intervalId = window.setInterval(this.tick, loopInterval);
    };

    private pauseLoop = () => {
        if (this.intervalId) {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
        }
    };

    private tick = () => {
        const perfStart = this.getPerfTimestamp();
        const state = this.store.getState();
        const now = Date.now();
        const lastTick = state.loop.lastTick;

        if (!lastTick) {
            this.store.dispatch({ type: "tick", deltaMs: 0, timestamp: now });
            const prevEma = this.store.getState().perf.driftEmaMs;
            const driftMs = 0;
            const driftEmaMs = prevEma === 0
                ? driftMs
                : prevEma + (driftMs - prevEma) * GameRuntime.DRIFT_EMA_ALPHA;
            this.updatePerf(perfStart, {
                lastDeltaMs: 0,
                lastDriftMs: driftMs,
                driftEmaMs,
                lastOfflineTicks: 0,
                lastOfflineDurationMs: 0
            });
            this.persist();
            return;
        }

        const rawDiff = now - lastTick;
        const diff = Number.isFinite(rawDiff) ? Math.max(0, rawDiff) : 0;
        const threshold = state.loop.loopInterval * state.loop.offlineThreshold;

        if (diff > threshold) {
            const result = this.runOfflineCatchUp(lastTick, now);
            const prevEma = state.perf.driftEmaMs;
            const driftMs = 0;
            const driftEmaMs = prevEma === 0
                ? driftMs
                : prevEma + (driftMs - prevEma) * GameRuntime.DRIFT_EMA_ALPHA;
            this.updatePerf(perfStart, {
                lastDeltaMs: diff,
                lastDriftMs: driftMs,
                driftEmaMs,
                lastOfflineTicks: result.ticks,
                lastOfflineDurationMs: diff
            });
        } else {
            const deltaMs = Math.min(diff, threshold, GameRuntime.MAX_CATCH_UP_MS);
            this.store.dispatch({ type: "tick", deltaMs, timestamp: now });
            const prevEma = state.perf.driftEmaMs;
            const driftMs = diff > 0 ? diff - state.loop.loopInterval : 0;
            const driftEmaMs = prevEma === 0
                ? driftMs
                : prevEma + (driftMs - prevEma) * GameRuntime.DRIFT_EMA_ALPHA;
            this.updatePerf(perfStart, {
                lastDeltaMs: diff,
                lastDriftMs: driftMs,
                driftEmaMs,
                lastOfflineTicks: 0,
                lastOfflineDurationMs: 0
            });
        }
        this.persist();
    };

    private runOfflineCatchUp = (from: number, to: number) => {
        const offlineInterval = this.store.getState().loop.offlineInterval;
        return runOfflineCatchUp({
            from,
            to,
            capMs: GameRuntime.MAX_OFFLINE_CATCH_UP_MS,
            offlineInterval,
            maxStepMs: GameRuntime.MAX_OFFLINE_STEP_MS,
            dispatchTick: (deltaMs, timestamp) => {
                this.store.dispatch({ type: "tick", deltaMs, timestamp });
            },
            collectTickDeltas: (
                totalItemDeltas,
                playerItemDeltas,
                dungeonItemDeltas,
                dungeonItemDeltasByPlayer,
                dungeonCombatXpByPlayer
            ) => {
                this.collectTickDeltas(
                    totalItemDeltas,
                    playerItemDeltas,
                    dungeonItemDeltas,
                    dungeonItemDeltasByPlayer,
                    dungeonCombatXpByPlayer
                );
            }
        });
    };

    private persist = (options?: { force?: boolean; save?: GameSave; allowDisabled?: boolean; allowDuringStartup?: boolean }) => {
        const now = Date.now();
        if (!options?.allowDuringStartup && this.store.getState().startupBootstrap.isRunning) {
            return;
        }
        if (this.persistenceDisabled && !options?.allowDisabled) {
            if (!this.persistenceRetryAt || now < this.persistenceRetryAt) {
                return;
            }
        }
        if (!options?.force && this.lastPersistAt && now - this.lastPersistAt < GameRuntime.PERSIST_INTERVAL_MS) {
            return;
        }
        const save = options?.save ?? toGameSave(this.store.getState());
        try {
            this.persistence.save(save);
            this.lastPersistAt = now;
            this.persistenceFailureCount = 0;
            this.hasLoggedPersistenceError = false;
            if (this.persistenceDisabled) {
                this.persistenceDisabled = false;
                this.persistenceRetryAt = null;
                this.store.dispatch({
                    type: "setPersistenceStatus",
                    status: { disabled: false, error: null, lastFailureAt: null }
                });
            }
        } catch (error) {
            this.persistenceFailureCount += 1;
            const errorMessage = error instanceof Error ? error.message : "Failed to persist save data";
            if (!this.hasLoggedPersistenceError) {
                console.error("Failed to persist save data", error);
                this.hasLoggedPersistenceError = true;
            }
            if (this.persistenceFailureCount >= 3) {
                this.persistenceDisabled = true;
                const retryDelay = Math.min(
                    GameRuntime.PERSIST_RETRY_BASE_MS * (2 ** Math.max(0, this.persistenceFailureCount - 3)),
                    GameRuntime.PERSIST_RETRY_MAX_MS
                );
                this.persistenceRetryAt = now + retryDelay;
                this.store.dispatch({
                    type: "setPersistenceStatus",
                    status: { disabled: true, error: errorMessage, lastFailureAt: now }
                });
            }
        }
    };

    private setStartupBootstrap = (
        bootstrap: Partial<GameState["startupBootstrap"]>,
        replace = false
    ) => {
        this.store.dispatch({ type: "setStartupBootstrap", bootstrap, replace });
    };

    private isStartupRunActive = (runToken: number) => {
        return this.hasStarted && this.startupRunToken === runToken;
    };

    private yieldToMainThread = async () => {
        await new Promise<void>((resolve) => {
            globalThis.setTimeout(resolve, 0);
        });
    };

    private collectTickDeltas = (
        total: ItemDelta,
        perPlayer: Record<string, ItemDelta>,
        dungeonTotals: ItemDelta,
        dungeonByPlayer: Record<string, ItemDelta>,
        dungeonCombatXpByPlayer: Record<string, Partial<Record<CombatSkillId, number>>>
    ) => {
        const summary = this.store.getState().lastTickSummary;
        if (!summary) {
            return;
        }
        Object.entries(summary.totalItemDeltas).forEach(([itemId, amount]) => {
            total[itemId] = (total[itemId] ?? 0) + amount;
        });
        Object.entries(summary.playerItemDeltas).forEach(([playerId, deltas]) => {
            const bucket = perPlayer[playerId] ?? {};
            Object.entries(deltas).forEach(([itemId, amount]) => {
                bucket[itemId] = (bucket[itemId] ?? 0) + amount;
            });
            perPlayer[playerId] = bucket;
        });
        Object.entries(summary.dungeonItemDeltas).forEach(([itemId, amount]) => {
            dungeonTotals[itemId] = (dungeonTotals[itemId] ?? 0) + amount;
        });
        Object.entries(summary.dungeonItemDeltasByPlayer).forEach(([playerId, deltas]) => {
            const bucket = dungeonByPlayer[playerId] ?? {};
            Object.entries(deltas).forEach(([itemId, amount]) => {
                bucket[itemId] = (bucket[itemId] ?? 0) + amount;
            });
            dungeonByPlayer[playerId] = bucket;
        });
        Object.entries(summary.dungeonCombatXpByPlayer).forEach(([playerId, xpBySkill]) => {
            const bucket = dungeonCombatXpByPlayer[playerId] ?? {};
            Object.entries(xpBySkill ?? {}).forEach(([skillId, amount]) => {
                const numeric = Number.isFinite(amount) ? amount : 0;
                if (numeric <= 0) {
                    return;
                }
                const typedSkillId = skillId as CombatSkillId;
                bucket[typedSkillId] = (bucket[typedSkillId] ?? 0) + numeric;
            });
            dungeonCombatXpByPlayer[playerId] = bucket;
        });
    };

    private bindVisibility = () => {
        if (typeof document === "undefined") {
            return;
        }
        if (this.visibilityHandler) {
            return;
        }
        this.visibilityHandler = () => {
            if (!this.isDocumentVisible()) {
                this.persist({ force: true });
                this.hiddenAt = Date.now();
                this.store.dispatch({ type: "setHiddenAt", hiddenAt: this.hiddenAt });
                this.pauseLoop();
                return;
            }

            const resumeAt = Date.now();
            const hiddenAt = this.hiddenAt ?? this.store.getState().loop.lastHiddenAt;
            if (hiddenAt) {
                const perfStart = this.getPerfTimestamp();
                const beforeState = this.store.getState();
                const result = this.runOfflineCatchUp(hiddenAt, resumeAt);
                const afterState = this.store.getState();
                const durationMs = resumeAt - hiddenAt;
                if (durationMs >= 5000) {
                    const summary = this.buildOfflineSummary(
                        beforeState,
                        afterState,
                        durationMs,
                        result.processedMs,
                        result.ticks,
                        result.capped,
                        result.playerItemDeltas,
                        result.totalItemDeltas,
                        result.dungeonItemDeltasByPlayer,
                        result.dungeonCombatXpByPlayer
                    );
                    if (summary) {
                        this.store.dispatch({ type: "setOfflineSummary", summary });
                    }
                }
                if (durationMs >= RESTED_THRESHOLD_MS) {
                    this.store.dispatch({ type: "grantRestedBuff", timestamp: resumeAt });
                }
                this.store.dispatch({ type: "setHiddenAt", hiddenAt: null });
                const prevEma = this.store.getState().perf.driftEmaMs;
                const driftMs = 0;
                const driftEmaMs = prevEma === 0
                    ? driftMs
                    : prevEma + (driftMs - prevEma) * GameRuntime.DRIFT_EMA_ALPHA;
                this.updatePerf(perfStart, {
                    lastDeltaMs: durationMs,
                    lastDriftMs: driftMs,
                    driftEmaMs,
                    lastOfflineTicks: result.ticks,
                    lastOfflineDurationMs: durationMs
                });
                this.persist({ force: true });
            }
            this.hiddenAt = null;
            this.startLoop();
        };
        document.addEventListener("visibilitychange", this.visibilityHandler);
    };

    private unbindVisibility = () => {
        if (typeof document === "undefined" || !this.visibilityHandler) {
            return;
        }
        document.removeEventListener("visibilitychange", this.visibilityHandler);
        this.visibilityHandler = undefined;
    };

    private bindUnload = () => {
        if (typeof window === "undefined" || typeof window.addEventListener !== "function") {
            return;
        }
        if (this.unloadHandler) {
            return;
        }
        this.unloadHandler = () => {
            this.persist({ force: true });
        };
        window.addEventListener("beforeunload", this.unloadHandler);
    };

    private unbindUnload = () => {
        if (typeof window === "undefined" || !this.unloadHandler || typeof window.removeEventListener !== "function") {
            return;
        }
        window.removeEventListener("beforeunload", this.unloadHandler);
        this.unloadHandler = undefined;
    };

    private getPerfTimestamp = (): number => {
        if (typeof performance !== "undefined" && typeof performance.now === "function") {
            return performance.now();
        }
        return Date.now();
    };

    private isDocumentVisible = (): boolean => {
        if (typeof document === "undefined") {
            return true;
        }
        return document.visibilityState === "visible";
    };

    private updatePerf = (start: number, perf: Partial<PerformanceState>) => {
        const duration = Math.max(0, this.getPerfTimestamp() - start);
        this.store.dispatch({
            type: "setPerf",
            perf: {
                lastTickDurationMs: duration,
                ...perf
            }
        });
    };

    private buildOfflineSummary = (
        beforeState: GameState,
        afterState: GameState,
        durationMs: number,
        processedMs: number,
        ticks: number,
        capped: boolean,
        playerItemDeltas: Record<string, ItemDelta>,
        totalItemDeltas: ItemDelta,
        dungeonItemDeltasByPlayer: Record<string, ItemDelta>,
        dungeonCombatXpByPlayer: Record<string, Partial<Record<CombatSkillId, number>>>
    ): OfflineSummaryState | null => {
        const players = Object.keys(beforeState.players).reduce<OfflinePlayerSummary[]>((acc, playerId) => {
            const beforePlayer = beforeState.players[playerId];
            const afterPlayer = afterState.players[playerId];
            if (!beforePlayer || !afterPlayer) {
                return acc;
            }
            const actionId = beforePlayer.selectedActionId;
            const beforeSkill = actionId ? beforePlayer.skills[actionId] : null;
            const afterSkill = actionId ? afterPlayer.skills[actionId] : null;
            const recipeId = beforeSkill?.selectedRecipeId ?? null;
            const beforeRecipe = recipeId && beforeSkill ? beforeSkill.recipes[recipeId] : null;
            const afterRecipe = recipeId && afterSkill ? afterSkill.recipes[recipeId] : null;
            const isInDungeon = isPlayerAssignedToActiveDungeonRun(beforeState, playerId as PlayerId);

            const combatXpBySkill = dungeonCombatXpByPlayer[playerId] ?? {};
            const hasCombatXp = Object.values(combatXpBySkill).some((value) => Number(value) > 0);
            const playerDungeonItemDeltas = dungeonItemDeltasByPlayer[playerId] ?? {};
            const hasDungeonItems = Object.values(playerDungeonItemDeltas).some((value) => (
                Number.isFinite(value) && Number(value) !== 0
            ));
            const summary = {
                playerId,
                playerName: beforePlayer.name,
                actionId,
                recipeId,
                isInDungeon,
                skillXpGained: beforeSkill && afterSkill ? afterSkill.xp - beforeSkill.xp : 0,
                recipeXpGained: beforeRecipe && afterRecipe ? afterRecipe.xp - beforeRecipe.xp : 0,
                skillLevelGained: beforeSkill && afterSkill ? afterSkill.level - beforeSkill.level : 0,
                recipeLevelGained: beforeRecipe && afterRecipe ? afterRecipe.level - beforeRecipe.level : 0,
                itemDeltas: playerItemDeltas[playerId] ?? {},
                dungeonGains: {
                    combatXp: combatXpBySkill,
                    itemDeltas: (hasCombatXp || hasDungeonItems) ? playerDungeonItemDeltas : {}
                }
            };

            acc.push(summary);

            return acc;
        }, []);

        if (players.length === 0) {
            return null;
        }

        return {
            durationMs,
            processedMs,
            ticks,
            capped,
            players,
            totalItemDeltas
        };
    };

    private runOfflineCatchUpChunked = async (options: {
        from: number;
        to: number;
        capMs: number;
        offlineInterval: number;
        maxStepMs: number;
        shouldAbort: () => boolean;
        onProgress?: (progress: {
            processedTicks: number;
            totalTicks: number;
            processedMs: number;
            totalMs: number;
        }) => void;
    }): Promise<OfflineCatchUpResult | null> => {
        const diff = Math.max(0, options.to - options.from);
        const processedMs = Math.min(diff, options.capMs);
        const end = options.from + processedMs;
        const stepMs = Math.min(options.offlineInterval, options.maxStepMs);
        const totalTicks = processedMs > 0 ? Math.ceil(processedMs / Math.max(1, stepMs)) : 0;
        let tickTime = options.from;
        let ticks = 0;
        const totalItemDeltas: ItemDelta = {};
        const playerItemDeltas: Record<string, ItemDelta> = {};
        const dungeonItemDeltas: ItemDelta = {};
        const dungeonItemDeltasByPlayer: Record<string, ItemDelta> = {};
        const dungeonCombatXpByPlayer: Record<string, Partial<Record<CombatSkillId, number>>> = {};

        while (tickTime < end) {
            if (options.shouldAbort()) {
                return null;
            }
            const chunkStart = this.getPerfTimestamp();
            let chunkTicks = 0;
            while (
                tickTime < end
                && chunkTicks < GameRuntime.STARTUP_CHUNK_MAX_TICKS
                && (this.getPerfTimestamp() - chunkStart) < GameRuntime.STARTUP_CHUNK_BUDGET_MS
            ) {
                const nextTickTime = Math.min(end, tickTime + stepMs);
                const deltaMs = nextTickTime - tickTime;
                tickTime = nextTickTime;
                this.store.dispatch({ type: "tick", deltaMs, timestamp: tickTime });
                ticks += 1;
                chunkTicks += 1;
                this.collectTickDeltas(
                    totalItemDeltas,
                    playerItemDeltas,
                    dungeonItemDeltas,
                    dungeonItemDeltasByPlayer,
                    dungeonCombatXpByPlayer
                );
            }
            const processedWindowMs = Math.max(0, tickTime - options.from);
            options.onProgress?.({
                processedTicks: ticks,
                totalTicks,
                processedMs: processedWindowMs,
                totalMs: processedMs
            });
            if (tickTime < end) {
                await this.yieldToMainThread();
            }
        }

        const capped = processedMs < diff;
        if (capped && options.to > end) {
            this.store.dispatch({ type: "tick", deltaMs: 0, timestamp: options.to });
        }

        return {
            diff,
            processedMs,
            capped,
            ticks,
            totalItemDeltas,
            playerItemDeltas,
            dungeonItemDeltas,
            dungeonItemDeltasByPlayer,
            dungeonCombatXpByPlayer
        };
    };

    private runStartupOfflineCatchUpNonBlocking = async (runToken: number) => {
        const state = this.store.getState();
        const startTime = state.loop.lastTick ?? state.loop.lastHiddenAt;
        this.setStartupBootstrap({
            stage: "offlineCatchUp",
            stageLabel: "Simulating offline progression",
            progressPct: 24
        });
        if (!startTime) {
            this.setStartupBootstrap({
                progressPct: 92,
                detail: "No offline catch-up needed",
                awayDurationMs: null,
                processedTicks: 0,
                totalTicks: 0,
                processedMs: 0,
                totalMs: 0
            });
            return;
        }

        const now = Date.now();
        const diff = now - startTime;
        if (diff < 5000) {
            if (this.isOfflineDebugEnabled()) {
                console.debug("[offline] skipping recap, away too short", { diffMs: diff });
            }
            this.setStartupBootstrap({
                progressPct: 92,
                detail: "No offline catch-up needed",
                awayDurationMs: null,
                processedTicks: 0,
                totalTicks: 0,
                processedMs: 0,
                totalMs: Math.max(0, diff)
            });
            return;
        }

        const offlineInterval = this.store.getState().loop.offlineInterval;
        const stepMs = Math.min(offlineInterval, GameRuntime.MAX_OFFLINE_STEP_MS);
        const expectedProcessedMs = Math.min(Math.max(0, diff), GameRuntime.MAX_OFFLINE_CATCH_UP_MS);
        const expectedTicks = expectedProcessedMs > 0 ? Math.ceil(expectedProcessedMs / Math.max(1, stepMs)) : 0;
        this.setStartupBootstrap({
            detail: expectedTicks > 0 ? `0 / ${expectedTicks} ticks` : "Preparing catch-up",
            awayDurationMs: diff,
            processedTicks: 0,
            totalTicks: expectedTicks,
            processedMs: 0,
            totalMs: expectedProcessedMs
        });

        const perfStart = this.getPerfTimestamp();
        const beforeState = this.store.getState();
        const result = await this.runOfflineCatchUpChunked({
            from: startTime,
            to: now,
            capMs: GameRuntime.MAX_OFFLINE_CATCH_UP_MS,
            offlineInterval,
            maxStepMs: GameRuntime.MAX_OFFLINE_STEP_MS,
            shouldAbort: () => !this.isStartupRunActive(runToken),
            onProgress: (progress) => {
                const ratio = progress.totalMs > 0
                    ? Math.max(0, Math.min(1, progress.processedMs / progress.totalMs))
                    : 1;
                const progressPct = 24 + Math.floor((92 - 24) * ratio);
                this.setStartupBootstrap({
                    progressPct,
                    detail: progress.totalTicks > 0
                        ? `Processing tick ${Math.min(progress.processedTicks, progress.totalTicks)} / ${progress.totalTicks}`
                        : "Processing offline progression",
                    processedTicks: progress.processedTicks,
                    totalTicks: progress.totalTicks,
                    processedMs: progress.processedMs,
                    totalMs: progress.totalMs
                });
            }
        });
        if (!result || !this.isStartupRunActive(runToken)) {
            return;
        }
        const afterState = this.store.getState();

        const summary = this.buildOfflineSummary(
            beforeState,
            afterState,
            diff,
            result.processedMs,
            result.ticks,
            result.capped,
            result.playerItemDeltas,
            result.totalItemDeltas,
            result.dungeonItemDeltasByPlayer,
            result.dungeonCombatXpByPlayer
        );
        if (summary) {
            if (this.isOfflineDebugEnabled()) {
                console.debug("[offline] recap generated", { diffMs: diff, ticks: result.ticks });
            }
            this.store.dispatch({ type: "setOfflineSummary", summary });
        } else {
            if (this.isOfflineDebugEnabled()) {
                console.debug("[offline] recap skipped (no players)", { diffMs: diff, ticks: result.ticks });
            }
        }
        if (diff >= RESTED_THRESHOLD_MS) {
            this.store.dispatch({ type: "grantRestedBuff", timestamp: now });
        }

        this.updatePerf(perfStart, {
            lastDeltaMs: diff,
            lastDriftMs: 0,
            driftEmaMs: (() => {
                const prevEma = this.store.getState().perf.driftEmaMs;
                const driftMs = 0;
                return prevEma === 0
                    ? driftMs
                    : prevEma + (driftMs - prevEma) * GameRuntime.DRIFT_EMA_ALPHA;
            })(),
            lastOfflineTicks: result.ticks,
            lastOfflineDurationMs: diff
        });
        this.persist({ force: true, allowDuringStartup: true });
        this.setStartupBootstrap({
            progressPct: 92,
            detail: "Offline catch-up complete",
            processedTicks: result.ticks,
            totalTicks: Math.max(expectedTicks, result.ticks),
            processedMs: result.processedMs,
            totalMs: Math.max(expectedProcessedMs, result.processedMs)
        });
    };

    private runStartupOfflineCatchUp = () => {
        const state = this.store.getState();
        const startTime = state.loop.lastTick ?? state.loop.lastHiddenAt;
        if (!startTime) {
            return;
        }

        const now = Date.now();
        const diff = now - startTime;
        if (diff < 5000) {
            if (this.isOfflineDebugEnabled()) {
                console.debug("[offline] skipping recap, away too short", { diffMs: diff });
            }
            return;
        }

        const perfStart = this.getPerfTimestamp();
        const beforeState = this.store.getState();
        const result = this.runOfflineCatchUp(startTime, now);
        const afterState = this.store.getState();

        const summary = this.buildOfflineSummary(
            beforeState,
            afterState,
            diff,
            result.processedMs,
            result.ticks,
            result.capped,
            result.playerItemDeltas,
            result.totalItemDeltas,
            result.dungeonItemDeltasByPlayer,
            result.dungeonCombatXpByPlayer
        );
        if (summary) {
            if (this.isOfflineDebugEnabled()) {
                console.debug("[offline] recap generated", { diffMs: diff, ticks: result.ticks });
            }
            this.store.dispatch({ type: "setOfflineSummary", summary });
        } else {
            if (this.isOfflineDebugEnabled()) {
                console.debug("[offline] recap skipped (no players)", { diffMs: diff, ticks: result.ticks });
            }
        }
        if (diff >= RESTED_THRESHOLD_MS) {
            this.store.dispatch({ type: "grantRestedBuff", timestamp: now });
        }

        this.updatePerf(perfStart, {
            lastDeltaMs: diff,
            lastDriftMs: 0,
            driftEmaMs: (() => {
                const prevEma = this.store.getState().perf.driftEmaMs;
                const driftMs = 0;
                return prevEma === 0
                    ? driftMs
                    : prevEma + (driftMs - prevEma) * GameRuntime.DRIFT_EMA_ALPHA;
            })(),
            lastOfflineTicks: result.ticks,
            lastOfflineDurationMs: diff
        });
        this.persist({ force: true });
    };

    private isOfflineDebugEnabled = (): boolean => {
        const isDev = typeof import.meta !== "undefined" && Boolean((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV);
        if (!isDev || typeof window === "undefined") {
            return false;
        }
        try {
            return window.localStorage.getItem(GameRuntime.OFFLINE_DEBUG_ENABLE_KEY) === "1";
        } catch {
            return false;
        }
    };
}
