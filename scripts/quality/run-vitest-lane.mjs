import { readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const laneName = process.argv[2];
if (!laneName) {
    console.error("Usage: node scripts/quality/run-vitest-lane.mjs <lane-name>");
    process.exit(1);
}

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const configPath = path.join(rootDir, "scripts", "quality", "test-lanes.config.json");
const config = JSON.parse(readFileSync(configPath, "utf8"));
const files = config.lanes?.[laneName];

if (!Array.isArray(files) || files.length === 0) {
    console.error(`[test-lanes] Unknown or empty lane "${laneName}".`);
    process.exit(1);
}

const result = spawnSync(
    "npx",
    ["vitest", "--config", "vitest.ci.mjs", "run", ...files],
    {
        cwd: rootDir,
        stdio: "inherit",
        shell: true
    }
);

process.exit(result.status ?? 1);
