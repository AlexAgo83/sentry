import { buildSaveFingerprint } from "../../../core/saveFingerprint";
import type { CloudSyncWatermark } from "../../../adapters/persistence/cloudSyncWatermark";
import { resolveCloudSyncBootstrapDecision } from "../../cloudSyncDecision";
import {
    AUTO_SYNC_FEATURE_ENABLED,
    LOCAL_CLOUD_DIVERGENCE_MESSAGE,
    toCloudMetaFromApiMeta,
    toRevisionOrNull,
    type CloudSaveMeta,
    type CloudSaveState,
    type LocalSaveSnapshot
} from "./cloudSaveModel";

type AutoSyncState = {
    accessToken: string | null;
    autoSyncEnabled: boolean;
    autoSyncStatus: CloudSaveState["autoSyncStatus"];
    cloudMeta: CloudSaveMeta | null;
    hasCloudSave: boolean;
    isAvailable: boolean;
    isBackendAwake: boolean;
    localHasActiveDungeonRun: boolean;
    status: CloudSaveState["status"];
    syncWatermark: CloudSyncWatermark | null;
    autoSyncConflict: CloudSaveState["autoSyncConflict"];
};

type AutoSyncSetters = {
    setAutoSyncStatus: (value: CloudSaveState["autoSyncStatus"] | ((current: CloudSaveState["autoSyncStatus"]) => CloudSaveState["autoSyncStatus"])) => void;
    setAutoSyncConflict: (value: CloudSaveState["autoSyncConflict"]) => void;
    setCloudMeta: (value: CloudSaveMeta | null) => void;
    setHasCloudSave: (value: boolean) => void;
    setError: (value: string | null) => void;
    setStatus: (value: CloudSaveState["status"]) => void;
};

type AutoSyncDeps = {
    buildCurrentLocalSnapshot: () => LocalSaveSnapshot;
    fetchLatestCloudSave: () => Promise<{ payload: unknown; meta: { revision?: number | null; updatedAt: string | Date | null; virtualScore: number; appVersion: string } } | null>;
    overwriteCloud: (options?: { expectedRevision?: number | null; localSnapshot?: LocalSaveSnapshot }) => Promise<void>;
    loadCloud: (options?: { payload?: unknown; cloudRevision?: number | null; cloudFingerprint?: string | null }) => Promise<boolean>;
    gameDispatch: (enabled: boolean) => void;
};

export const setAutoSyncEnabledPreference = (
    persistedAutoSyncEnabled: boolean,
    autoSyncConflict: CloudSaveState["autoSyncConflict"],
    autoSyncStatus: CloudSaveState["autoSyncStatus"],
    gameDispatch: (enabled: boolean) => void,
    clearConflict: () => void,
    resetStatus: () => void
) => {
    if (AUTO_SYNC_FEATURE_ENABLED) {
        return;
    }
    if (persistedAutoSyncEnabled) {
        gameDispatch(false);
    }
    if (autoSyncStatus !== "idle") {
        resetStatus();
    }
    if (autoSyncConflict) {
        clearConflict();
    }
};

export const createCloudAutosyncActions = (
    state: AutoSyncState,
    setters: AutoSyncSetters,
    deps: AutoSyncDeps
) => {
    const autoSyncPushIfNeeded = async () => {
        if (!state.autoSyncEnabled || state.autoSyncStatus === "conflict") {
            return;
        }
        if (!state.isAvailable || !state.accessToken) {
            return;
        }
        if (!state.isBackendAwake || state.status === "warming" || state.status === "authenticating") {
            return;
        }

        const localSnapshot = deps.buildCurrentLocalSnapshot();
        if (state.syncWatermark?.localFingerprint && localSnapshot.fingerprint === state.syncWatermark.localFingerprint) {
            return;
        }

        let expectedRevision = state.cloudMeta?.revision ?? state.syncWatermark?.cloudRevision ?? null;
        if (state.hasCloudSave && expectedRevision === null) {
            const refreshed = await deps.fetchLatestCloudSave();
            expectedRevision = refreshed?.meta ? toRevisionOrNull(refreshed.meta.revision ?? null) : null;
        }

        setters.setAutoSyncStatus("syncing");
        await deps.overwriteCloud({ expectedRevision, localSnapshot });
        setters.setAutoSyncStatus((current) => (current === "conflict" ? current : "idle"));
    };

    const runAutoSyncBootstrap = async () => {
        const localSnapshot = deps.buildCurrentLocalSnapshot();
        const latest = await deps.fetchLatestCloudSave();
        const cloudRevision = latest ? toRevisionOrNull(latest.meta.revision ?? null) : null;
        const decision = resolveCloudSyncBootstrapDecision({
            watermark: state.syncWatermark,
            hasCloudSave: Boolean(latest),
            cloudRevision,
            localFingerprint: localSnapshot.fingerprint
        });

        if (!latest && decision === "overwrite_cloud") {
            await deps.overwriteCloud({ expectedRevision: null, localSnapshot });
            setters.setAutoSyncStatus((current) => (current === "conflict" ? current : "idle"));
            return;
        }

        if (!latest || decision === "noop") {
            setters.setAutoSyncStatus("idle");
            return;
        }

        const cloudMetaSnapshot = toCloudMetaFromApiMeta(latest.meta);
        const cloudFingerprint = buildSaveFingerprint(latest.payload);
        if (state.localHasActiveDungeonRun && decision === "load_cloud") {
            setters.setAutoSyncStatus("idle");
            return;
        }

        if (decision === "load_cloud") {
            await deps.loadCloud({
                payload: latest.payload,
                cloudRevision: cloudMetaSnapshot.revision,
                cloudFingerprint
            });
            setters.setAutoSyncStatus((current) => (current === "conflict" ? current : "idle"));
            return;
        }

        if (decision === "overwrite_cloud") {
            await deps.overwriteCloud({ expectedRevision: cloudMetaSnapshot.revision, localSnapshot });
            setters.setAutoSyncStatus((current) => (current === "conflict" ? current : "idle"));
            return;
        }

        const message = LOCAL_CLOUD_DIVERGENCE_MESSAGE;
        setters.setAutoSyncStatus("conflict");
        setters.setAutoSyncConflict({
            meta: cloudMetaSnapshot,
            message
        });
        setters.setCloudMeta(cloudMetaSnapshot);
        setters.setHasCloudSave(true);
        setters.setError(message);
        setters.setStatus("ready");
    };

    const resolveAutoSyncConflictByLoadingCloud = async () => {
        setters.setAutoSyncStatus("syncing");
        const latest = await deps.fetchLatestCloudSave();
        if (latest) {
            await deps.loadCloud({
                payload: latest.payload,
                cloudRevision: toRevisionOrNull(latest.meta.revision ?? null),
                cloudFingerprint: buildSaveFingerprint(latest.payload)
            });
        }
        setters.setAutoSyncStatus((current) => (current === "conflict" ? current : "idle"));
        setters.setAutoSyncConflict(null);
    };

    const resolveAutoSyncConflictByOverwritingCloud = async () => {
        const expectedRevision = state.autoSyncConflict?.meta.revision ?? state.cloudMeta?.revision ?? null;
        setters.setAutoSyncStatus("syncing");
        await deps.overwriteCloud({ expectedRevision });
        setters.setAutoSyncStatus((current) => (current === "conflict" ? current : "idle"));
        setters.setAutoSyncConflict(null);
    };

    return {
        autoSyncPushIfNeeded,
        runAutoSyncBootstrap,
        resolveAutoSyncConflictByLoadingCloud,
        resolveAutoSyncConflictByOverwritingCloud
    };
};
