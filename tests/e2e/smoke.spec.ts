import { test, expect } from "@playwright/test";

const HERO_NAME = "E2E Hero";
const PLAYWRIGHT_WEB_PORT = process.env.PLAYWRIGHT_WEB_PORT ?? "5173";
const STARTUP_CLOUD_PROMPT_TIMEOUT_MS = 10_000;
const E2E_ORIGIN = `http://127.0.0.1:${PLAYWRIGHT_WEB_PORT}`;

const corsHeadersFor = (route: import("@playwright/test").Route) => {
    return {
        "access-control-allow-origin": E2E_ORIGIN,
        "access-control-allow-credentials": "true",
        "access-control-allow-methods": "GET,POST,PUT,PATCH,OPTIONS",
        "access-control-allow-headers": "content-type,authorization,x-csrf-token"
    };
};

const fulfillCorsJson = async (
    route: import("@playwright/test").Route,
    status: number,
    body: unknown
) => {
    await route.fulfill({
        status,
        contentType: "application/json",
        headers: corsHeadersFor(route),
        body: JSON.stringify(body)
    });
};

const handleCorsPreflight = async (route: import("@playwright/test").Route) => {
    if (route.request().method() !== "OPTIONS") {
        return false;
    }
    await route.fulfill({
        status: 204,
        headers: corsHeadersFor(route)
    });
    return true;
};

const ensureHero = async (page: import("@playwright/test").Page) => {
    const input = page.getByTestId("onboarding-hero-name");
    if (await input.count()) {
        await input.fill(HERO_NAME);
        await page.getByTestId("onboarding-create-hero").click();
        await expect(input).toBeHidden();
    }
};

const dismissStartupCloudPrompt = async (
    page: import("@playwright/test").Page,
    timeout = STARTUP_CLOUD_PROMPT_TIMEOUT_MS
) => {
    const deferCloudPrompt = page.getByRole("button", { name: "Not now" });
    const promptVisible = await deferCloudPrompt.waitFor({ state: "visible", timeout })
        .then(() => true)
        .catch(() => false);
    if (promptVisible) {
        await deferCloudPrompt.click();
        await expect(deferCloudPrompt).toBeHidden();
    }
    await expect(page.locator(".ts-modal-backdrop")).toHaveCount(0);
};

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        window.localStorage.clear();
    });
    await page.goto("/");
    await ensureHero(page);
    await dismissStartupCloudPrompt(page);
});

test("new game onboarding", async ({ page }) => {
    await expect(page.getByTestId("roster-panel")).toContainText(HERO_NAME);
});

test("inventory sell flow", async ({ page }) => {
    await page.evaluate(() => {
        const api = (window as unknown as { __E2E__?: { addInventoryItem?: (id: string, count: number) => void } }).__E2E__;
        api?.addInventoryItem?.("meat", 3);
    });

    await page.getByTestId("tab-inventory").click();
    const meatSlot = page.getByTestId("inventory-slot-meat");
    await expect(meatSlot).toBeVisible();
    await meatSlot.click();

    await page.getByTestId("inventory-sell-all").click();
    const confirmSell = page.getByTestId("inventory-confirm-sell");
    await expect(confirmSell).toBeVisible();
    await confirmSell.click();
    await expect(confirmSell).toBeHidden();
});

test("cloud auth, upload, download, conflict", async ({ page }) => {
    await page.route("**/api/v1/**", async (route) => {
        if (!(await handleCorsPreflight(route))) {
            await route.fallback();
        }
    });

    await page.route("**/health", async (route) => {
        if (await handleCorsPreflight(route)) {
            return;
        }
        await fulfillCorsJson(route, 200, { ok: true });
    });

    await page.route("**/api/v1/auth/login", async (route) => {
        if (await handleCorsPreflight(route)) {
            return;
        }
        await fulfillCorsJson(route, 200, { accessToken: "e2e-token" });
    });

    let savePayload: unknown = null;

    await page.route("**/api/v1/saves/latest", async (route) => {
        if (await handleCorsPreflight(route)) {
            return;
        }
        const method = route.request().method();
        if (method === "GET") {
            await fulfillCorsJson(route, 200, {
                payload: savePayload,
                meta: {
                    updatedAt: new Date().toISOString(),
                    virtualScore: 1234,
                    appVersion: "0.0.0"
                }
            });
            return;
        }
        if (method === "PUT") {
            await fulfillCorsJson(route, 200, {
                meta: {
                    updatedAt: new Date().toISOString(),
                    virtualScore: 9999,
                    appVersion: "0.8.18"
                }
            });
            return;
        }
        await route.fallback();
    });

    await page.route("**/api/v1/users/me/profile", async (route) => {
        if (await handleCorsPreflight(route)) {
            return;
        }
        const method = route.request().method();
        if (method === "GET") {
            await fulfillCorsJson(route, 200, { profile: {
                    email: "e2e@example.com",
                    username: "E2EPlayer",
                    maskedEmail: "e2e@example.com",
                    displayName: "E2EPlayer"
                } 
            });
            return;
        }
        if (method === "PATCH") {
            const requestBody = route.request().postDataJSON() as { username?: string | null };
            const nextUsername = requestBody?.username ?? null;
            await fulfillCorsJson(route, 200, { profile: {
                    email: "e2e@example.com",
                    username: nextUsername,
                    maskedEmail: "e2e@example.com",
                    displayName: nextUsername || "e2e@example.com"
                } 
            });
            return;
        }
        await route.fallback();
    });

    await page.goto("/");
    await ensureHero(page);
    await dismissStartupCloudPrompt(page);

    savePayload = await page.evaluate(() => {
        const api = (window as unknown as { __E2E__?: { getSavePayload?: () => unknown } }).__E2E__;
        return api?.getSavePayload?.() ?? null;
    });

    await page.getByRole("button", { name: "Open settings" }).first().click();
    await page.getByTestId("open-save-options").click();
    await page.getByTestId("open-cloud-save").click();

    await page.evaluate((payload) => {
        const api = (window as unknown as {
            __E2E__?: {
                setCloudAccessToken?: (token: string | null) => void;
                setCloudSnapshot?: (snapshot: {
                    payload: unknown;
                    meta: { updatedAt: string; virtualScore: number; appVersion: string; revision: number };
                } | null) => void;
            };
        }).__E2E__;
        api?.setCloudAccessToken?.("e2e-token");
        api?.setCloudSnapshot?.({
            payload,
            meta: {
                updatedAt: new Date().toISOString(),
                virtualScore: 1234,
                appVersion: "0.0.0",
                revision: 1
            }
        });
    }, savePayload);
    await expect(page.getByTestId("cloud-logout")).toBeVisible();
    await expect(page.getByTestId("cloud-diff-header")).toBeVisible();

    await page.getByTestId("cloud-load").click();
    await expect(page.getByRole("dialog", { name: "Cloud Save" }).getByRole("button", { name: "Back" })).toBeVisible();
});

test.describe("mobile roster navigation", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("open roster tab", async ({ page }) => {
        await page.getByRole("button", { name: "Open roster" }).click();
        await expect(page.locator(".app-roster-drawer")).toHaveClass(/is-open/);
        await expect(page.getByTestId("roster-panel")).toBeVisible();
    });

    test("closing roster tab removes global scroll lock", async ({ page }) => {
        await page.getByRole("button", { name: "Open roster" }).click();
        await expect(page.locator(".app-roster-drawer")).toHaveClass(/is-open/);

        await expect.poll(async () => page.evaluate(() => ({
            classOn: document.body.classList.contains("is-roster-drawer-open"),
            bodyOverflow: document.body.style.overflow,
            htmlOverflow: document.documentElement.style.overflow
        }))).toEqual({
            classOn: true,
            bodyOverflow: "hidden",
            htmlOverflow: ""
        });

        await page.locator(".app-roster-drawer-backdrop").click({ position: { x: 300, y: 300 } });
        await expect(page.locator(".app-roster-drawer")).not.toHaveClass(/is-open/);

        await expect.poll(async () => page.evaluate(() => ({
            classOn: document.body.classList.contains("is-roster-drawer-open"),
            bodyOverflow: document.body.style.overflow,
            htmlOverflow: document.documentElement.style.overflow
        }))).toEqual({
            classOn: false,
            bodyOverflow: "",
            htmlOverflow: ""
        });
    });
});
