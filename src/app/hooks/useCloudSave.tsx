import type { ReactNode } from "react";
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    clearCloudSyncWatermark,
    readCloudSyncWatermark,
    writeCloudSyncWatermark,
    type CloudSyncWatermark
} from "../../adapters/persistence/cloudSyncWatermark";
import { selectVirtualScore } from "../selectors/gameSelectors";
import { useGameStore } from "./useGameStore";
import { gameStore } from "../game";
import { CloudApiError, cloudClient, type CloudProfile } from "../api/cloudClient";
import { createCloudSaveActions } from "./cloudSave/cloudSaveActions";
import { createCloudAutosyncActions } from "./cloudSave/cloudSaveAutosync";
import { attachCloudE2EBridge } from "./cloudSave/cloudSaveBridge";
import {
    AUTO_SYNC_FEATURE_ENABLED,
    CloudWarmupCancelledError,
    WARMUP_RETRY_DELAYS_MS,
    buildCurrentLocalSnapshot,
    buildLocalMeta,
    isUnauthorizedError,
    isWarmupError,
    type CloudSaveController,
    type CloudSaveMeta,
    type CloudSaveState,
    warmupMessage
} from "./cloudSave/cloudSaveModel";

export type { CloudSaveController, CloudSaveMeta } from "./cloudSave/cloudSaveModel";

const CloudSaveContext = createContext<CloudSaveController | null>(null);

export const CloudSaveProvider = memo(({ children }: { children: ReactNode }) => {
    const value = useCloudSaveInternal();
    return (
        <CloudSaveContext.Provider value={value}>
            {children}
        </CloudSaveContext.Provider>
    );
});

CloudSaveProvider.displayName = "CloudSaveProvider";

export const useCloudSave = (): CloudSaveController => {
    const value = useContext(CloudSaveContext);
    if (!value) {
        throw new Error("useCloudSave must be used within <CloudSaveProvider />");
    }
    return value;
};

const useCloudSaveInternal = (): CloudSaveController => {
    const isE2E = Boolean(import.meta.env.VITE_E2E);
    const virtualScore = useGameStore(selectVirtualScore);
    const appVersion = useGameStore((state) => state.version);
    const localHasActiveDungeonRun = useGameStore((state) => Boolean(state.dungeon.activeRunId));
    const persistedAutoSyncEnabled = useGameStore((state) => Boolean(state.ui.cloud.autoSyncEnabled));
    const autoSyncEnabled = AUTO_SYNC_FEATURE_ENABLED ? persistedAutoSyncEnabled : false;
    const [accessToken, setAccessToken] = useState<string | null>(() => cloudClient.loadAccessToken());
    const [cloudMeta, setCloudMeta] = useState<CloudSaveMeta | null>(null);
    const [cloudPayload, setCloudPayload] = useState<unknown | null>(null);
    const [hasCloudSave, setHasCloudSave] = useState(false);
    const [cloudHasActiveDungeonRun, setCloudHasActiveDungeonRun] = useState(false);
    const [status, setStatus] = useState<CloudSaveState["status"]>("idle");
    const [error, setError] = useState<string | null>(null);
    const [warmupRetrySeconds, setWarmupRetrySeconds] = useState<number | null>(null);
    const [isBackendAwake, setIsBackendAwake] = useState(() => isE2E && Boolean(cloudClient.getApiBase()));
    const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
    const [profile, setProfile] = useState<CloudProfile | null>(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));
    const [autoSyncStatus, setAutoSyncStatus] = useState<CloudSaveState["autoSyncStatus"]>("idle");
    const [autoSyncConflict, setAutoSyncConflict] = useState<CloudSaveState["autoSyncConflict"]>(null);
    const [syncWatermark, setSyncWatermark] = useState<CloudSyncWatermark | null>(() => readCloudSyncWatermark());
    const warmupRetrySignalRef = useRef<(() => void) | null>(null);
    const warmupCancelIdRef = useRef(0);
    const backendProbeInFlightRef = useRef(false);
    const lastRequestRef = useRef<(() => Promise<void>) | null>(null);
    const hasAttemptedSilentRefreshRef = useRef(false);
    const autoSyncBootstrapRef = useRef(0);
    const lastAutoSyncBootstrapSignatureRef = useRef<string | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    const localMeta = useMemo(() => buildLocalMeta(virtualScore, appVersion), [virtualScore, appVersion]);
    const isAvailable = Boolean(cloudClient.getApiBase()) && isOnline;
    useEffect(() => {
        return attachCloudE2EBridge({
            isEnabled: isE2E,
            isAvailable,
            setAccessToken,
            setIsBackendAwake,
            setWarmupRetrySeconds,
            setError,
            setStatus: (value) => setStatus(value as CloudSaveState["status"]),
            setHasCloudSave,
            setCloudPayload,
            setCloudMeta,
            setCloudHasActiveDungeonRun,
            setLastSyncAt
        });
    }, [isAvailable, isE2E]);
    const cancelWarmupRetry = useCallback(() => {
        warmupCancelIdRef.current += 1;
        if (warmupRetrySignalRef.current) {
            warmupRetrySignalRef.current();
        }
        warmupRetrySignalRef.current = null;
    }, []);
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            cancelWarmupRetry();
            backendProbeInFlightRef.current = false;
        };
    }, [cancelWarmupRetry]);
    const retryWarmupNow = useCallback(() => {
        if (warmupRetrySignalRef.current) {
            warmupRetrySignalRef.current();
            return;
        }
        const lastRequest = lastRequestRef.current;
        if (lastRequest) {
            void lastRequest();
        }
    }, []);
    const resolveErrorMessage = useCallback((err: unknown, fallback: string) => {
        if (err instanceof CloudApiError) {
            try {
                const parsed = JSON.parse(err.body);
                if (parsed && typeof parsed.error === "string") {
                    return parsed.error;
                }
            } catch {
                // Ignore parse failures and fall back to raw body.
            }
            if (err.body) {
                return err.body;
            }
        }
        if (err instanceof Error) {
            return err.message;
        }
        return fallback;
    }, []);
    const ensureWarmupRunIsActive = useCallback((runId: number) => {
        if (!isMountedRef.current || warmupCancelIdRef.current !== runId) {
            throw new CloudWarmupCancelledError();
        }
    }, []);

    const setAutoSyncEnabledPreference = useCallback((enabled: boolean) => {
        if (!AUTO_SYNC_FEATURE_ENABLED) {
            gameStore.dispatch({ type: "uiSetCloudAutoSyncEnabled", enabled: false });
            setAutoSyncStatus("idle");
            setAutoSyncConflict(null);
            return;
        }
        gameStore.dispatch({ type: "uiSetCloudAutoSyncEnabled", enabled });
        autoSyncBootstrapRef.current += 1;
        if (!enabled) {
            setAutoSyncStatus("idle");
            setAutoSyncConflict(null);
        }
    }, []);

    useEffect(() => {
        if (AUTO_SYNC_FEATURE_ENABLED) {
            return;
        }
        if (persistedAutoSyncEnabled) {
            gameStore.dispatch({ type: "uiSetCloudAutoSyncEnabled", enabled: false });
        }
        if (autoSyncStatus !== "idle") {
            setAutoSyncStatus("idle");
        }
        if (autoSyncConflict) {
            setAutoSyncConflict(null);
        }
    }, [autoSyncConflict, autoSyncStatus, persistedAutoSyncEnabled]);

    const persistSyncWatermark = useCallback((next: { cloudRevision: number | null; localFingerprint: string | null }) => {
        const persisted = writeCloudSyncWatermark(next);
        if (persisted) {
            setSyncWatermark(persisted);
            return;
        }
        setSyncWatermark({
            schemaVersion: 1,
            cloudRevision: Number.isFinite(next.cloudRevision) ? Number(next.cloudRevision) : null,
            localFingerprint: typeof next.localFingerprint === "string" && next.localFingerprint.trim().length > 0
                ? next.localFingerprint.trim()
                : null,
            updatedAtMs: Date.now()
        });
    }, []);

    const clearSyncWatermark = useCallback(() => {
        clearCloudSyncWatermark();
        setSyncWatermark(null);
    }, []);

    const createLocalSnapshot = useCallback(() => buildCurrentLocalSnapshot(gameStore.getState()), []);

    const applyRequestError = useCallback((err: unknown, fallback: string) => {
        if (isWarmupError(err)) {
            setIsBackendAwake(false);
            setStatus("warming");
            setError(warmupMessage());
            setWarmupRetrySeconds(null);
            return;
        }
        if (isUnauthorizedError(err) && accessToken) {
            cloudClient.clearAccessToken();
            cloudClient.clearCsrfToken();
            setAccessToken(null);
            setCloudMeta(null);
            setCloudPayload(null);
            setHasCloudSave(false);
            setCloudHasActiveDungeonRun(false);
            setProfile(null);
            setStatus("idle");
            setError("Session expired. Please log in again.");
            return;
        }
        setIsBackendAwake(true);
        setStatus("error");
        setError(resolveErrorMessage(err, fallback));
    }, [accessToken, resolveErrorMessage]);

    const withWarmupRetry = useCallback(async <T,>(
        statusOnStart: CloudSaveState["status"],
        action: () => Promise<T>
    ): Promise<T> => {
        const runId = warmupCancelIdRef.current;
        for (let attempt = 0; attempt <= WARMUP_RETRY_DELAYS_MS.length; attempt += 1) {
            ensureWarmupRunIsActive(runId);
            setWarmupRetrySeconds(null);
            setStatus(statusOnStart);
            try {
                warmupRetrySignalRef.current = null;
                const result = await action();
                ensureWarmupRunIsActive(runId);
                return result;
            } catch (err) {
                ensureWarmupRunIsActive(runId);
                if (!isWarmupError(err) || attempt === WARMUP_RETRY_DELAYS_MS.length) {
                    warmupRetrySignalRef.current = null;
                    setWarmupRetrySeconds(null);
                    throw err;
                }
                const baseMs = WARMUP_RETRY_DELAYS_MS[attempt];
                // Small jitter avoids synchronized thundering-herd retries across clients.
                const waitMs = Math.round(baseMs * (0.85 + Math.random() * 0.3));
                const waitSeconds = Math.max(1, Math.round(waitMs / 1000));
                setStatus("warming");
                setError(warmupMessage(waitSeconds));
                setWarmupRetrySeconds(waitSeconds);
                await new Promise<void>((resolve) => {
                    const timeout = setTimeout(resolve, waitMs);
                    warmupRetrySignalRef.current = () => {
                        clearTimeout(timeout);
                        resolve();
                    };
                });
                warmupRetrySignalRef.current = null;
            }
        }
        throw new Error("Warmup retry exhausted.");
    }, [ensureWarmupRunIsActive]);

    const refreshToken = useCallback(async (options?: { silent?: boolean }) => {
        if (!isAvailable) {
            if (!options?.silent) {
                setIsBackendAwake(false);
                setStatus("offline");
                setError("Cloud sync is unavailable.");
            }
            return null;
        }

        if (!options?.silent) {
            setError(null);
        }
        try {
            const attemptRefresh = () => withWarmupRetry("authenticating", () => cloudClient.refresh());
            let token: string | null = null;
            try {
                token = await attemptRefresh();
            } catch (err) {
                // If CSRF is stale, clear it and retry once (best effort).
                if (err instanceof CloudApiError && err.status === 403) {
                    cloudClient.clearCsrfToken();
                    token = await attemptRefresh();
                } else {
                    throw err;
                }
            }
            setIsBackendAwake(true);
            setAccessToken(token);
            return token;
        } catch (err) {
            if (err instanceof CloudWarmupCancelledError) {
                return null;
            }
            // If we were not authenticated yet (startup silent refresh), do not treat 401/403 as an error.
            if (isUnauthorizedError(err) && !accessToken) {
                setIsBackendAwake(true);
                setStatus("idle");
                if (!options?.silent) {
                    setError(null);
                }
                return null;
            }
            applyRequestError(err, "Refresh failed.");
            return null;
        }
    }, [accessToken, applyRequestError, isAvailable, withWarmupRetry]);

    const withRefreshRetry = useCallback(async <T,>(action: (token: string | null) => Promise<T>): Promise<T> => {
        const token = accessToken ?? (await refreshToken());
        try {
            return await action(token);
        } catch (err) {
            if (!isUnauthorizedError(err)) {
                throw err;
            }
            const refreshed = await refreshToken();
            if (!refreshed) {
                throw err;
            }
            return await action(refreshed);
        }
    }, [accessToken, refreshToken]);

    const {
        authenticate,
        fetchLatestCloudSave,
        refreshCloud,
        refreshProfile,
        updateUsername,
        loadCloud,
        overwriteCloud,
        logout
    } = useMemo(() => createCloudSaveActions({
        accessToken,
        appVersion,
        virtualScore,
        isAvailable,
        cloudMeta,
        cloudPayload,
        hasCloudSave,
        syncWatermark
    }, {
        setAccessToken,
        setCloudMeta,
        setCloudPayload,
        setHasCloudSave,
        setCloudHasActiveDungeonRun,
        setStatus,
        setError,
        setIsBackendAwake,
        setLastSyncAt,
        setProfile,
        setIsUpdatingProfile,
        setAutoSyncStatus,
        setAutoSyncConflict,
        setWarmupRetrySeconds
    }, {
        cancelWarmupRetry,
        clearSyncWatermark,
        persistSyncWatermark,
        buildCurrentLocalSnapshot: createLocalSnapshot,
        applyRequestError,
        resolveErrorMessage,
        withWarmupRetry,
        withRefreshRetry
    }, {
        setLastRequestRef: (next) => {
            lastRequestRef.current = next;
        }
    }), [
        accessToken,
        appVersion,
        virtualScore,
        isAvailable,
        cloudMeta,
        cloudPayload,
        hasCloudSave,
        syncWatermark,
        cancelWarmupRetry,
        clearSyncWatermark,
        persistSyncWatermark,
        createLocalSnapshot,
        applyRequestError,
        resolveErrorMessage,
        withWarmupRetry,
        withRefreshRetry
    ]);

    const probeBackend = useCallback(async () => {
        if (backendProbeInFlightRef.current) {
            return;
        }
        lastRequestRef.current = probeBackend;
        if (!isAvailable) {
            setIsBackendAwake(false);
            setStatus("offline");
            setError("Cloud sync is unavailable.");
            return;
        }
        backendProbeInFlightRef.current = true;
        setError(null);
        try {
            await withWarmupRetry("idle", () => cloudClient.probeReady());
            setIsBackendAwake(true);
            setStatus((currentStatus) => (currentStatus === "warming" ? "idle" : currentStatus));
        } catch (err) {
            if (err instanceof CloudWarmupCancelledError) {
                return;
            }
            applyRequestError(err, "Cloud backend is unavailable.");
        } finally {
            backendProbeInFlightRef.current = false;
        }
    }, [applyRequestError, isAvailable, withWarmupRetry]);

    useEffect(() => {
        if (!isAvailable || !accessToken) {
            return;
        }
        refreshCloud();
        refreshProfile();
    }, [accessToken, isAvailable, refreshCloud, refreshProfile]);

    useEffect(() => {
        if (!isE2E) {
            return;
        }
        if (!isAvailable) {
            setIsBackendAwake(false);
            return;
        }
        setIsBackendAwake(true);
        setWarmupRetrySeconds(null);
        setStatus((currentStatus) => (currentStatus === "warming" ? "idle" : currentStatus));
        setError((currentError) => (
            currentError && currentError.toLowerCase().includes("waking up")
                ? null
                : currentError
        ));
    }, [isAvailable, isE2E]);

    useEffect(() => {
        if (!isAvailable) {
            hasAttemptedSilentRefreshRef.current = false;
            return;
        }
        if (accessToken || hasAttemptedSilentRefreshRef.current) {
            return;
        }
        // Only attempt silent refresh when we have CSRF persisted from a prior login.
        if (!cloudClient.hasStoredCsrfToken()) {
            hasAttemptedSilentRefreshRef.current = true;
            return;
        }
        hasAttemptedSilentRefreshRef.current = true;
        void refreshToken({ silent: true });
    }, [accessToken, isAvailable, refreshToken]);

    useEffect(() => {
        if (isE2E) {
            return;
        }
        if (!isAvailable) {
            setIsBackendAwake(false);
            return;
        }
        if (accessToken || isBackendAwake || status === "authenticating") {
            return;
        }
        void probeBackend();
    }, [accessToken, isAvailable, isBackendAwake, isE2E, probeBackend, status]);

    const {
        autoSyncPushIfNeeded,
        runAutoSyncBootstrap,
        resolveAutoSyncConflictByLoadingCloud,
        resolveAutoSyncConflictByOverwritingCloud
    } = useMemo(() => createCloudAutosyncActions({
        accessToken,
        autoSyncEnabled,
        autoSyncStatus,
        cloudMeta,
        hasCloudSave,
        isAvailable,
        isBackendAwake,
        localHasActiveDungeonRun,
        status,
        syncWatermark,
        autoSyncConflict
    }, {
        setAutoSyncStatus,
        setAutoSyncConflict,
        setCloudMeta,
        setHasCloudSave,
        setError,
        setStatus
    }, {
        buildCurrentLocalSnapshot: createLocalSnapshot,
        fetchLatestCloudSave,
        overwriteCloud,
        loadCloud,
        gameDispatch: (enabled) => {
            gameStore.dispatch({ type: "uiSetCloudAutoSyncEnabled", enabled });
        }
    }), [
        accessToken,
        autoSyncEnabled,
        autoSyncStatus,
        cloudMeta,
        hasCloudSave,
        isAvailable,
        isBackendAwake,
        localHasActiveDungeonRun,
        status,
        syncWatermark,
        autoSyncConflict,
        createLocalSnapshot,
        fetchLatestCloudSave,
        overwriteCloud,
        loadCloud
    ]);

    useEffect(() => {
        if (!autoSyncEnabled) {
            return;
        }
        const intervalId = window.setInterval(() => {
            if (document.visibilityState !== "visible") {
                return;
            }
            void autoSyncPushIfNeeded();
        }, 30_000);
        return () => window.clearInterval(intervalId);
    }, [autoSyncEnabled, autoSyncPushIfNeeded]);

    useEffect(() => {
        if (!autoSyncEnabled) {
            return;
        }
        const handleVisibility = () => {
            if (document.visibilityState !== "hidden") {
                return;
            }
            void autoSyncPushIfNeeded();
        };
        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, [autoSyncEnabled, autoSyncPushIfNeeded]);

    useEffect(() => {
        if (!autoSyncEnabled || autoSyncStatus === "conflict") {
            return;
        }
        if (!isAvailable || !accessToken) {
            return;
        }
        if (!isBackendAwake || status === "warming" || status === "authenticating") {
            return;
        }

        const signature = `${autoSyncBootstrapRef.current}:${accessToken ? "1" : "0"}`;
        if (lastAutoSyncBootstrapSignatureRef.current === signature) {
            return;
        }
        lastAutoSyncBootstrapSignatureRef.current = signature;

        setAutoSyncStatus("syncing");
        void runAutoSyncBootstrap();
    }, [
        accessToken,
        autoSyncEnabled,
        autoSyncStatus,
        isAvailable,
        isBackendAwake,
        runAutoSyncBootstrap,
        status
    ]);

    useEffect(() => {
        if (isAvailable) {
            return;
        }
        // Stop any pending warmup retries when cloud becomes unavailable (offline / missing API base).
        cancelWarmupRetry();
    }, [cancelWarmupRetry, isAvailable]);

    useEffect(() => {
        if (status !== "warming") {
            if (warmupRetrySeconds !== null) {
                setWarmupRetrySeconds(null);
            }
            return;
        }
        if (warmupRetrySeconds === null || warmupRetrySeconds <= 0) {
            return;
        }
        const timeout = setTimeout(() => {
            setWarmupRetrySeconds((prev) => (prev && prev > 0 ? prev - 1 : prev));
        }, 1000);
        return () => clearTimeout(timeout);
    }, [status, warmupRetrySeconds]);

    return {
        status,
        error,
        warmupRetrySeconds,
        isBackendAwake,
        cloudMeta,
        localMeta,
        lastSyncAt,
        hasCloudSave,
        localHasActiveDungeonRun,
        cloudHasActiveDungeonRun,
        isAvailable,
        accessToken,
        profile,
        isUpdatingProfile,
        autoSyncEnabled,
        autoSyncStatus,
        autoSyncConflict,
        authenticate,
        refreshCloud,
        refreshProfile,
        updateUsername,
        loadCloud,
        overwriteCloud,
        setAutoSyncEnabled: setAutoSyncEnabledPreference,
        resolveAutoSyncConflictByLoadingCloud,
        resolveAutoSyncConflictByOverwritingCloud,
        logout,
        retryWarmupNow
    } satisfies CloudSaveController;
};
