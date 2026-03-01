import { getEquippedWeaponType } from "../../../../data/equipment";
import { getHairColor, getSkinColor } from "../../../ui/heroHair";
import {
    DUNGEON_FLOAT_WINDOW_MS,
    FLOAT_MAX_COUNT,
    MOVEMENT_BASE_ORBIT_PERIOD_MS,
    MOVEMENT_BOUNDS,
    MOVEMENT_MAX_TARGET_SWITCH_SPEED_PER_SECOND,
    MOVEMENT_MAX_RANGE_OFFSET,
    MOVEMENT_MAX_REACTION_DELAY_MS,
    MOVEMENT_MAX_SEPARATION_OFFSET,
    MOVEMENT_SEPARATION_RADIUS,
    MOVEMENT_SEPARATION_STRENGTH,
    PARTY_LAYOUT
} from "./constants";
import type {
    ArenaEntityState,
    DungeonArenaAttackCue,
    DungeonArenaFloatingText,
    DungeonArenaMovementState,
    DungeonArenaUnit,
    DungeonReplayEvent,
    DungeonReplayJumpMarks,
    HeroSeed,
    PlayerEquipmentState,
    PlayerState
} from "./types";

const HP_LABEL_PATTERN = /\(HP\s+(\d+)\s*\/\s*(\d+)\)/i;

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const normalizeHpMax = (value: number | undefined) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return 100;
    }
    return Math.max(1, Math.round(parsed));
};

const hasHelmetEquipped = (equipment?: PlayerEquipmentState | null) => {
    return Boolean(equipment?.slots?.Head);
};

export const createHeroSeed = (
    playerId: string,
    player: PlayerState | undefined,
    fallbackName?: string,
    fallbackHpMax?: number,
    fallbackEquipment?: PlayerEquipmentState
): HeroSeed => {
    const appearance = player?.appearance;
    const showHelmet = appearance?.showHelmet ?? true;
    const helmetVisible = showHelmet && hasHelmetEquipped(fallbackEquipment ?? player?.equipment);
    const weaponType = getEquippedWeaponType(fallbackEquipment ?? player?.equipment);
    return {
        id: playerId,
        name: fallbackName ?? player?.name ?? `Hero ${playerId}`,
        hpMax: normalizeHpMax(fallbackHpMax ?? player?.hpMax),
        skinColor: appearance?.skinColor ?? getSkinColor(playerId),
        hairColor: appearance?.hairColor ?? getHairColor(playerId),
        helmetVisible,
        weaponType
    };
};

export const isPartyEntity = (partyIds: Set<string>, id?: string) => Boolean(id && partyIds.has(id));

export const toSortedEntities = (states: Record<string, ArenaEntityState>): ArenaEntityState[] => {
    return Object.values(states)
        .sort((a, b) => (a.spawnOrder - b.spawnOrder) || a.id.localeCompare(b.id));
};

export const toUnitPositionMap = (entities: ArenaEntityState[]) => {
    const units: DungeonArenaUnit[] = [];
    const partyUnits = entities.filter((entity) => !entity.isEnemy);
    const enemyUnits = entities.filter((entity) => entity.isEnemy);
    const boss = enemyUnits.find((entity) => entity.isBoss);
    const adds = enemyUnits.filter((entity) => !entity.isBoss);

    partyUnits.forEach((entity, index) => {
        const slot = PARTY_LAYOUT[index] ?? PARTY_LAYOUT[PARTY_LAYOUT.length - 1];
        units.push({
            id: entity.id,
            name: entity.name,
            hp: entity.hp,
            hpMax: entity.hpMax,
            alive: entity.alive,
            isEnemy: false,
            isBoss: false,
            x: slot.x,
            y: slot.y,
            skinColor: entity.skinColor,
            hairColor: entity.hairColor,
            helmetVisible: entity.helmetVisible,
            weaponType: entity.weaponType
        });
    });

    if (boss) {
        units.push({
            id: boss.id,
            name: boss.name,
            hp: boss.hp,
            hpMax: boss.hpMax,
            alive: boss.alive,
            isEnemy: true,
            isBoss: true,
            x: 0.82,
            y: 0.5
        });
    }

    adds.forEach((entity, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        units.push({
            id: entity.id,
            name: entity.name,
            hp: entity.hp,
            hpMax: entity.hpMax,
            alive: entity.alive,
            isEnemy: true,
            isBoss: false,
            x: 0.66 + col * 0.12,
            y: 0.3 + row * 0.18
        });
    });

    return units;
};

type MovementProfile = {
    preferredRangeMin: number;
    preferredRangeMax: number;
    approachGain: number;
    maxApproach: number;
    maxBackstep: number;
    orbitSpeed: number;
    maxOffset: number;
    recoverBackstep: number;
    recoverDrift: number;
};

type ProvisionalMovementState = {
    x: number;
    y: number;
    targetId: string | null;
    preferredRangeMin?: number;
    preferredRangeMax?: number;
    movementState: DungeonArenaMovementState;
};

type ApplyCombatMovementInput = {
    units: DungeonArenaUnit[];
    atMs: number;
    floorStartAtMs: number;
    previousAtMs?: number;
    targetEnemyId: string | null;
    latestAttacks: Map<string, DungeonArenaAttackCue>;
    attackWindowMs: number;
    previousUnitsById?: Map<string, DungeonArenaUnit>;
};

const hashString = (value: string) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash * 31 + value.charCodeAt(i)) % 1_000_000;
    }
    return hash;
};

const clampMagnitude = (x: number, y: number, max: number) => {
    const length = Math.hypot(x, y);
    if (!Number.isFinite(length) || length <= max || length <= 1e-6) {
        return { x, y };
    }
    const scale = max / length;
    return {
        x: x * scale,
        y: y * scale
    };
};

const getMovementProfile = (unit: DungeonArenaUnit): MovementProfile => {
    if (unit.isEnemy) {
        if (unit.isBoss) {
            return {
                preferredRangeMin: 0.115,
                preferredRangeMax: 0.185,
                approachGain: 0.56,
                maxApproach: 0.19,
                maxBackstep: 0.07,
                orbitSpeed: 0.009,
                maxOffset: 0.21,
                recoverBackstep: 0.022,
                recoverDrift: 0.006
            };
        }
        return {
            preferredRangeMin: 0.095,
            preferredRangeMax: 0.16,
            approachGain: 0.62,
            maxApproach: 0.205,
            maxBackstep: 0.075,
            orbitSpeed: 0.0105,
            maxOffset: 0.22,
            recoverBackstep: 0.024,
            recoverDrift: 0.007
        };
    }

    if (unit.weaponType === "Ranged") {
        return {
            preferredRangeMin: 0.165,
            preferredRangeMax: 0.245,
            approachGain: 0.52,
            maxApproach: 0.18,
            maxBackstep: 0.082,
            orbitSpeed: 0.014,
            maxOffset: 0.21,
            recoverBackstep: 0.018,
            recoverDrift: 0.009
        };
    }

    if (unit.weaponType === "Magic") {
        return {
            preferredRangeMin: 0.145,
            preferredRangeMax: 0.22,
            approachGain: 0.5,
            maxApproach: 0.172,
            maxBackstep: 0.085,
            orbitSpeed: 0.015,
            maxOffset: 0.2,
            recoverBackstep: 0.02,
            recoverDrift: 0.01
        };
    }

    return {
        preferredRangeMin: 0.086,
        preferredRangeMax: 0.14,
        approachGain: 0.67,
        maxApproach: 0.225,
        maxBackstep: 0.07,
        orbitSpeed: 0.011,
        maxOffset: 0.23,
        recoverBackstep: 0.026,
        recoverDrift: 0.007
    };
};

const findNearestAlive = (unit: DungeonArenaUnit, candidates: DungeonArenaUnit[]) => {
    let best: DungeonArenaUnit | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    candidates.forEach((candidate) => {
        if (!candidate.alive || candidate.id === unit.id) {
            return;
        }
        const distance = Math.hypot(candidate.x - unit.x, candidate.y - unit.y);
        if (distance < bestDistance) {
            bestDistance = distance;
            best = candidate;
        }
    });
    return best;
};

const resolveUnitTargets = (
    units: DungeonArenaUnit[],
    targetEnemyId: string | null,
    latestAttacks: Map<string, DungeonArenaAttackCue>
) => {
    const aliveHeroes = units.filter((unit) => !unit.isEnemy && unit.alive);
    const aliveEnemies = units.filter((unit) => unit.isEnemy && unit.alive);
    const aliveEnemyById = new Map(aliveEnemies.map((unit) => [unit.id, unit]));
    const aliveHeroById = new Map(aliveHeroes.map((unit) => [unit.id, unit]));
    const targets = new Map<string, string | null>();

    units.forEach((unit) => {
        if (!unit.alive) {
            targets.set(unit.id, null);
            return;
        }
        if (!unit.isEnemy) {
            const focusedEnemy = targetEnemyId ? aliveEnemyById.get(targetEnemyId) : null;
            const target = focusedEnemy ?? findNearestAlive(unit, aliveEnemies);
            targets.set(unit.id, target?.id ?? null);
            return;
        }

        const latestAttackTargetId = latestAttacks.get(unit.id)?.targetId;
        const targetFromAttack = latestAttackTargetId ? aliveHeroById.get(latestAttackTargetId) : null;
        const target = targetFromAttack ?? findNearestAlive(unit, aliveHeroes);
        targets.set(unit.id, target?.id ?? null);
    });

    return targets;
};

export const applyCombatMovementChoreography = ({
    units,
    atMs,
    floorStartAtMs,
    previousAtMs,
    targetEnemyId,
    latestAttacks,
    attackWindowMs,
    previousUnitsById
}: ApplyCombatMovementInput): DungeonArenaUnit[] => {
    if (units.length === 0) {
        return units;
    }
    const unitById = new Map(units.map((unit) => [unit.id, unit]));
    const targetById = resolveUnitTargets(units, targetEnemyId, latestAttacks);
    const basePositionById = new Map<string, { x: number; y: number }>();
    units.forEach((unit) => {
        const previousUnit = previousUnitsById?.get(unit.id);
        const previousX = Number(previousUnit?.x);
        const previousY = Number(previousUnit?.y);
        const x = Number.isFinite(previousX)
            ? clamp(previousX, MOVEMENT_BOUNDS.minX, MOVEMENT_BOUNDS.maxX)
            : unit.x;
        const y = Number.isFinite(previousY)
            ? clamp(previousY, MOVEMENT_BOUNDS.minY, MOVEMENT_BOUNDS.maxY)
            : unit.y;
        basePositionById.set(unit.id, { x, y });
    });
    const provisional = new Map<string, ProvisionalMovementState>();
    const separation = new Map<string, { x: number; y: number }>();

    units.forEach((unit) => {
        separation.set(unit.id, { x: 0, y: 0 });
        const basePosition = basePositionById.get(unit.id) ?? { x: unit.x, y: unit.y };
        if (!unit.alive) {
            provisional.set(unit.id, {
                x: basePosition.x,
                y: basePosition.y,
                targetId: null,
                movementState: "idle"
            });
            return;
        }

        const targetId = targetById.get(unit.id) ?? null;
        const target = targetId ? unitById.get(targetId) : null;
        if (!target || !target.alive) {
            provisional.set(unit.id, {
                x: basePosition.x,
                y: basePosition.y,
                targetId: null,
                movementState: "idle"
            });
            return;
        }

        const profile = getMovementProfile(unit);
        const seed = hashString(`${unit.id}:${floorStartAtMs}`);
        const reactionDelayMs = Math.floor((seed % 10_000) / 10_000 * MOVEMENT_MAX_REACTION_DELAY_MS);
        const delayedAtMs = Math.max(floorStartAtMs, atMs - reactionDelayMs);
        const rangeBias = (((Math.floor(seed / 11) % 10_000) / 10_000) - 0.5) * MOVEMENT_MAX_RANGE_OFFSET;
        const preferredRangeMin = Math.max(0.05, profile.preferredRangeMin + rangeBias);
        const preferredRangeMax = Math.max(preferredRangeMin + 0.01, profile.preferredRangeMax + rangeBias);
        const preferredRangeMid = (preferredRangeMin + preferredRangeMax) / 2;
        const targetBasePosition = basePositionById.get(target.id) ?? { x: target.x, y: target.y };
        const dx = targetBasePosition.x - basePosition.x;
        const dy = targetBasePosition.y - basePosition.y;
        const distance = Math.hypot(dx, dy);
        const nx = distance > 1e-5 ? (dx / distance) : (unit.isEnemy ? -1 : 1);
        const ny = distance > 1e-5 ? (dy / distance) : 0;
        const tx = -ny;
        const ty = nx;
        const latestAttack = latestAttacks.get(unit.id);
        const attackAge = latestAttack ? delayedAtMs - latestAttack.atMs : Number.POSITIVE_INFINITY;

        let movementState: DungeonArenaMovementState = "orbit";
        if (Number.isFinite(attackAge) && attackAge >= 0 && attackAge <= attackWindowMs) {
            movementState = attackAge <= attackWindowMs * 0.46 ? "attack" : "recover";
        } else if (distance > preferredRangeMax * 1.22) {
            movementState = "approach";
        } else if (distance < preferredRangeMin * 0.78) {
            movementState = "reposition";
        }

        let radialMultiplier = 0.58;
        let tangentMultiplier = 0.72;
        if (movementState === "approach") {
            radialMultiplier = 1;
            tangentMultiplier = 0.52;
        } else if (movementState === "attack") {
            radialMultiplier = 0.35;
            tangentMultiplier = 0.18;
        } else if (movementState === "recover") {
            radialMultiplier = 0.52;
            tangentMultiplier = 0.78;
        } else if (movementState === "reposition") {
            radialMultiplier = 1.04;
            tangentMultiplier = 0.26;
        }

        let radial = clamp(
            (distance - preferredRangeMid) * profile.approachGain,
            -profile.maxBackstep,
            profile.maxApproach
        ) * radialMultiplier;
        if (movementState === "reposition" && distance < preferredRangeMin) {
            radial -= (preferredRangeMin - distance) * 0.9;
        }
        if (movementState === "attack" && Number.isFinite(attackAge)) {
            const windupPhase = clamp(attackAge / Math.max(1, attackWindowMs * 0.46), 0, 1);
            radial *= (0.42 + 0.24 * Math.cos(Math.PI * windupPhase));
        }

        const orbitSide = ((Math.floor(seed / 7) % 2) * 2) - 1;
        const orbitPeriod = Math.max(1_200, MOVEMENT_BASE_ORBIT_PERIOD_MS + ((seed % 460) - 230));
        const orbitPhase = ((delayedAtMs + (seed % 1_000)) / orbitPeriod) * Math.PI * 2;
        const orbitPulse = 0.58 + 0.42 * Math.sin(orbitPhase);
        let tangent = orbitSide * profile.orbitSpeed * orbitPulse * tangentMultiplier;

        let recoverBackstep = 0;
        if (movementState === "recover" && Number.isFinite(attackAge)) {
            const recoverStart = attackWindowMs * 0.46;
            const recoverWindow = Math.max(1, attackWindowMs - recoverStart);
            const recoverPhase = clamp((attackAge - recoverStart) / recoverWindow, 0, 1);
            const recoverPulse = Math.sin(Math.PI * recoverPhase);
            recoverBackstep = -profile.recoverBackstep * recoverPulse;
            tangent += orbitSide * profile.recoverDrift * recoverPulse;
        }

        const offset = clampMagnitude(
            (nx * (radial + recoverBackstep)) + (tx * tangent),
            (ny * (radial + recoverBackstep)) + (ty * tangent),
            profile.maxOffset
        );
        provisional.set(unit.id, {
            x: clamp(basePosition.x + offset.x, MOVEMENT_BOUNDS.minX, MOVEMENT_BOUNDS.maxX),
            y: clamp(basePosition.y + offset.y, MOVEMENT_BOUNDS.minY, MOVEMENT_BOUNDS.maxY),
            targetId,
            preferredRangeMin,
            preferredRangeMax,
            movementState
        });
    });

    const applySeparation = (group: DungeonArenaUnit[]) => {
        for (let i = 0; i < group.length; i += 1) {
            for (let j = i + 1; j < group.length; j += 1) {
                const a = group[i];
                const b = group[j];
                if (!a.alive || !b.alive) {
                    continue;
                }
                const aState = provisional.get(a.id);
                const bState = provisional.get(b.id);
                if (!aState || !bState) {
                    continue;
                }
                let dx = aState.x - bState.x;
                let dy = aState.y - bState.y;
                let distance = Math.hypot(dx, dy);
                if (distance >= MOVEMENT_SEPARATION_RADIUS) {
                    continue;
                }
                if (distance <= 1e-5) {
                    const pairSeed = hashString(`${a.id}:${b.id}`);
                    dx = ((pairSeed % 2_000) / 1_000) - 1;
                    dy = (((Math.floor(pairSeed / 3) % 2_000) / 1_000) - 1);
                    distance = Math.hypot(dx, dy) || 1;
                }
                const nx = dx / distance;
                const ny = dy / distance;
                const push = ((MOVEMENT_SEPARATION_RADIUS - distance) / MOVEMENT_SEPARATION_RADIUS) * MOVEMENT_SEPARATION_STRENGTH;
                const aSeparation = separation.get(a.id);
                const bSeparation = separation.get(b.id);
                if (aSeparation) {
                    aSeparation.x += nx * push;
                    aSeparation.y += ny * push;
                }
                if (bSeparation) {
                    bSeparation.x -= nx * push;
                    bSeparation.y -= ny * push;
                }
            }
        }
    };

    applySeparation(units.filter((unit) => !unit.isEnemy));
    applySeparation(units.filter((unit) => unit.isEnemy));

    const finalById = new Map<string, ProvisionalMovementState>();
    units.forEach((unit) => {
        const next = provisional.get(unit.id) ?? {
            x: unit.x,
            y: unit.y,
            targetId: null,
            movementState: "idle" as const
        };
        const sep = separation.get(unit.id) ?? { x: 0, y: 0 };
        const clampedSep = clampMagnitude(sep.x, sep.y, MOVEMENT_MAX_SEPARATION_OFFSET);
        finalById.set(unit.id, {
            ...next,
            x: clamp(next.x + clampedSep.x, MOVEMENT_BOUNDS.minX, MOVEMENT_BOUNDS.maxX),
            y: clamp(next.y + clampedSep.y, MOVEMENT_BOUNDS.minY, MOVEMENT_BOUNDS.maxY)
        });
    });

    const deltaMs = Number.isFinite(previousAtMs) && atMs > Number(previousAtMs)
        ? clamp(atMs - Number(previousAtMs), 16, 360)
        : null;

    return units.map((unit) => {
        const basePosition = basePositionById.get(unit.id) ?? { x: unit.x, y: unit.y };
        const finalState = finalById.get(unit.id) ?? {
            x: basePosition.x,
            y: basePosition.y,
            targetId: null,
            movementState: "idle" as const
        };
        let nextX = finalState.x;
        let nextY = finalState.y;
        if (!unit.alive) {
            nextX = basePosition.x;
            nextY = basePosition.y;
        } else {
            nextX = finalState.x;
            nextY = finalState.y;
            const previousUnit = previousUnitsById?.get(unit.id);
            const previousTargetId = previousUnit?.targetId ?? null;
            const targetId = finalState.targetId ?? null;
            const didSwitchTarget = Boolean(
                previousUnit
                && previousTargetId
                && targetId
                && previousTargetId !== targetId
            );
            if (didSwitchTarget && deltaMs !== null) {
                const maxSwitchStep = (MOVEMENT_MAX_TARGET_SWITCH_SPEED_PER_SECOND * deltaMs) / 1_000;
                const step = clampMagnitude(finalState.x - basePosition.x, finalState.y - basePosition.y, maxSwitchStep);
                nextX = clamp(basePosition.x + step.x, MOVEMENT_BOUNDS.minX, MOVEMENT_BOUNDS.maxX);
                nextY = clamp(basePosition.y + step.y, MOVEMENT_BOUNDS.minY, MOVEMENT_BOUNDS.maxY);
            }
        }

        const velocityX = (nextX - basePosition.x) * 6;
        const velocityY = (nextY - basePosition.y) * 6;
        let facingX = unit.isEnemy ? -1 : 1;
        let facingY = 0;
        const targetId = finalState.targetId ?? null;
        const targetState = targetId ? finalById.get(targetId) : null;
        if (targetState) {
            const dx = targetState.x - nextX;
            const dy = targetState.y - nextY;
            const length = Math.hypot(dx, dy);
            if (length > 1e-5) {
                facingX = dx / length;
                facingY = dy / length;
            }
        } else {
            const length = Math.hypot(velocityX, velocityY);
            if (length > 1e-5) {
                facingX = velocityX / length;
                facingY = velocityY / length;
            }
        }
        return {
            ...unit,
            x: nextX,
            y: nextY,
            velocityX,
            velocityY,
            facingX,
            facingY,
            targetId,
            movementState: finalState.movementState,
            preferredRangeMin: finalState.preferredRangeMin,
            preferredRangeMax: finalState.preferredRangeMax
        };
    });
};

export const getBossPhaseLabel = (boss: DungeonArenaUnit | undefined): string | null => {
    if (!boss || boss.hpMax <= 0 || boss.hp <= 0) {
        return null;
    }
    const ratio = boss.hp / boss.hpMax;
    if (ratio > 0.66) {
        return "Boss phase 1";
    }
    if (ratio > 0.33) {
        return "Boss phase 2";
    }
    return "Boss final phase";
};

export const getReplayEventsUntil = (events: DungeonReplayEvent[], atMs: number): DungeonReplayEvent[] => {
    return events.filter((event) => event.atMs <= atMs);
};

export const inferEnemyHpCap = (
    events: DungeonReplayEvent[],
    partyIds: Set<string>
): Record<string, number> => {
    const damageTotals: Record<string, number> = {};
    const died: Record<string, boolean> = {};

    events.forEach((event) => {
        if (event.type === "damage" && event.targetId && !isPartyEntity(partyIds, event.targetId)) {
            damageTotals[event.targetId] = (damageTotals[event.targetId] ?? 0) + Math.max(0, event.amount ?? 0);
        }
        if (event.type === "death" && event.sourceId && !isPartyEntity(partyIds, event.sourceId)) {
            died[event.sourceId] = true;
        }
    });

    const caps: Record<string, number> = {};
    Object.entries(damageTotals).forEach(([id, totalDamage]) => {
        const scaled = died[id] ? totalDamage : Math.ceil(totalDamage * 1.25);
        caps[id] = normalizeHpMax(Math.max(60, scaled));
    });
    return caps;
};

export const parseHpSnapshotFromLabel = (label?: string): { hp: number; hpMax: number } | null => {
    if (typeof label !== "string" || label.length === 0) {
        return null;
    }
    const match = label.match(HP_LABEL_PATTERN);
    if (!match) {
        return null;
    }
    const hp = Number(match[1]);
    const hpMax = Number(match[2]);
    if (!Number.isFinite(hp) || !Number.isFinite(hpMax) || hpMax <= 0) {
        return null;
    }
    return {
        hp: clamp(Math.round(hp), 0, Math.round(hpMax)),
        hpMax: normalizeHpMax(hpMax)
    };
};

export const buildFloatingTexts = (
    events: DungeonReplayEvent[],
    atMs: number
): DungeonArenaFloatingText[] => {
    const lastFloorStart = [...events]
        .reverse()
        .find((event) => event.type === "floor_start" && event.atMs <= atMs)?.atMs ?? -Infinity;
    const windowStart = Math.max(atMs - DUNGEON_FLOAT_WINDOW_MS, lastFloorStart);

    return events
        .map((event, eventIndex) => ({ event, eventIndex }))
        .filter(({ event }) => (
            (event.type === "damage" || event.type === "heal")
            && event.atMs <= atMs
            && event.atMs >= windowStart
            && typeof event.amount === "number"
            && Number.isFinite(event.amount)
            && event.amount > 0
        ))
        .slice(-FLOAT_MAX_COUNT)
        .map(({ event, eventIndex }) => {
            const age = Math.max(0, atMs - event.atMs);
            const kind: DungeonArenaFloatingText["kind"] = event.type === "heal" ? "heal" : "damage";
            return {
                id: `${event.type}-${event.atMs}-${eventIndex}`,
                targetId: event.targetId ?? event.sourceId ?? "",
                amount: Math.max(1, Math.round(event.amount ?? 0)),
                kind,
                progress: clamp(age / DUNGEON_FLOAT_WINDOW_MS, 0, 1)
            };
        })
        .filter((entry) => Boolean(entry.targetId));
};

export const getReplayJumpMarksFromEvents = (events: DungeonReplayEvent[]): DungeonReplayJumpMarks => {
    const firstDeathEvent = events.find((event) => event.type === "death");
    const endEvent = [...events].reverse().find((event) => event.type === "run_end");
    return {
        firstDeathAtMs: firstDeathEvent?.atMs ?? null,
        runEndAtMs: endEvent?.atMs ?? null
    };
};
