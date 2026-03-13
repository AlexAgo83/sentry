import { readFileSync } from "node:fs";
import path from "node:path";

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const configPath = path.join(rootDir, "scripts", "quality", "test-lanes.config.json");
const config = JSON.parse(readFileSync(configPath, "utf8"));
const laneEntries = Object.entries(config.lanes ?? {});

console.log("[test-lanes] Summary");
let totalFiles = 0;
for (const [laneName, files] of laneEntries) {
    totalFiles += files.length;
    console.log(`- ${laneName}: ${files.length} files`);
}
console.log(`- total classified files: ${totalFiles}`);
