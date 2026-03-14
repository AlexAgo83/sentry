import { toGameSave } from "../../../core/serialization";
import { buildSaveFingerprint } from "../../../core/saveFingerprint";
import { parseSaveEnvelopeMeta } from "../../../adapters/persistence/saveEnvelope";
import { readRawSave } from "../../../adapters/persistence/localStorageKeys";
import type { CloudApiError, CloudProfile } from "../../api/cloudClient";

export type CloudSaveMeta = {
    updatedAt: Date | null;
    virtualScore: number;
    appVersion: string;
    revision: number | null;
};

export type CloudSaveState = {
    status: "idle" | "authenticating" | "ready" | "error" | "offline" | "warming";
    error: string | null;
    warmupRetrySeconds: number | null;
    isBackendAwake: boolean;
    cloudMeta: CloudSaveMeta | null;
    localMeta: CloudSaveMeta;
    lastSyncAt: Date | null;
    hasCloudSave: boolean;
    localHasActiveDungeonRun: boolean;
    cloudHasActiveDungeonRun: boolean;
    isAvailable: boolean;
    accessToken: string | null;
    profile: CloudProfile | null;
    isUpdatingProfile: boolean;
    autoSyncEnabled: boolean;
    autoSyncStatus: "idle" | "syncing" | "conflict";
    autoSyncConflict: { meta: CloudSaveMeta; message: string } | null;
};

export type LocalSaveSnapshot = {
    payload: ReturnType<typeof toGameSave>;
    fingerprint: string;
};

export type CloudSaveController = CloudSaveState & {
    authenticate: (mode: "login" | "register", email: string, password: string) => Promise<void>;
    refreshCloud: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    updateUsername: (usernameInput: string) => Promise<{ ok: true } | { ok: false; error: string }>;
    loadCloud: (options?: { payload?: unknown; cloudRevision?: number | null; cloudFingerprint?: string | null }) => Promise<boolean>;
    overwriteCloud: (options?: { expectedRevision?: number | null; localSnapshot?: LocalSaveSnapshot }) => Promise<void>;
    setAutoSyncEnabled: (enabled: boolean) => void;
    resolveAutoSyncConflictByLoadingCloud: () => Promise<void>;
    resolveAutoSyncConflictByOverwritingCloud: () => Promise<void>;
    logout: () => void;
    retryWarmupNow: () => void;
};

export const LOCAL_CLOUD_DIVERGENCE_MESSAGE = "Both local and cloud saves changed since the last sync. Choose which version to keep.";
export const AUTO_SYNC_FEATURE_ENABLED = false;
export const WARMUP_RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 16000, 30000];

export const toDateOrNull = (value: string | Date | null): Date | null => {
    if (!value) {
        return null;
    }
    if (value instanceof Date) {
        return value;
    }
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) ? parsed : null;
};

export const toRevisionOrNull = (value: unknown): number | null => {
    if (!Number.isFinite(value)) {
        return null;
    }
    return Math.floor(Number(value));
};

export const toCloudMetaFromApiMeta = (meta: {
    updatedAt: string | Date | null;
    virtualScore: number;
    appVersion: string;
    revision?: unknown;
}): CloudSaveMeta => ({
    updatedAt: toDateOrNull(meta.updatedAt),
    virtualScore: meta.virtualScore,
    appVersion: meta.appVersion,
    revision: toRevisionOrNull(meta.revision ?? null)
});

export const buildLocalMeta = (virtualScore: number, appVersion: string): CloudSaveMeta => {
    const raw = readRawSave();
    const envelopeMeta = raw ? parseSaveEnvelopeMeta(raw) : { savedAt: null };
    return {
        updatedAt: envelopeMeta.savedAt ? new Date(envelopeMeta.savedAt) : new Date(),
        virtualScore,
        appVersion,
        revision: null
    };
};

const isRecord = (value: unknown): value is Record<string, unknown> => (
    Boolean(value) && typeof value === "object"
);

export const hasActiveDungeonRunInPayload = (payload: unknown): boolean => {
    if (!isRecord(payload)) {
        return false;
    }
    const dungeon = payload.dungeon;
    if (!isRecord(dungeon)) {
        return false;
    }
    const activeRunId = dungeon.activeRunId;
    return typeof activeRunId === "string" && activeRunId.trim().length > 0;
};

export const isUnauthorizedError = (err: unknown): err is CloudApiError => (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    (err as { status?: number }).status !== undefined &&
    [401, 403].includes((err as { status: number }).status)
);

export const isConflictError = (err: unknown): err is CloudApiError => (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    (err as { status?: number }).status === 409
);

export class CloudWarmupCancelledError extends Error {
    constructor() {
        super("Cloud warmup cancelled.");
        this.name = "CloudWarmupCancelledError";
    }
}

export const isWarmupError = (err: unknown) => {
    if (typeof err === "object" && err !== null && "status" in err) {
        return [502, 503, 504].includes((err as { status: number }).status);
    }
    if (err instanceof DOMException && err.name === "AbortError") {
        return true;
    }
    if (err instanceof Error && err.name === "AbortError") {
        return true;
    }
    if (err instanceof TypeError) {
        return err.message.toLowerCase().includes("fetch");
    }
    return false;
};

export const warmupMessage = (seconds?: number) => (
    seconds
        ? `Cloud backend is waking up… retrying in ${seconds}s.`
        : "Cloud backend is still waking up. Please retry in a moment."
);

export const buildCurrentLocalSnapshot = (state: unknown): LocalSaveSnapshot => {
    const payload = toGameSave(state as Parameters<typeof toGameSave>[0]);
    return {
        payload,
        fingerprint: buildSaveFingerprint(payload)
    };
};
