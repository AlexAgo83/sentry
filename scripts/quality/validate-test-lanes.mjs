import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const configPath = path.join(rootDir, "scripts", "quality", "test-lanes.config.json");
const config = JSON.parse(readFileSync(configPath, "utf8"));

const seen = new Map();
const laneEntries = Object.entries(config.lanes ?? {});

if (laneEntries.length === 0) {
    console.error("[test-lanes] No lanes configured.");
    process.exit(1);
}

for (const [laneName, files] of laneEntries) {
    if (!Array.isArray(files) || files.length === 0) {
        console.error(`[test-lanes] Lane "${laneName}" must list at least one file.`);
        process.exit(1);
    }
    for (const file of files) {
        const absolutePath = path.join(rootDir, file);
        if (!existsSync(absolutePath)) {
            console.error(`[test-lanes] Missing file in lane "${laneName}": ${file}`);
            process.exit(1);
        }
        const owner = seen.get(file);
        if (owner) {
            console.error(`[test-lanes] File "${file}" is assigned to multiple lanes: ${owner}, ${laneName}`);
            process.exit(1);
        }
        seen.set(file, laneName);
    }
}

console.log("[test-lanes] Lane contract valid.");
for (const [laneName, files] of laneEntries) {
    console.log(`- ${laneName}: ${files.length} files`);
}
