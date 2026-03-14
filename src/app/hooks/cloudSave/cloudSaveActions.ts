import { buildSaveFingerprint } from "../../../core/saveFingerprint";
import type { CloudProfile } from "../../api/cloudClient";
import { cloudClient } from "../../api/cloudClient";
import { gameRuntime } from "../../game";
import type { CloudSyncWatermark } from "../../../adapters/persistence/cloudSyncWatermark";
import {
    CloudWarmupCancelledError,
    LOCAL_CLOUD_DIVERGENCE_MESSAGE,
    hasActiveDungeonRunInPayload,
    isConflictError,
    toCloudMetaFromApiMeta,
    toDateOrNull,
    toRevisionOrNull,
    type CloudSaveMeta,
    type CloudSaveState,
    type LocalSaveSnapshot
} from "./cloudSaveModel";

type StateDeps = {
    accessToken: string | null;
    appVersion: string;
    virtualScore: number;
    isAvailable: boolean;
    cloudMeta: CloudSaveMeta | null;
    cloudPayload: unknown | null;
    hasCloudSave: boolean;
    syncWatermark: CloudSyncWatermark | null;
};

type SetterDeps = {
    setAccessToken: (value: string | null) => void;
    setCloudMeta: (value: CloudSaveMeta | null) => void;
    setCloudPayload: (value: unknown | null) => void;
    setHasCloudSave: (value: boolean) => void;
    setCloudHasActiveDungeonRun: (value: boolean) => void;
    setStatus: (value: CloudSaveState["status"] | ((current: CloudSaveState["status"]) => CloudSaveState["status"])) => void;
    setError: (value: string | null) => void;
    setIsBackendAwake: (value: boolean) => void;
    setLastSyncAt: (value: Date | null) => void;
    setProfile: (value: CloudProfile | null) => void;
    setIsUpdatingProfile: (value: boolean) => void;
    setAutoSyncStatus: (value: CloudSaveState["autoSyncStatus"] | ((current: CloudSaveState["autoSyncStatus"]) => CloudSaveState["autoSyncStatus"])) => void;
    setAutoSyncConflict: (value: CloudSaveState["autoSyncConflict"]) => void;
    setWarmupRetrySeconds: (value: number | null) => void;
};

type BehaviorDeps = {
    cancelWarmupRetry: () => void;
    clearSyncWatermark: () => void;
    persistSyncWatermark: (next: { cloudRevision: number | null; localFingerprint: string | null }) => void;
    buildCurrentLocalSnapshot: () => LocalSaveSnapshot;
    applyRequestError: (err: unknown, fallback: string) => void;
    resolveErrorMessage: (err: unknown, fallback: string) => string;
    withWarmupRetry: <T>(statusOnStart: CloudSaveState["status"], action: () => Promise<T>) => Promise<T>;
    withRefreshRetry: <T>(action: (token: string | null) => Promise<T>) => Promise<T>;
};

type RequestDeps = {
    setLastRequestRef: (request: (() => Promise<void>) | null) => void;
};

export const createCloudSaveActions = (
    state: StateDeps,
    setters: SetterDeps,
    behavior: BehaviorDeps,
    request: RequestDeps
) => {
    const authenticate = async (mode: "login" | "register", email: string, password: string) => {
        request.setLastRequestRef(() => authenticate(mode, email, password));
        if (!state.isAvailable) {
            setters.setIsBackendAwake(false);
            setters.setStatus("offline");
            setters.setError("Cloud sync is unavailable.");
            return;
        }
        setters.setError(null);
        try {
            const token = await behavior.withWarmupRetry("authenticating", () => (
                mode === "register"
                    ? cloudClient.register(email, password)
                    : cloudClient.login(email, password)
            ));
            setters.setIsBackendAwake(true);
            setters.setAccessToken(token);
            setters.setStatus("ready");
        } catch (err) {
            if (err instanceof CloudWarmupCancelledError) {
                return;
            }
            behavior.applyRequestError(err, "Authentication failed.");
        }
    };

    const fetchLatestCloudSave = async (): Promise<Awaited<ReturnType<typeof cloudClient.getLatestSave>>> => {
        request.setLastRequestRef(async () => {
            await fetchLatestCloudSave();
        });
        if (!state.isAvailable) {
            setters.setIsBackendAwake(false);
            setters.setStatus("offline");
            setters.setError("Cloud sync is unavailable.");
            return null;
        }
        setters.setError(null);
        try {
            const response = await behavior.withWarmupRetry("idle", () => behavior.withRefreshRetry((token) => cloudClient.getLatestSave(token)));
            setters.setIsBackendAwake(true);
            if (!response) {
                setters.setHasCloudSave(false);
                setters.setCloudMeta(null);
                setters.setCloudPayload(null);
                setters.setCloudHasActiveDungeonRun(false);
                setters.setLastSyncAt(new Date());
                setters.setStatus("ready");
                return null;
            }
            setters.setHasCloudSave(true);
            setters.setCloudPayload(response.payload);
            setters.setCloudHasActiveDungeonRun(hasActiveDungeonRunInPayload(response.payload));
            setters.setCloudMeta(toCloudMetaFromApiMeta(response.meta));
            setters.setLastSyncAt(new Date());
            setters.setStatus("ready");
            return response;
        } catch (err) {
            if (err instanceof CloudWarmupCancelledError) {
                return null;
            }
            behavior.applyRequestError(err, "Failed to fetch cloud save.");
            return null;
        }
    };

    const refreshCloud = async () => {
        await fetchLatestCloudSave();
    };

    const refreshProfile = async () => {
        request.setLastRequestRef(refreshProfile);
        if (!state.isAvailable) {
            setters.setIsBackendAwake(false);
            setters.setStatus("offline");
            setters.setError("Cloud sync is unavailable.");
            return;
        }
        setters.setError(null);
        try {
            const profileResponse = await behavior.withWarmupRetry("idle", () => behavior.withRefreshRetry((token) => cloudClient.getProfile(token)));
            setters.setIsBackendAwake(true);
            setters.setProfile(profileResponse);
            setters.setStatus("ready");
        } catch (err) {
            if (err instanceof CloudWarmupCancelledError) {
                return;
            }
            behavior.applyRequestError(err, "Failed to fetch cloud profile.");
        }
    };

    const updateUsername = async (usernameInput: string): Promise<{ ok: true } | { ok: false; error: string }> => {
        request.setLastRequestRef(async () => {
            await updateUsername(usernameInput);
        });
        if (!state.isAvailable) {
            setters.setIsBackendAwake(false);
            setters.setStatus("offline");
            const message = "Cloud sync is unavailable.";
            setters.setError(message);
            return { ok: false, error: message };
        }
        setters.setError(null);
        setters.setIsUpdatingProfile(true);
        const normalizedInput = usernameInput.trim();
        try {
            const profileResponse = await behavior.withWarmupRetry("idle", () => behavior.withRefreshRetry((token) => cloudClient.updateProfile(
                token,
                normalizedInput.length > 0 ? normalizedInput : null
            )));
            setters.setIsBackendAwake(true);
            setters.setProfile(profileResponse);
            setters.setStatus("ready");
            setters.setError(null);
            return { ok: true };
        } catch (err) {
            if (err instanceof CloudWarmupCancelledError) {
                return { ok: false, error: "Cloud request cancelled." };
            }
            const message = behavior.resolveErrorMessage(err, "Failed to update username.");
            behavior.applyRequestError(err, message);
            return { ok: false, error: message };
        } finally {
            setters.setIsUpdatingProfile(false);
        }
    };

    const loadCloud = async (options?: {
        payload?: unknown;
        cloudRevision?: number | null;
        cloudFingerprint?: string | null;
    }): Promise<boolean> => {
        const resolvedPayload = options?.payload ?? state.cloudPayload;
        if (!resolvedPayload) {
            setters.setError("No cloud save available.");
            return false;
        }
        try {
            const resolvedCloudFingerprint = options?.cloudFingerprint ?? buildSaveFingerprint(resolvedPayload);
            await gameRuntime.importSave(resolvedPayload as never, { origin: "cloudLoad" });
            setters.setError(null);
            setters.setStatus("ready");
            setters.setLastSyncAt(new Date());
            setters.setAutoSyncStatus("idle");
            setters.setAutoSyncConflict(null);
            behavior.persistSyncWatermark({
                cloudRevision: options?.cloudRevision ?? state.cloudMeta?.revision ?? null,
                localFingerprint: resolvedCloudFingerprint
            });
            return true;
        } catch (err) {
            behavior.applyRequestError(err, "Failed to load cloud save.");
            return false;
        }
    };

    const overwriteCloud = async (options?: { expectedRevision?: number | null; localSnapshot?: LocalSaveSnapshot }) => {
        request.setLastRequestRef(async () => {
            await overwriteCloud(options);
        });
        if (!state.isAvailable) {
            setters.setIsBackendAwake(false);
            setters.setStatus("offline");
            setters.setError("Cloud sync is unavailable.");
            return;
        }
        setters.setError(null);
        try {
            const localSnapshot = options?.localSnapshot ?? behavior.buildCurrentLocalSnapshot();
            const payload = localSnapshot.payload;
            const expectedRevision = options?.expectedRevision ?? state.cloudMeta?.revision ?? null;
            const result = await behavior.withWarmupRetry("idle", () => behavior.withRefreshRetry((token) => cloudClient.putLatestSave(
                token,
                payload,
                state.virtualScore,
                state.appVersion,
                { expectedRevision }
            )));
            const nextCloudMeta = toCloudMetaFromApiMeta(result.meta);
            setters.setIsBackendAwake(true);
            setters.setCloudMeta(nextCloudMeta);
            setters.setCloudPayload(payload);
            setters.setHasCloudSave(true);
            setters.setLastSyncAt(new Date());
            setters.setStatus("ready");
            setters.setAutoSyncStatus("idle");
            setters.setAutoSyncConflict(null);
            behavior.persistSyncWatermark({
                cloudRevision: nextCloudMeta.revision,
                localFingerprint: localSnapshot.fingerprint
            });
        } catch (err) {
            if (err instanceof CloudWarmupCancelledError) {
                return;
            }
            if (isConflictError(err)) {
                const message = LOCAL_CLOUD_DIVERGENCE_MESSAGE;
                const parsed = (() => {
                    try {
                        return JSON.parse(err.body) as Record<string, unknown>;
                    } catch {
                        return null;
                    }
                })();
                const metaRaw = (parsed?.meta ?? null) as Record<string, unknown> | null;
                const conflictMeta: CloudSaveMeta = {
                    updatedAt: toDateOrNull((metaRaw?.updatedAt as string | Date | null | undefined) ?? null),
                    virtualScore: Number.isFinite(metaRaw?.virtualScore) ? Number(metaRaw?.virtualScore) : (state.cloudMeta?.virtualScore ?? 0),
                    appVersion: typeof metaRaw?.appVersion === "string" ? metaRaw.appVersion : (state.cloudMeta?.appVersion ?? state.appVersion),
                    revision: toRevisionOrNull(metaRaw?.revision ?? null)
                };
                setters.setAutoSyncStatus("conflict");
                setters.setAutoSyncConflict({ meta: conflictMeta, message });
                setters.setCloudMeta(conflictMeta);
                setters.setHasCloudSave(true);
                setters.setStatus("ready");
                setters.setError(message);
                return;
            }
            behavior.applyRequestError(err, "Failed to upload cloud save.");
        }
    };

    const logout = () => {
        behavior.cancelWarmupRetry();
        cloudClient.clearAccessToken();
        cloudClient.clearCsrfToken();
        behavior.clearSyncWatermark();
        setters.setAccessToken(null);
        setters.setCloudMeta(null);
        setters.setCloudPayload(null);
        setters.setHasCloudSave(false);
        setters.setCloudHasActiveDungeonRun(false);
        setters.setProfile(null);
        setters.setIsUpdatingProfile(false);
        setters.setStatus("idle");
        setters.setError(null);
        setters.setWarmupRetrySeconds(null);
        setters.setLastSyncAt(null);
    };

    return {
        authenticate,
        fetchLatestCloudSave,
        refreshCloud,
        refreshProfile,
        updateUsername,
        loadCloud,
        overwriteCloud,
        logout
    };
};
