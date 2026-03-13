import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const allowlistPath = path.join(rootDir, "scripts", "quality", "timeout-governance.allowlist.json");
const allowlist = JSON.parse(readFileSync(allowlistPath, "utf8"));
const allowedPatterns = new Set(allowlist.allowedPatterns ?? []);

const collectTestFiles = (relativeDir) => {
    const absoluteDir = path.join(rootDir, relativeDir);
    const results = [];
    if (!statSync(absoluteDir, { throwIfNoEntry: false })?.isDirectory()) {
        return results;
    }
    const walk = (currentDir) => {
        for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
            const absolutePath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                walk(absolutePath);
                continue;
            }
            if (!entry.isFile()) {
                continue;
            }
            if (!absolutePath.endsWith(".test.ts") && !absolutePath.endsWith(".test.tsx")) {
                continue;
            }
            results.push(path.relative(rootDir, absolutePath));
        }
    };
    walk(absoluteDir);
    return results;
};

const targetFiles = [
    ...collectTestFiles("tests/app"),
    ...collectTestFiles("tests/core"),
    ...collectTestFiles("tests/backend"),
    ...collectTestFiles("tests/compat")
];

const timeoutPattern = /\b(test|it|describe)\s*\([^)]*\{\s*timeout\s*:\s*\d+/m;
const setTimeoutPattern = /\btest\.setTimeout\s*\(|\bit\.setTimeout\s*\(|\bvi\.setConfig\s*\(\s*\{\s*testTimeout/m;
const violations = [];

for (const relativePath of targetFiles) {
    if (allowedPatterns.has(relativePath)) {
        continue;
    }
    const content = readFileSync(path.join(rootDir, relativePath), "utf8");
    if (timeoutPattern.test(content) || setTimeoutPattern.test(content)) {
        violations.push(relativePath);
    }
}

if (violations.length > 0) {
    console.error("[timeout-governance] Unapproved timeout overrides found:");
    for (const violation of violations) {
        console.error(`- ${violation}`);
    }
    process.exit(1);
}

console.log("[timeout-governance] No unapproved timeout overrides found.");
