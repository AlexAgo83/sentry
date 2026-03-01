import { describe, expect, it } from "vitest";
import { createInitialGameState, createPlayerState } from "../../src/core/state";
import type { DungeonReplayState, DungeonRunState } from "../../src/core/types";
import {
    buildDungeonArenaLiveFrame,
    buildDungeonArenaReplayFrame,
    getDungeonReplayJumpMarks
} from "../../src/app/components/dungeon/arenaPlayback";

describe("dungeon arena playback", () => {
    it("builds a live frame with boss phase and focused target", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        const run: DungeonRunState = {
            id: "run-1",
            dungeonId: "dungeon_ruines_humides",
            status: "running",
            endReason: null,
            startedAt: 1_000,
            elapsedMs: 1_000,
            stepCarryMs: 0,
            encounterStep: 4,
            floor: 10,
            floorCount: 10,
            party: [
                { playerId: "1", hp: 120, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
                { playerId: "2", hp: 180, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
                { playerId: "3", hp: 200, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
                { playerId: "4", hp: 200, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 }
            ],
            enemies: [
                {
                    id: "boss-1",
                    name: "Fenwatch Brute",
                    hp: 90,
                    hpMax: 300,
                    damage: 10,
                    isBoss: true,
                    mechanic: "burst",
                    spawnIndex: 0
                }
            ],
            targetEnemyId: "boss-1",
            targetHeroId: null,
            autoRestart: true,
            restartAt: null,
            runIndex: 1,
            startInventory: { food: 10, tonic: 1, elixir: 0, potion: 0 },
            seed: 42,
            events: [
                { atMs: 0, type: "floor_start", label: "Floor 10" },
                { atMs: 0, type: "boss_start", sourceId: "boss-1", label: "Fenwatch Brute" },
                { atMs: 0, type: "spawn", sourceId: "boss-1", label: "Fenwatch Brute" },
                { atMs: 700, type: "attack", sourceId: "1", targetId: "boss-1", amount: 30, label: "Hero" },
                { atMs: 700, type: "damage", sourceId: "1", targetId: "boss-1", amount: 30 },
                { atMs: 900, type: "damage", sourceId: "boss-1", targetId: "1", amount: 80 }
            ],
            cadenceSnapshot: [],
            truncatedEvents: 0,
            nonCriticalEventCount: 0,
            threatByHeroId: { "1": 0, "2": 0, "3": 0, "4": 0 },
            threatTieOrder: ["1", "2", "3", "4"]
        };

        const frame = buildDungeonArenaLiveFrame(run, state.players, 1_000);
        const boss = frame.units.find((unit) => unit.id === "boss-1");
        expect(frame.targetEnemyId).toBe("boss-1");
        expect(boss?.hp).toBe(90);
        expect(frame.bossPhaseLabel).toBe("Boss final phase");
        expect(frame.floatingTexts.some((entry) => entry.kind === "damage")).toBe(true);
    });

    it("replays damage/heal timeline deterministically", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        const replay: DungeonReplayState = {
            runId: "run-r1",
            dungeonId: "dungeon_ruines_humides",
            status: "failed",
            endReason: "wipe",
            runIndex: 1,
            startedAt: 1_000,
            elapsedMs: 2_000,
            seed: 7,
            partyPlayerIds: ["1", "2", "3", "4"],
            teamSnapshot: [
                { playerId: "1", name: "A", equipment: state.players["1"].equipment },
                { playerId: "2", name: "B", equipment: state.players["2"].equipment },
                { playerId: "3", name: "C", equipment: state.players["3"].equipment },
                { playerId: "4", name: "D", equipment: state.players["4"].equipment }
            ],
            startInventory: { food: 10, tonic: 0, elixir: 0, potion: 1 },
            events: [
                { atMs: 0, type: "floor_start", label: "Floor 10" },
                { atMs: 10, type: "boss_start", sourceId: "boss-1", label: "Boss" },
                { atMs: 20, type: "spawn", sourceId: "boss-1", label: "Boss" },
                { atMs: 100, type: "damage", sourceId: "boss-1", targetId: "1", amount: 120 },
                { atMs: 300, type: "heal", sourceId: "1", amount: 80, label: "potion" },
                { atMs: 600, type: "damage", sourceId: "1", targetId: "boss-1", amount: 70 },
                { atMs: 900, type: "death", sourceId: "1", label: "A" },
                { atMs: 1_200, type: "run_end", label: "wipe" }
            ],
            truncated: false,
            fallbackCriticalOnly: false,
            cadenceSnapshot: [],
            threatByHeroId: { "1": 0, "2": 0, "3": 0, "4": 0 }
        };

        const beforeHeal = buildDungeonArenaReplayFrame(replay, state.players, 200);
        const afterHeal = buildDungeonArenaReplayFrame(replay, state.players, 450);
        const heroBefore = beforeHeal.units.find((unit) => unit.id === "1");
        const heroAfter = afterHeal.units.find((unit) => unit.id === "1");

        expect(heroBefore?.hp).toBeLessThan(heroAfter?.hp ?? 0);
        expect(getDungeonReplayJumpMarks(replay)).toEqual({ firstDeathAtMs: 900, runEndAtMs: 1_200 });
    });

    it("uses hp snapshots from labels so enemy hp does not jump from future events", () => {
        const state = createInitialGameState("0.9.0");
        const run: DungeonRunState = {
            id: "run-live-hp",
            dungeonId: "dungeon_ruines_humides",
            status: "running",
            endReason: null,
            startedAt: 1_000,
            elapsedMs: 1_200,
            stepCarryMs: 0,
            encounterStep: 12,
            floor: 1,
            floorCount: 10,
            party: [
                { playerId: "1", hp: 100, hpMax: 100, potionCooldownMs: 0, attackCooldownMs: 0, magicHealCooldownMs: 0 },
                { playerId: "2", hp: 100, hpMax: 100, potionCooldownMs: 0, attackCooldownMs: 0, magicHealCooldownMs: 0 },
                { playerId: "3", hp: 100, hpMax: 100, potionCooldownMs: 0, attackCooldownMs: 0, magicHealCooldownMs: 0 },
                { playerId: "4", hp: 100, hpMax: 100, potionCooldownMs: 0, attackCooldownMs: 0, magicHealCooldownMs: 0 }
            ],
            enemies: [
                {
                    id: "entity_1_1_1",
                    name: "Crawler",
                    hp: 80,
                    hpMax: 100,
                    damage: 10,
                    isBoss: false,
                    mechanic: null,
                    spawnIndex: 0
                }
            ],
            targetEnemyId: "entity_1_1_1",
            targetHeroId: null,
            autoRestart: false,
            restartAt: null,
            runIndex: 1,
            startInventory: { food: 10, tonic: 0, elixir: 0, potion: 0 },
            seed: 1,
            events: [
                { atMs: 0, type: "floor_start", label: "Floor 1" },
                { atMs: 0, type: "spawn", sourceId: "entity_1_1_1", label: "Crawler" },
                { atMs: 100, type: "damage", sourceId: "1", targetId: "entity_1_1_1", amount: 10, label: "Crawler -10 (HP 90/100)" },
                { atMs: 1_000, type: "damage", sourceId: "1", targetId: "entity_1_1_1", amount: 10, label: "Crawler -10 (HP 80/100)" }
            ],
            cadenceSnapshot: [],
            truncatedEvents: 0,
            nonCriticalEventCount: 0,
            threatByHeroId: { "1": 0, "2": 0, "3": 0, "4": 0 },
            threatTieOrder: ["1", "2", "3", "4"]
        };

        const earlyFrame = buildDungeonArenaLiveFrame(run, state.players, 150);
        const earlyEnemy = earlyFrame.units.find((unit) => unit.id === "entity_1_1_1");
        expect(earlyEnemy?.hpMax).toBe(100);
        expect(earlyEnemy?.hp).toBe(90);
    });

    it("applies deterministic top-down movement choreography with facing and spacing", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        const run: DungeonRunState = {
            id: "run-move",
            dungeonId: "dungeon_ruines_humides",
            status: "running",
            endReason: null,
            startedAt: 1_000,
            elapsedMs: 1_200,
            stepCarryMs: 0,
            encounterStep: 5,
            floor: 2,
            floorCount: 10,
            party: [
                { playerId: "1", hp: 180, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
                { playerId: "2", hp: 190, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
                { playerId: "3", hp: 170, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
                { playerId: "4", hp: 200, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 }
            ],
            enemies: [
                {
                    id: "mob-1",
                    name: "Crawler",
                    hp: 120,
                    hpMax: 200,
                    damage: 10,
                    isBoss: false,
                    mechanic: null,
                    spawnIndex: 0
                }
            ],
            targetEnemyId: "mob-1",
            targetHeroId: null,
            autoRestart: false,
            restartAt: null,
            runIndex: 1,
            startInventory: { food: 10, tonic: 0, elixir: 0, potion: 0 },
            seed: 12,
            events: [
                { atMs: 0, type: "floor_start", label: "Floor 2" },
                { atMs: 0, type: "spawn", sourceId: "mob-1", label: "Crawler" },
                { atMs: 700, type: "attack", sourceId: "1", targetId: "mob-1", amount: 22, label: "Hero" }
            ],
            cadenceSnapshot: [],
            truncatedEvents: 0,
            nonCriticalEventCount: 0,
            threatByHeroId: { "1": 0, "2": 0, "3": 0, "4": 0 },
            threatTieOrder: ["1", "2", "3", "4"]
        };

        const frameA = buildDungeonArenaLiveFrame(run, state.players, 820);
        const frameB = buildDungeonArenaLiveFrame(run, state.players, 820);
        expect(frameA.units).toEqual(frameB.units);

        const hero = frameA.units.find((unit) => unit.id === "1");
        expect(hero?.x).toBeGreaterThan(0.2);
        expect(hero?.targetId).toBe("mob-1");
        expect(hero?.movementState === "attack" || hero?.movementState === "recover").toBe(true);
        expect(hero?.facingX).toBeGreaterThan(0);

        const heroes = frameA.units.filter((unit) => !unit.isEnemy);
        let minDistance = Number.POSITIVE_INFINITY;
        for (let i = 0; i < heroes.length; i += 1) {
            for (let j = i + 1; j < heroes.length; j += 1) {
                minDistance = Math.min(minDistance, Math.hypot(heroes[i].x - heroes[j].x, heroes[i].y - heroes[j].y));
            }
        }
        expect(minDistance).toBeGreaterThan(0.015);
    });

    it("does not snap a hero back to the spawn anchor right after an attack when target disappears", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        const run: DungeonRunState = {
            id: "run-live-cache",
            dungeonId: "dungeon_ruines_humides",
            status: "running",
            endReason: null,
            startedAt: 1_000,
            elapsedMs: 1_200,
            stepCarryMs: 0,
            encounterStep: 5,
            floor: 2,
            floorCount: 10,
            party: [
                { playerId: "1", hp: 180, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
                { playerId: "2", hp: 190, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
                { playerId: "3", hp: 170, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
                { playerId: "4", hp: 200, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 }
            ],
            enemies: [
                {
                    id: "mob-cache-1",
                    name: "Crawler",
                    hp: 30,
                    hpMax: 40,
                    damage: 10,
                    isBoss: false,
                    mechanic: null,
                    spawnIndex: 0
                }
            ],
            targetEnemyId: "mob-cache-1",
            targetHeroId: null,
            autoRestart: false,
            restartAt: null,
            runIndex: 1,
            startInventory: { food: 10, tonic: 0, elixir: 0, potion: 0 },
            seed: 12,
            events: [
                { atMs: 0, type: "floor_start", label: "Floor 2" },
                { atMs: 0, type: "spawn", sourceId: "mob-cache-1", label: "Crawler" },
                { atMs: 700, type: "attack", sourceId: "1", targetId: "mob-cache-1", amount: 10, label: "Hero" },
                { atMs: 700, type: "damage", sourceId: "1", targetId: "mob-cache-1", amount: 10, label: "Crawler -10 (HP 30/40)" },
                { atMs: 720, type: "damage", sourceId: "1", targetId: "mob-cache-1", amount: 30, label: "Crawler -30 (HP 0/40)" },
                { atMs: 721, type: "death", sourceId: "mob-cache-1", label: "Crawler" }
            ],
            cadenceSnapshot: [],
            truncatedEvents: 0,
            nonCriticalEventCount: 0,
            threatByHeroId: { "1": 0, "2": 0, "3": 0, "4": 0 },
            threatTieOrder: ["1", "2", "3", "4"]
        };

        const duringAttackFrame = buildDungeonArenaLiveFrame(run, state.players, 705);
        const afterKillFrame = buildDungeonArenaLiveFrame(run, state.players, 740);
        const heroDuring = duringAttackFrame.units.find((unit) => unit.id === "1");
        const heroAfter = afterKillFrame.units.find((unit) => unit.id === "1");

        expect(heroDuring?.x).toBeGreaterThan(0.2);
        expect(heroAfter?.x).toBeGreaterThan(0.2);
    });

    it("limits displacement when a hero switches target to avoid visible teleports", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        const run: DungeonRunState = {
            id: "run-target-switch",
            dungeonId: "dungeon_ruines_humides",
            status: "running",
            endReason: null,
            startedAt: 1_000,
            elapsedMs: 1_200,
            stepCarryMs: 0,
            encounterStep: 6,
            floor: 3,
            floorCount: 10,
            party: [
                { playerId: "1", hp: 180, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
                { playerId: "2", hp: 190, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
                { playerId: "3", hp: 170, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
                { playerId: "4", hp: 200, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 }
            ],
            enemies: [
                { id: "mob-a", name: "Crawler A", hp: 120, hpMax: 120, damage: 10, isBoss: false, mechanic: null, spawnIndex: 0 },
                { id: "mob-b", name: "Crawler B", hp: 120, hpMax: 120, damage: 10, isBoss: false, mechanic: null, spawnIndex: 1 },
                { id: "mob-c", name: "Crawler C", hp: 120, hpMax: 120, damage: 10, isBoss: false, mechanic: null, spawnIndex: 2 },
                { id: "mob-d", name: "Crawler D", hp: 120, hpMax: 120, damage: 10, isBoss: false, mechanic: null, spawnIndex: 3 }
            ],
            targetEnemyId: "mob-a",
            targetHeroId: null,
            autoRestart: false,
            restartAt: null,
            runIndex: 1,
            startInventory: { food: 10, tonic: 0, elixir: 0, potion: 0 },
            seed: 32,
            events: [
                { atMs: 0, type: "floor_start", label: "Floor 3" },
                { atMs: 0, type: "spawn", sourceId: "mob-a", label: "Crawler A" },
                { atMs: 0, type: "spawn", sourceId: "mob-b", label: "Crawler B" },
                { atMs: 0, type: "spawn", sourceId: "mob-c", label: "Crawler C" },
                { atMs: 0, type: "spawn", sourceId: "mob-d", label: "Crawler D" },
                { atMs: 700, type: "attack", sourceId: "1", targetId: "mob-a", amount: 10, label: "Hero" },
                { atMs: 740, type: "attack", sourceId: "1", targetId: "mob-d", amount: 10, label: "Hero" }
            ],
            cadenceSnapshot: [],
            truncatedEvents: 0,
            nonCriticalEventCount: 0,
            threatByHeroId: { "1": 0, "2": 0, "3": 0, "4": 0 },
            threatTieOrder: ["1", "2", "3", "4"]
        };

        const beforeSwitch = buildDungeonArenaLiveFrame(run, state.players, 730);
        const afterSwitch = buildDungeonArenaLiveFrame(run, state.players, 780);
        const heroBefore = beforeSwitch.units.find((unit) => unit.id === "1");
        const heroAfter = afterSwitch.units.find((unit) => unit.id === "1");

        const displacement = Math.hypot(
            (heroAfter?.x ?? 0) - (heroBefore?.x ?? 0),
            (heroAfter?.y ?? 0) - (heroBefore?.y ?? 0)
        );
        expect(displacement).toBeLessThan(0.065);
    });

    it("keeps a dead unit at its last position instead of snapping back to its anchor", () => {
        const state = createInitialGameState("0.9.0");
        state.players["2"] = createPlayerState("2", "Mara");
        state.players["3"] = createPlayerState("3", "Iris");
        state.players["4"] = createPlayerState("4", "Kai");
        const run: DungeonRunState = {
            id: "run-dead-position",
            dungeonId: "dungeon_ruines_humides",
            status: "running",
            endReason: null,
            startedAt: 1_000,
            elapsedMs: 1_300,
            stepCarryMs: 0,
            encounterStep: 6,
            floor: 3,
            floorCount: 10,
            party: [
                { playerId: "1", hp: 180, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
                { playerId: "2", hp: 190, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
                { playerId: "3", hp: 170, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 },
                { playerId: "4", hp: 200, hpMax: 200, potionCooldownMs: 0, attackCooldownMs: 500, magicHealCooldownMs: 0 }
            ],
            enemies: [
                { id: "mob-z", name: "Crawler", hp: 200, hpMax: 200, damage: 10, isBoss: false, mechanic: null, spawnIndex: 0 }
            ],
            targetEnemyId: "mob-z",
            targetHeroId: null,
            autoRestart: false,
            restartAt: null,
            runIndex: 1,
            startInventory: { food: 10, tonic: 0, elixir: 0, potion: 0 },
            seed: 51,
            events: [
                { atMs: 0, type: "floor_start", label: "Floor 3" },
                { atMs: 0, type: "spawn", sourceId: "mob-z", label: "Crawler" },
                { atMs: 700, type: "attack", sourceId: "1", targetId: "mob-z", amount: 10, label: "Hero" },
                { atMs: 730, type: "death", sourceId: "1", label: "A" }
            ],
            cadenceSnapshot: [],
            truncatedEvents: 0,
            nonCriticalEventCount: 0,
            threatByHeroId: { "1": 0, "2": 0, "3": 0, "4": 0 },
            threatTieOrder: ["1", "2", "3", "4"]
        };

        const beforeDeath = buildDungeonArenaLiveFrame(run, state.players, 720);
        const atDeath = buildDungeonArenaLiveFrame(run, state.players, 730);
        const afterDeath = buildDungeonArenaLiveFrame(run, state.players, 980);
        const heroBefore = beforeDeath.units.find((unit) => unit.id === "1");
        const heroAtDeath = atDeath.units.find((unit) => unit.id === "1");
        const heroAfterDeath = afterDeath.units.find((unit) => unit.id === "1");

        expect(heroBefore?.x).toBeGreaterThan(0.2);
        expect(heroAtDeath?.alive).toBe(false);
        expect(heroAfterDeath?.alive).toBe(false);
        expect(heroAtDeath?.x).toBeGreaterThan(0.2);
        expect(Math.hypot(
            (heroAfterDeath?.x ?? 0) - (heroAtDeath?.x ?? 0),
            (heroAfterDeath?.y ?? 0) - (heroAtDeath?.y ?? 0)
        )).toBeLessThan(0.0001);
    });
});
