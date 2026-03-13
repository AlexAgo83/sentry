#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nodeCmd = process.execPath;
const playwrightCli = require.resolve("@playwright/test/cli");
const args = process.argv.slice(2);
const env = { ...process.env };

if (env.NO_COLOR) {
    delete env.NO_COLOR;
    delete env.FORCE_COLOR;
}

const result = spawnSync(nodeCmd, [playwrightCli, ...args], {
    stdio: "inherit",
    env,
});

if (result.error) {
    throw result.error;
}

process.exit(result.status ?? 1);
