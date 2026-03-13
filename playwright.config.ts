import { defineConfig } from "@playwright/test";

const webHost = process.env.PLAYWRIGHT_WEB_HOST ?? "127.0.0.1";
const webPort = process.env.PLAYWRIGHT_WEB_PORT ?? "5173";
const baseURL = `http://${webHost}:${webPort}`;

export default defineConfig({
    testDir: "tests/e2e",
    timeout: 60_000,
    expect: {
        timeout: 10_000
    },
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    use: {
        baseURL,
        testIdAttribute: "data-testid",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        serviceWorkers: "block"
    },
    webServer: {
        command: `npm run dev -- --host ${webHost} --port ${webPort} --strictPort`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        env: {
            VITE_E2E: "true",
            VITE_API_BASE: "http://127.0.0.1:4177"
        }
    }
});
