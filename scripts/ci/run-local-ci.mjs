#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..", "..");
const rawArgs = new Set(process.argv.slice(2));
const isFastMode = rawArgs.has("--fast");

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";
const localPlaywrightPort = process.env.LOCAL_CI_PLAYWRIGHT_PORT ?? "4173";

const baseEnv = {
    ...process.env,
    CI: "1",
};

const log = (message) => {
    process.stdout.write(`${message}\n`);
};

const run = (label, command, args = [], options = {}) => {
    log(`\n[ci:local] ${label}`);
    const result = spawnSync(command, args, {
        cwd: repoRoot,
        stdio: "inherit",
        env: {
            ...baseEnv,
            ...(options.env ?? {}),
        },
    });

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
};

const runNonBlocking = (label, command, args = [], options = {}) => {
    log(`\n[ci:local] ${label}`);
    const result = spawnSync(command, args, {
        cwd: repoRoot,
        stdio: "inherit",
        env: {
            ...baseEnv,
            ...(options.env ?? {}),
        },
    });
    if (result.status !== 0) {
        log(`[ci:local] ${label} failed but is non-blocking.`);
    }
};

const getGitOutput = (args) => {
    const result = spawnSync("git", args, {
        cwd: repoRoot,
        stdio: ["ignore", "pipe", "ignore"],
        encoding: "utf-8",
    });
    if (result.status !== 0) {
        return "";
    }
    return result.stdout.trim();
};

const parsePathList = (output) => output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const getCurrentBranch = () => process.env.GITHUB_REF_NAME
    ?? getGitOutput(["rev-parse", "--abbrev-ref", "HEAD"])
    ?? "";

const listLogicsDocs = () => {
    const output = getGitOutput(["ls-files", "logics/request", "logics/backlog", "logics/tasks"]);
    return parsePathList(output);
};

const detectGithubChangedLogicsDocs = () => {
    const eventName = process.env.EVENT_NAME ?? "";
    const prBaseSha = process.env.PR_BASE_SHA ?? "";
    const prHeadSha = process.env.PR_HEAD_SHA ?? "";
    const pushBeforeSha = process.env.PUSH_BEFORE_SHA ?? "";
    const pushAfterSha = process.env.PUSH_AFTER_SHA ?? "";

    let range = "";
    if (eventName === "pull_request" && prBaseSha && prHeadSha) {
        range = `${prBaseSha}...${prHeadSha}`;
    } else if (pushBeforeSha && pushBeforeSha !== "0000000000000000000000000000000000000000" && pushAfterSha) {
        range = `${pushBeforeSha}...${pushAfterSha}`;
    }

    if (!range) {
        log("[ci:local] No comparable base SHA found; defaulting to existing Logics docs list.");
        return listLogicsDocs();
    }

    log(`[ci:local] Git range: ${range}`);
    const output = getGitOutput(["diff", "--name-only", range, "--", "logics/request", "logics/backlog", "logics/tasks"]);
    return parsePathList(output);
};

const detectLocalChangedLogicsDocs = () => {
    const changed = new Set();
    const commands = [
        ["diff", "--name-only", "--diff-filter=ACMRT", "--", "logics/request", "logics/backlog", "logics/tasks"],
        ["diff", "--cached", "--name-only", "--diff-filter=ACMRT", "--", "logics/request", "logics/backlog", "logics/tasks"],
        ["ls-files", "--others", "--exclude-standard", "--", "logics/request", "logics/backlog", "logics/tasks"],
    ];

    commands.forEach((args) => {
        parsePathList(getGitOutput(args)).forEach((path) => changed.add(path));
    });

    return [...changed].sort();
};

const detectChangedLogicsDocs = () => {
    if (process.env.GITHUB_ACTIONS === "true" || process.env.EVENT_NAME) {
        return detectGithubChangedLogicsDocs();
    }
    return detectLocalChangedLogicsDocs();
};

const lintChangedLogicsStatuses = (paths) => {
    const allowed = new Set(["draft", "ready", "in progress", "blocked", "done", "archived"]);
    const issues = [];
    const pattern = /^\s*>\s*Status\s*:\s*(.+)\s*$/;

    for (const relativePath of paths) {
        const absolutePath = resolve(repoRoot, relativePath);
        if (!existsSync(absolutePath)) {
            issues.push(`${relativePath}: file not found`);
            continue;
        }

        const lines = readFileSync(absolutePath, "utf-8").split(/\r?\n/);
        let value = null;
        for (const line of lines) {
            const match = pattern.exec(line);
            if (match) {
                value = match[1].trim().replace(/\s+/g, " ").toLowerCase();
                break;
            }
        }

        if (!value) {
            issues.push(`${relativePath}: missing indicator: Status`);
            continue;
        }

        if (!allowed.has(value)) {
            issues.push(
                `${relativePath}: invalid Status value: ${value} `
                + "(allowed: Draft | Ready | In progress | Blocked | Done | Archived)"
            );
        }
    }

    if (issues.length > 0) {
        log("Logics status lint: FAILED");
        issues.forEach((issue) => log(`- ${issue}`));
        process.exit(1);
    }

    log("Logics status lint: OK");
};

const runLogicsGates = () => {
    const eventName = process.env.EVENT_NAME ?? "";
    const currentBranch = getCurrentBranch();
    if (eventName === "push" && currentBranch === "release") {
        log("\n[ci:local] Skipping strict Logics workflow gates on release promotion push.");
        return;
    }

    const changedLogicsDocs = detectChangedLogicsDocs();
    if (changedLogicsDocs.length === 0) {
        log("\n[ci:local] No Logics workflow docs changed.");
        return;
    }

    log(`\n[ci:local] Changed Logics docs (${changedLogicsDocs.length})`);
    changedLogicsDocs.forEach((path) => log(`- ${path}`));

    run(
        "Logics doc lint",
        "python3",
        ["logics/skills/logics-doc-linter/scripts/logics_lint.py"],
    );

    log("\n[ci:local] Logics status lint");
    lintChangedLogicsStatuses(changedLogicsDocs);

    const hasBacklogOrTaskChanges = changedLogicsDocs.some((path) => (
        path.startsWith("logics/backlog/") || path.startsWith("logics/tasks/")
    ));

    if (!hasBacklogOrTaskChanges) {
        log("\n[ci:local] Skipping Logics flow sync/audit because no backlog/task docs changed.");
        return;
    }

    run(
        "Logics flow sync",
        "python3",
        ["logics/skills/logics-flow-manager/scripts/logics_flow.py", "sync", "close-eligible-requests"],
    );

    run("Ensure no request drift after sync", "git", ["diff", "--exit-code", "--", "logics/request"]);

    run(
        "Workflow audit (group by doc)",
        "python3",
        [
            "logics/skills/logics-flow-manager/scripts/workflow_audit.py",
            "--legacy-cutoff-version",
            "1.1.0",
            "--group-by-doc",
        ],
    );

    runNonBlocking(
        "Workflow audit (json, non-blocking)",
        "python3",
        ["logics/skills/logics-flow-manager/scripts/workflow_audit.py", "--format", "json"],
    );
};

const runFullChecks = () => {
    run("Logics kit Python tests", "python3", ["-m", "unittest", "discover", "-s", "logics/skills/tests", "-p", "test_*.py", "-v"]);
    run("Lint", npmCmd, ["run", "lint"]);
    run("Typecheck", npmCmd, ["run", "typecheck"]);
    run("Typecheck (tests)", npmCmd, ["run", "typecheck:tests"]);
    run("Validate test lane contract", npmCmd, ["run", "test:lanes:validate"]);
    run("Validate timeout governance", npmCmd, ["run", "test:timeouts:validate"]);
    run("Compatibility suite", npmCmd, ["run", "test:lane:compat"]);
    run("Test lane summary", npmCmd, ["run", "test:lanes:report"]);
    run("Flaky gate", npmCmd, ["run", "test:flaky"]);
    run("Tests (CI config)", npmCmd, ["run", "test:ci"]);

    if (isFastMode) {
        return;
    }

    run("Coverage (CI config)", npmCmd, ["run", "coverage:ci"]);

    const playwrightInstallArgs = ["playwright", "install"];
    if (process.env.GITHUB_ACTIONS === "true" && process.platform === "linux") {
        playwrightInstallArgs.push("--with-deps");
    }
    run("Playwright browsers", npxCmd, playwrightInstallArgs);

    run("E2E smoke tests", npmCmd, ["run", "test:e2e"], {
        env: process.env.GITHUB_ACTIONS === "true" ? {} : {
            PLAYWRIGHT_WEB_HOST: "127.0.0.1",
            PLAYWRIGHT_WEB_PORT: localPlaywrightPort,
        },
    });
    run("Audit production deps", npmCmd, ["audit", "--omit=dev", "--audit-level=high"]);
    run("Preview build", npmCmd, ["run", "build"]);
    run("Bundle budgets", npmCmd, ["run", "bundle:check"]);
    run("Smoke (offline recap)", npmCmd, ["run", "test:ci", "--", "tests/app/offlineRecapModal.test.tsx"]);
};

log(`[ci:local] Starting ${isFastMode ? "fast" : "full"} CI mirror`);
runLogicsGates();
runFullChecks();
log("\n[ci:local] All checks passed.");
