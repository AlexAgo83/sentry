import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type ThrowingStorage = Storage & {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
};

const originalLocalStorage = globalThis.localStorage;

const installStorage = (storage: Storage) => {
    Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: storage
    });
};

const buildThrowingStorage = (storedCsrfToken: string | null = null): ThrowingStorage => {
    let csrfValue = storedCsrfToken;
    return {
        length: csrfValue ? 1 : 0,
        clear: vi.fn(() => {
            csrfValue = null;
        }),
        getItem: vi.fn((key: string) => {
            if (key === "sentry.cloud.csrfToken") {
                return csrfValue;
            }
            return null;
        }),
        key: vi.fn(() => null),
        removeItem: vi.fn(() => {
            throw new Error("storage denied");
        }),
        setItem: vi.fn(() => {
            throw new Error("storage denied");
        })
    } as unknown as ThrowingStorage;
};

describe("cloudClient storage hardening", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.stubEnv("VITE_API_BASE", "https://api.example.test");
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
        installStorage(originalLocalStorage);
    });

    it("keeps login recoverable when csrf persistence writes throw", async () => {
        installStorage(buildThrowingStorage());
        vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
            accessToken: "login-token",
            csrfToken: "csrf-login"
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        })));

        const { cloudClient } = await import("../../../src/app/api/cloudClient");

        await expect(cloudClient.login("test@example.com", "password123")).resolves.toBe("login-token");
        expect(cloudClient.loadAccessToken()).toBe("login-token");
    });

    it("keeps refresh recoverable when csrf persistence writes throw", async () => {
        installStorage(buildThrowingStorage("csrf-existing"));
        vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
            accessToken: "refresh-token",
            csrfToken: "csrf-next"
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        })));

        const { cloudClient } = await import("../../../src/app/api/cloudClient");

        await expect(cloudClient.refresh()).resolves.toBe("refresh-token");
        expect(cloudClient.loadAccessToken()).toBe("refresh-token");
    });

    it("swallows csrf cleanup failures", async () => {
        const storage = buildThrowingStorage("csrf-existing");
        installStorage(storage);
        const { cloudClient } = await import("../../../src/app/api/cloudClient");

        expect(() => cloudClient.clearCsrfToken()).not.toThrow();
        expect(storage.removeItem).toHaveBeenCalledWith("sentry.cloud.csrfToken");
    });
});
