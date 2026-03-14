// @vitest-environment node
import { describe, expect, it } from "vitest";

type ReleaseChangelogModule = {
    normalizeTagOrVersion: (value: string | null | undefined) => { tag: string; version: string } | null;
    getChangelogFilenameForVersion: (version: string) => string;
    resolveReleaseChangelog: (input: { cwd?: string; tagOrVersion: string }) => {
        ok: boolean;
        exists?: boolean;
        tag?: string;
        version?: string;
        relativePath?: string;
        error?: string;
    };
};

const loadModule = async (): Promise<ReleaseChangelogModule> => {
    const mod = await import("../../../scripts/release/resolve-release-changelog.mjs");
    return mod as unknown as ReleaseChangelogModule;
};

describe("resolve release changelog helper", () => {
    it("normalizes tags and versions", async () => {
        const mod = await loadModule();
        expect(mod.normalizeTagOrVersion("v0.9.39")).toEqual({ tag: "v0.9.39", version: "0.9.39" });
        expect(mod.normalizeTagOrVersion("0.9.39")).toEqual({ tag: "v0.9.39", version: "0.9.39" });
        expect(mod.normalizeTagOrVersion("release-0.9.39")).toBeNull();
    });

    it("resolves the current curated changelog path contract", async () => {
        const mod = await loadModule();
        expect(mod.getChangelogFilenameForVersion("0.9.39")).toBe("CHANGELOGS_0_9_39.md");

        const resolution = mod.resolveReleaseChangelog({
            cwd: process.cwd(),
            tagOrVersion: "v0.9.39"
        });

        expect(resolution.ok).toBe(true);
        expect(resolution.exists).toBe(true);
        expect(resolution.relativePath).toBe("changelogs/CHANGELOGS_0_9_39.md");
    });

    it("keeps missing changelogs non-fatal for fallback flows", async () => {
        const mod = await loadModule();
        const resolution = mod.resolveReleaseChangelog({
            cwd: process.cwd(),
            tagOrVersion: "v9.9.9"
        });

        expect(resolution.ok).toBe(true);
        expect(resolution.exists).toBe(false);
        expect(resolution.relativePath).toBe("changelogs/CHANGELOGS_9_9_9.md");
    });
});
