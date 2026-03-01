export const DUNGEON_FLOAT_WINDOW_MS = 1_400;
export const FLOAT_MAX_COUNT = 20;
export const ATTACK_LUNGE_WINDOW_MS = 260;
export const MAGIC_PULSE_WINDOW_MS = 700;

export const PARTY_LAYOUT: Array<{ x: number; y: number }> = [
    { x: 0.2, y: 0.38 },
    { x: 0.2, y: 0.62 },
    { x: 0.32, y: 0.32 },
    { x: 0.32, y: 0.68 }
];

export const MOVEMENT_BOUNDS = {
    minX: 0.08,
    maxX: 0.92,
    minY: 0.14,
    maxY: 0.86
} as const;

export const MOVEMENT_BASE_ORBIT_PERIOD_MS = 1_900;
export const MOVEMENT_MAX_RANGE_OFFSET = 0.016;
export const MOVEMENT_MAX_REACTION_DELAY_MS = 120;
export const MOVEMENT_SEPARATION_RADIUS = 0.088;
export const MOVEMENT_SEPARATION_STRENGTH = 0.024;
export const MOVEMENT_MAX_SEPARATION_OFFSET = 0.03;
export const MOVEMENT_MAX_TARGET_SWITCH_SPEED_PER_SECOND = 1.25;
