import { hasActiveDungeonRunInPayload, toCloudMetaFromApiMeta } from "./cloudSaveModel";

type Snapshot = {
    payload: unknown;
    meta: {
        updatedAt: string | Date | null;
        virtualScore: number;
        appVersion: string;
        revision?: number | null;
    } | null;
} | null;

type BridgeDeps = {
    isEnabled: boolean;
    isAvailable: boolean;
    setAccessToken: (token: string | null) => void;
    setIsBackendAwake: (value: boolean) => void;
    setWarmupRetrySeconds: (value: number | null) => void;
    setError: (value: string | null | ((current: string | null) => string | null)) => void;
    setStatus: (value: "idle" | "ready" | "warming" | ((current: "idle" | "ready" | "warming") => "idle" | "ready" | "warming")) => void;
    setHasCloudSave: (value: boolean) => void;
    setCloudPayload: (value: unknown | null) => void;
    setCloudMeta: (value: ReturnType<typeof toCloudMetaFromApiMeta> | null) => void;
    setCloudHasActiveDungeonRun: (value: boolean) => void;
    setLastSyncAt: (value: Date | null) => void;
};

export const attachCloudE2EBridge = ({
    isEnabled,
    isAvailable,
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
}: BridgeDeps) => {
    if (!isEnabled || typeof window === "undefined") {
        return () => undefined;
    }
    const api = ((window as unknown as { __E2E__?: Record<string, unknown> }).__E2E__ ??= {});
    api.setCloudAccessToken = (token: string | null) => {
        setAccessToken(token);
        setIsBackendAwake(Boolean(token) || isAvailable);
        setWarmupRetrySeconds(null);
        setError(null);
        setStatus(token ? "ready" : "idle");
    };
    api.setCloudSnapshot = (snapshot: Snapshot) => {
        if (!snapshot) {
            setHasCloudSave(false);
            setCloudPayload(null);
            setCloudMeta(null);
            setCloudHasActiveDungeonRun(false);
            setLastSyncAt(new Date());
            setStatus("ready");
            return;
        }
        setHasCloudSave(true);
        setCloudPayload(snapshot.payload);
        setCloudHasActiveDungeonRun(hasActiveDungeonRunInPayload(snapshot.payload));
        setCloudMeta(snapshot.meta ? toCloudMetaFromApiMeta(snapshot.meta) : null);
        setLastSyncAt(new Date());
        setStatus("ready");
    };

    return () => {
        const root = (window as unknown as { __E2E__?: Record<string, unknown> }).__E2E__;
        if (!root) {
            return;
        }
        delete root.setCloudAccessToken;
        delete root.setCloudSnapshot;
    };
};
