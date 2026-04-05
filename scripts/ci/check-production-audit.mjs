#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const allowlistPath = path.join(__dirname, "npm-audit.allowlist.json");
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const severityRank = {
    info: 0,
    low: 1,
    moderate: 2,
    high: 3,
    critical: 4,
};
const blockingThreshold = severityRank.high;

const allowlist = JSON.parse(readFileSync(allowlistPath, "utf8"));
const allowedAdvisoryIds = new Set((allowlist.advisories ?? []).map((entry) => Number(entry.id)));
const allowlistById = new Map((allowlist.advisories ?? []).map((entry) => [Number(entry.id), entry]));

const result = spawnSync(npmCmd, ["audit", "--omit=dev", "--json"], {
    cwd: repoRoot,
    encoding: "utf8",
});

if (!result.stdout.trim()) {
    process.stderr.write("[audit] npm audit returned no JSON output.\n");
    process.exit(result.status || 1);
}

let report;
try {
    report = JSON.parse(result.stdout);
} catch (error) {
    process.stderr.write("[audit] Failed to parse npm audit JSON output.\n");
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
}

const blockingAdvisories = [];
const allowlistedHits = [];
const seenAdvisories = new Set();
const vulnerabilities = Object.values(report.vulnerabilities ?? {});

for (const vulnerability of vulnerabilities) {
    for (const via of vulnerability.via ?? []) {
        if (!via || typeof via === "string") {
            continue;
        }
        const advisoryId = Number(via.source);
        const dedupeKey = `${advisoryId}:${via.name}`;
        if (seenAdvisories.has(dedupeKey)) {
            continue;
        }
        seenAdvisories.add(dedupeKey);

        const severity = severityRank[via.severity] ?? severityRank.info;
        if (severity < blockingThreshold) {
            continue;
        }

        if (allowedAdvisoryIds.has(advisoryId)) {
            allowlistedHits.push({
                advisoryId,
                name: via.name,
                title: via.title,
                severity: via.severity,
                reason: allowlistById.get(advisoryId)?.reason ?? "No reason provided."
            });
            continue;
        }

        blockingAdvisories.push({
            advisoryId,
            name: via.name,
            title: via.title,
            severity: via.severity,
            url: via.url
        });
    }
}

if (blockingAdvisories.length > 0) {
    process.stderr.write("[audit] Blocking production advisories detected:\n");
    for (const advisory of blockingAdvisories) {
        process.stderr.write(`- ${advisory.severity.toUpperCase()} ${advisory.name} (${advisory.advisoryId}): ${advisory.title}\n`);
        if (advisory.url) {
            process.stderr.write(`  ${advisory.url}\n`);
        }
    }
    process.exit(1);
}

if (allowlistedHits.length > 0) {
    process.stdout.write("[audit] Only allowlisted high/critical advisories remain:\n");
    for (const advisory of allowlistedHits) {
        process.stdout.write(`- ${advisory.severity.toUpperCase()} ${advisory.name} (${advisory.advisoryId}): ${advisory.reason}\n`);
    }
}

process.stdout.write("[audit] Production audit gate passed.\n");
