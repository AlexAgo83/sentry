import type { DungeonArenaFrame } from "../arenaPlayback";
import {
    ATTACK_LUNGE_DISTANCE,
    ATTACK_LUNGE_MS,
    DAMAGE_SHAKE_MS,
    DAMAGE_TINT_COLOR,
    DAMAGE_TINT_MS,
    ENEMY_SPAWN_FADE_MS,
    ENTITY_OUTLINE_ALPHA,
    ENTITY_OUTLINE_COLOR,
    ENTITY_OUTLINE_OFFSET,
    MAGIC_SPIRAL_MS,
    MAGIC_SPIRAL_RADIUS,
    MAGIC_SPIRAL_TURNS,
    MAGIC_PULSE_COLOR,
    MAGIC_PULSE_MS,
    MAGIC_PULSE_OFFSET_Y,
    RANGED_RECOIL_DISTANCE,
    RANGED_RECOIL_MS,
    FLOOR_REPOSITION_BLEND_MS
} from "./constants";
import {
    createUnitNode,
    drawArena,
    drawAttackCharge,
    drawCombatTypeIcon,
    drawHeroBody,
    drawHp,
    drawTargetAndDeath,
} from "./drawing";
import { clamp, hashString, mixColors, parseHexColor, toWorldX, toWorldY } from "./math";
import type { PixiRuntime } from "./types";
import { getCombatSkillIdForWeaponType } from "../../../../data/equipment";
import { getSkillIconColor } from "../../../ui/skillColors";
import {
    type AttackVfxKind,
    getAttackVfxSpecs,
    resolveAttackVfxKind,
    shouldApplyLunge,
    ensureAttackVfxPool,
    syncAttackVfxSpecs,
    renderAttackVfx
} from "./updateFrame/attackVfx";
import { ensureFloatingTextPool, updateFloatingTexts } from "./updateFrame/floatingText";
import { updateFrameLayout } from "./updateFrame/layout";

export type { AttackVfxKind };
export { getAttackVfxSpecs, resolveAttackVfxKind, shouldApplyLunge };

export const updateFrame = (runtime: PixiRuntime, frame: DungeonArenaFrame) => {
    const viewportWidth = runtime.app.screen?.width ?? runtime.app.renderer.width;
    const viewportHeight = runtime.app.screen?.height ?? runtime.app.renderer.height;
    const statusLabel = frame.statusLabel ?? "running";
    // Replay frames carry the overall replay status (victory/failed) even while the
    // timeline cursor is mid-run. Use time to decide whether combat animations
    // (shake/lunge) should run, while still allowing an explicit "paused" state to freeze.
    const combatActive = statusLabel !== "paused" && (statusLabel === "running" || frame.atMs < frame.totalMs);
    const currentFloorLabel = frame.floorLabel ?? null;
    const previousFloorLabel = runtime.lastFloorLabel ?? null;
    if (currentFloorLabel !== previousFloorLabel) {
        runtime.floorTransitionUntilMs = frame.atMs + FLOOR_REPOSITION_BLEND_MS;
        runtime.lastFloorLabel = currentFloorLabel;
        runtime.unitNodes.forEach((node) => {
            node.attackMotionX = 0;
            node.attackMotionY = 0;
            node.attackMotionAtMs = frame.atMs;
        });
    }
    const floorTransitionUntilMs = Number(runtime.floorTransitionUntilMs);
    const floorTransitionActive = Number.isFinite(floorTransitionUntilMs) && frame.atMs < floorTransitionUntilMs;
    const floorTransitionProgress = floorTransitionActive
        ? clamp(1 - ((floorTransitionUntilMs - frame.atMs) / FLOOR_REPOSITION_BLEND_MS), 0, 1)
        : 1;
    if (runtime.phaseLabel.parent !== runtime.app.stage) {
        runtime.phaseLabel.parent?.removeChild(runtime.phaseLabel);
        runtime.app.stage.addChild(runtime.phaseLabel);
    }
    drawArena(runtime.arena);

    const unitById = new Map(frame.units.map((unit) => [unit.id, unit]));
    const attackBySource = new Map(frame.attackCues.map((cue) => [cue.sourceId, cue]));
    const magicBySource = new Map(frame.magicCues.map((cue) => [cue.sourceId, cue]));
    const seen = new Set<string>();
    const lastSeen = runtime.lastSeen;

    const meleeVfxColor = parseHexColor(getSkillIconColor(getCombatSkillIdForWeaponType("Melee" as any)), 0xf2c14e);
    const rangedVfxColor = parseHexColor(getSkillIconColor(getCombatSkillIdForWeaponType("Ranged" as any)), 0x8ac926);
    const magicVfxColor = parseHexColor(getSkillIconColor(getCombatSkillIdForWeaponType("Magic" as any)), 0x7cc6ff);

    ensureAttackVfxPool(runtime);
    syncAttackVfxSpecs(runtime, frame, unitById);

    frame.units.forEach((unit) => {
        const node = runtime.unitNodes.get(unit.id) ?? createUnitNode(runtime.PIXI, runtime.world);
        if (!runtime.unitNodes.has(unit.id)) {
            runtime.unitNodes.set(unit.id, node);
        }
        const wasVisible = lastSeen.has(unit.id);
        seen.add(unit.id);
        node.container.visible = true;
        const baseX = toWorldX(unit.x);
        const baseY = toWorldY(unit.y);
        node.label.text = unit.name;
        node.label.alpha = unit.alive ? 1 : 0.5;

        if (!wasVisible && unit.isEnemy) {
            node.spawnAtMs = frame.atMs;
        }

        const lastHp = Number(node.lastHp);
        if (Number.isFinite(lastHp) && unit.hp < lastHp) {
            node.damageAtMs = frame.atMs;
            node.damageRatio = clamp((lastHp - unit.hp) / Math.max(1, unit.hpMax), 0, 1);
        }
        node.lastHp = unit.hp;

        if (unit.isEnemy) {
            // Enemies are rendered from standalone SVG assets (mob/boss).
            node.body.clear();
            node.body.visible = false;
            node.silhouette.clear();
            node.silhouette.visible = false;
            if (node.enemySprite) {
                node.enemySprite.visible = true;
                node.enemySprite.texture = unit.isBoss ? runtime.entityTextures.enemyBoss : runtime.entityTextures.enemyMob;
                // Match the approximate footprint of the previous Graphics icons.
                const scale = unit.isBoss ? 0.5 : 0.425;
                const facingX = Number(unit.facingX);
                const facingSign = Number.isFinite(facingX) && Math.abs(facingX) > 0.03
                    ? (facingX < 0 ? -1 : 1)
                    : 1;
                node.enemySprite.scale.set(scale * facingSign, scale);
                node.enemySprite.alpha = unit.alive ? 1 : 0.5;
                node.enemySprite.tint = 0xffffff;
            }
            const outlines = node.enemyOutlineSprites ?? [];
            const outlineAlpha = Math.max(0, Math.min(1, ENTITY_OUTLINE_ALPHA * (unit.alive ? 1 : 0.5)));
            const outlineOffset = ENTITY_OUTLINE_OFFSET;
            const outlineDirections: Array<[number, number]> = [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
                [1, 1],
                [-1, 1],
                [1, -1],
                [-1, -1]
            ];
            for (let i = 0; i < outlines.length; i += 1) {
                const sprite = outlines[i];
                const dir = outlineDirections[i] ?? outlineDirections[0];
                sprite.visible = Boolean(node.enemySprite?.visible);
                sprite.texture = node.enemySprite?.texture;
                sprite.scale?.set?.(node.enemySprite?.scale?.x ?? 1, Math.abs(node.enemySprite?.scale?.y ?? 1));
                sprite.alpha = outlineAlpha;
                sprite.tint = ENTITY_OUTLINE_COLOR;
                sprite.position.set(dir[0] * outlineOffset, dir[1] * outlineOffset);
            }
        } else {
            if (node.enemySprite) {
                node.enemySprite.visible = false;
            }
            if (node.enemyOutlineSprites) {
                node.enemyOutlineSprites.forEach((sprite) => { sprite.visible = false; });
            }
            node.body.visible = true;
            node.silhouette.visible = true;
            drawHeroBody(node, unit);
        }
        if (!unit.isEnemy) {
            drawCombatTypeIcon(
                node,
                unit.weaponType ?? "Melee",
                unit.alive,
                node.label.x,
                node.label.y,
                node.label.width ?? 0
            );
        } else {
            node.combatIcon.visible = false;
        }
        node.magicPulse.clear();
        node.magicPulse.visible = false;
        const magicCue = !unit.isEnemy ? magicBySource.get(unit.id) : null;
        if (magicCue) {
            const age = frame.atMs - magicCue.atMs;
            if (age >= 0 && age <= MAGIC_PULSE_MS) {
                const progress = clamp(age / MAGIC_PULSE_MS, 0, 1);
                const alpha = (1 - progress) * 0.75;
                const radius = 18 + progress * 14;
                node.magicPulse.visible = true;
                node.magicPulse.lineStyle(2, MAGIC_PULSE_COLOR, 0.7 * alpha);
                node.magicPulse.beginFill(MAGIC_PULSE_COLOR, 0.18 * alpha);
                node.magicPulse.drawCircle(0, MAGIC_PULSE_OFFSET_Y, radius);
                node.magicPulse.endFill();
            }
        }
        drawAttackCharge(
            node,
            unit.attackCharge ?? 0,
            unit.weaponType ?? "Melee",
            unit.isEnemy,
            unit.alive,
            unit.movementState
        );
        drawHp(node, unit.hp, unit.hpMax);
        drawTargetAndDeath(node, frame.targetEnemyId === unit.id, unit.alive);
        const baseAlpha = unit.alive ? 1 : 0.6;
        let spawnAlpha = 1;
        if (unit.isEnemy && Number.isFinite(node.spawnAtMs)) {
            const spawnAge = frame.atMs - Number(node.spawnAtMs);
            if (spawnAge >= ENEMY_SPAWN_FADE_MS) {
                node.spawnAtMs = undefined;
            } else {
                spawnAlpha = clamp(spawnAge / ENEMY_SPAWN_FADE_MS, 0, 1);
            }
        }
        node.container.alpha = baseAlpha * spawnAlpha;

        const damageAt = Number(node.damageAtMs);
        let damagePulse = 0;
        let shakeProgress = 0;
        if (Number.isFinite(damageAt)) {
            const damageAge = frame.atMs - damageAt;
            if (damageAge >= 0 && damageAge <= DAMAGE_TINT_MS) {
                damagePulse = clamp(1 - damageAge / DAMAGE_TINT_MS, 0, 1);
            }
            if (damageAge >= 0 && damageAge <= DAMAGE_SHAKE_MS) {
                shakeProgress = clamp(1 - damageAge / DAMAGE_SHAKE_MS, 0, 1);
            }
            if (damageAge > DAMAGE_TINT_MS && damageAge > DAMAGE_SHAKE_MS) {
                node.damageAtMs = undefined;
                node.damageRatio = undefined;
            }
        }

        const tintStrength = damagePulse * 0.85;
        const nextTint = tintStrength > 0 ? mixColors(0xffffff, DAMAGE_TINT_COLOR, tintStrength) : 0xffffff;
        if (unit.isEnemy && node.enemySprite?.visible) {
            node.enemySprite.tint = nextTint;
        } else {
            node.body.tint = nextTint;
        }

        if (!Number.isFinite(node.shakeSeed)) {
            node.shakeSeed = hashString(unit.id);
        }
        const shakeSeed = Number(node.shakeSeed);
        const damageRatio = Number(node.damageRatio) || 0;
        const shakeAmplitude = combatActive ? (shakeProgress * (3 + damageRatio * 6)) : 0;
        const shakeTime = (frame.atMs + shakeSeed) * 0.08;
        const offsetX = Math.sin(shakeTime) * shakeAmplitude;
        const offsetY = Math.cos(shakeTime * 1.1) * shakeAmplitude;

        let desiredAttackMotionX = 0;
        let desiredAttackMotionY = 0;
        const attackCue = attackBySource.get(unit.id);
        if (combatActive && attackCue) {
            const age = frame.atMs - attackCue.atMs;
            const kind = resolveAttackVfxKind(unit.weaponType);
            const hasMovementChoreo = typeof unit.movementState === "string";
            const choreographyMultiplier = hasMovementChoreo
                ? (kind === "melee_arc" ? 0.42 : kind === "ranged_projectile" ? 0.3 : 0.24)
                : 1;
            const transitionAttackDampen = floorTransitionActive
                ? (0.35 + floorTransitionProgress * 0.65)
                : 1;
            const motionMs = kind === "magic_beam"
                ? MAGIC_SPIRAL_MS
                : kind === "ranged_projectile"
                    ? RANGED_RECOIL_MS
                    : ATTACK_LUNGE_MS;
            if (age >= 0 && age <= motionMs) {
                const phase = clamp(age / motionMs, 0, 1);
                const ease = Math.sin(Math.PI * phase);
                const target = unitById.get(attackCue.targetId) ?? null;

                if (kind === "melee_arc") {
                    if (target) {
                        const targetX = toWorldX(target.x);
                        const targetY = toWorldY(target.y);
                        const dx = targetX - baseX;
                        const dy = targetY - baseY;
                        const length = Math.hypot(dx, dy) || 1;
                        const distance = ATTACK_LUNGE_DISTANCE
                            * choreographyMultiplier
                            * transitionAttackDampen
                            * (unit.isBoss ? 1.15 : 1);
                        desiredAttackMotionX = (dx / length) * distance * ease;
                        desiredAttackMotionY = (dy / length) * distance * ease;
                    }
                } else if (kind === "ranged_projectile") {
                    // Ranged: slight recoil away from the target.
                    if (target) {
                        const targetX = toWorldX(target.x);
                        const targetY = toWorldY(target.y);
                        const dx = targetX - baseX;
                        const dy = targetY - baseY;
                        const length = Math.hypot(dx, dy) || 1;
                        const distance = RANGED_RECOIL_DISTANCE
                            * choreographyMultiplier
                            * transitionAttackDampen
                            * (unit.isBoss ? 1.1 : 1);
                        desiredAttackMotionX = -(dx / length) * distance * ease;
                        desiredAttackMotionY = -(dy / length) * distance * ease;
                    }
                } else {
                    // Magic: swirl in a small spiral, oriented toward the target (when available).
                    const turns = MAGIC_SPIRAL_TURNS;
                    const angle = phase * Math.PI * 2 * turns;
                    // Make it feel like a spiral rather than a vibration:
                    // start at 0, expand to max, then return to 0.
                    const radius = MAGIC_SPIRAL_RADIUS
                        * choreographyMultiplier
                        * transitionAttackDampen
                        * Math.sin(Math.PI * phase);
                    const c = Math.cos(angle);
                    const s = Math.sin(angle);
                    if (target) {
                        const targetX = toWorldX(target.x);
                        const targetY = toWorldY(target.y);
                        const dx = targetX - baseX;
                        const dy = targetY - baseY;
                        const length = Math.hypot(dx, dy) || 1;
                        const nx = dx / length;
                        const ny = dy / length;
                        const px = -ny;
                        const py = nx;
                        desiredAttackMotionX = (nx * c + px * s) * radius;
                        desiredAttackMotionY = (ny * c + py * s) * radius;
                    } else {
                        desiredAttackMotionX = c * radius;
                        desiredAttackMotionY = s * radius;
                    }
                }
            }
        }

        const previousAttackMotionX = Number(node.attackMotionX);
        const previousAttackMotionY = Number(node.attackMotionY);
        const previousAttackMotionAtMs = Number(node.attackMotionAtMs);
        const hasAttackMotionHistory = Number.isFinite(previousAttackMotionX)
            && Number.isFinite(previousAttackMotionY)
            && Number.isFinite(previousAttackMotionAtMs);
        let attackMotionX = desiredAttackMotionX;
        let attackMotionY = desiredAttackMotionY;
        if (hasAttackMotionHistory) {
            const deltaMs = clamp(frame.atMs - previousAttackMotionAtMs, 0, 260);
            if (deltaMs <= 0) {
                attackMotionX = previousAttackMotionX;
                attackMotionY = previousAttackMotionY;
            } else {
                const desiredMagnitude = Math.hypot(desiredAttackMotionX, desiredAttackMotionY);
                const timeConstantMs = desiredMagnitude > 0.02 ? 56 : 190;
                const blend = 1 - Math.exp(-deltaMs / Math.max(1, timeConstantMs));
                attackMotionX = previousAttackMotionX + (desiredAttackMotionX - previousAttackMotionX) * blend;
                attackMotionY = previousAttackMotionY + (desiredAttackMotionY - previousAttackMotionY) * blend;
                if (desiredMagnitude <= 0.02 && Math.hypot(attackMotionX, attackMotionY) < 0.02) {
                    attackMotionX = 0;
                    attackMotionY = 0;
                }
            }
        }
        node.attackMotionX = attackMotionX;
        node.attackMotionY = attackMotionY;
        node.attackMotionAtMs = frame.atMs;

        const targetPosX = baseX + offsetX + attackMotionX;
        const targetPosY = baseY + offsetY + attackMotionY;
        const previousX = Number(node.motionX);
        const previousY = Number(node.motionY);
        const previousAtMs = Number(node.motionAtMs);
        const canInterpolate = wasVisible
            && Number.isFinite(previousX)
            && Number.isFinite(previousY)
            && Number.isFinite(previousAtMs);

        if (!canInterpolate) {
            node.motionX = targetPosX;
            node.motionY = targetPosY;
            node.motionAtMs = frame.atMs;
        } else {
            const deltaMs = clamp(frame.atMs - previousAtMs, 0, 260);
            const jumpDistance = Math.hypot(targetPosX - previousX, targetPosY - previousY);
            const shouldSnap = floorTransitionActive
                ? (jumpDistance > 320 || deltaMs > 420)
                : (jumpDistance > 140 || deltaMs > 240);
            if (shouldSnap) {
                node.motionX = targetPosX;
                node.motionY = targetPosY;
            } else {
                // Smooth motion toward the target to avoid visible frame-to-frame teleporting.
                const t = clamp(deltaMs / 120, 0, 1);
                const blend = floorTransitionActive
                    ? (0.11 + t * 0.23)
                    : (0.24 + t * 0.36);
                node.motionX = previousX + (targetPosX - previousX) * blend;
                node.motionY = previousY + (targetPosY - previousY) * blend;
            }
            node.motionAtMs = frame.atMs;
        }
        node.container.position.set(Number(node.motionX) || targetPosX, Number(node.motionY) || targetPosY);
    });

    renderAttackVfx(runtime, frame, unitById, {
        melee: meleeVfxColor,
        ranged: rangedVfxColor,
        magic: magicVfxColor
    });

    runtime.unitNodes.forEach((node, id) => {
        if (!seen.has(id)) {
            node.container.visible = false;
            node.lastHp = undefined;
            node.damageAtMs = undefined;
            node.damageRatio = undefined;
            node.spawnAtMs = undefined;
            node.motionX = undefined;
            node.motionY = undefined;
            node.motionAtMs = undefined;
            node.attackMotionX = undefined;
            node.attackMotionY = undefined;
            node.attackMotionAtMs = undefined;
            node.magicPulse.clear();
            node.magicPulse.visible = false;
            if (node.enemySprite) {
                node.enemySprite.visible = false;
            }
            if (node.enemyOutlineSprites) {
                node.enemyOutlineSprites.forEach((sprite) => { sprite.visible = false; });
            }
            node.attackBack.clear();
            node.attackFill.clear();
            node.attackBack.visible = false;
            node.attackFill.visible = false;
        }
    });
    runtime.lastSeen = seen;

    ensureFloatingTextPool(runtime);
    updateFloatingTexts(runtime, frame);
    updateFrameLayout(runtime, frame, viewportWidth, viewportHeight);
};
