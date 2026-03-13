#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";
const args = process.argv.slice(2);
const env = { ...process.env };

if (env.FORCE_COLOR && env.NO_COLOR) {
    delete env.NO_COLOR;
}

const result = spawnSync(npxCmd, ["playwright", ...args], {
    stdio: "inherit",
    env,
});

if (result.error) {
    throw result.error;
}

process.exit(result.status ?? 1);
