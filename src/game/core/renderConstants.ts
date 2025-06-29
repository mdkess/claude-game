/**
 * Rendering and visual effect constants
 */

// Tower Renderer Constants
export const TOWER_DAMAGE_FLASH_DURATION = 0.3;
export const TOWER_PULSE_SPEED = 2;
export const TOWER_PULSE_SCALE = 0.05;
export const TOWER_CORE_SCALE = 0.3;
export const TOWER_FLASH_FREQUENCY = 20;
export const TOWER_FLASH_INTENSITY = 0.5;

// Range Indicator Constants
export const RANGE_DASH_LENGTH = 20;
export const RANGE_DASH_GAP = 10;
export const RANGE_ROTATION_SPEED = 0.5;
export const RANGE_FILL_ALPHA = 0.02;
export const RANGE_RIPPLE_INTERVAL = 3;
export const RANGE_RIPPLE_STROKE_WIDTH = 2;
export const RANGE_RIPPLE_ALPHA = 0.5;
export const RANGE_RIPPLE_LIFETIME = 2;
export const RANGE_RIPPLE_SCALE = 0.2;

// Enemy Renderer Constants
export const ENEMY_PULSE_SPEED = 3;
export const ENEMY_PULSE_SCALE = 0.2;
export const ENEMY_HIT_EFFECT_DURATION = 0.3;
export const ENEMY_HIT_PULSE_BOOST = 2;
export const ENEMY_HIT_PULSE_SCALE = 0.3;
export const ENEMY_HEALTH_SCALE_MIN = 0.9;
export const ENEMY_HEALTH_SCALE_RANGE = 0.1;
export const ENEMY_GLOW_SCALE = 2;
export const ENEMY_INNER_GLOW_SCALE = 1.5;
export const ENEMY_STROKE_WIDTH = 2;
export const ENEMY_CORE_SCALE = 0.6;
export const ENEMY_CORE_BLEND_FACTOR = 0.5;
export const ENEMY_CORE_ALPHA = 0.8;
export const ENEMY_PHASE_MULTIPLIER = Math.PI * 2;
export const ENEMY_GLOW_ALPHA = {
  OUTER: 0.4,
  INNER: 0.6,
  MAIN: 0.8,
  SPECIAL: 0.5
} as const;

// Enemy Shape Rotation Speeds
export const ENEMY_ROTATION_SPEED = {
  HEXAGON: 0.6,
  SQUARE: 1.2,
  TRIANGLE: 0.9
} as const;

// Enemy Flash Effect Constants
export const ENEMY_DAMAGE_FLASH_DURATION = 0.167;
export const ENEMY_DAMAGE_FLASH_MS = 167;
export const ENEMY_FLASH_STROKE_WIDTH = 3;
export const ENEMY_FLASH_RING_OFFSET = 5;
export const ENEMY_FLASH_CORE_SCALE = 0.3;
export const ENEMY_FLASH_LINE_COUNT = 6;
export const ENEMY_FLASH_LINE_INNER = 0.7;
export const ENEMY_FLASH_LINE_OUTER = 1.3;
export const ENEMY_FLASH_ROTATION = 0.5;
export const ENEMY_FLASH_SCALE_PROGRESS = 0.3;

// Health Bar Constants
export const HEALTH_BAR_BG_ALPHA = 0.5;
export const HEALTH_THRESHOLD_HIGH = 0.5;
export const HEALTH_THRESHOLD_LOW = 0.25;

// Projectile Renderer Constants
export const PROJECTILE_TRAIL_THRESHOLD = 2;
export const PROJECTILE_OUTER_RADIUS = 6;
export const PROJECTILE_TRAIL_ALPHA = 0.5;
export const PROJECTILE_MAIN_RADIUS = 4;
export const PROJECTILE_CORE_RADIUS = 2;

// Screen Shake Constants
export const SHAKE_INTENSITY = {
  MULTISHOT: 3,
  UPGRADE: 5,
  BOUNCE: 2,
  CRITICAL: 4,
  ELITE_DEATH: 8,
  NORMAL_DEATH: 5,
  VICTORY: 10,
  GAMEOVER: 20,
  DEFAULT: 5
} as const;

export const SHAKE_DURATION = {
  MULTISHOT: 0.2,
  UPGRADE: 0.3,
  BOUNCE: 0.1,
  CRITICAL: 0.2,
  DEATH: 0.3,
  VICTORY: 0.5,
  GAMEOVER: 1,
  DEFAULT: 0.3
} as const;

// Effect Scale Constants
export const EFFECT_SCALE = {
  ELITE: 1.5,
  VICTORY_EXPLOSION: 0.7,
  GAMEOVER_EXPLOSION: 1.5
} as const;

// Explosion Constants
export const EXPLOSION_COUNT = {
  VICTORY: 8,
  GAMEOVER: 5
} as const;

export const EXPLOSION_DELAY = {
  VICTORY: 100,
  GAMEOVER: 150
} as const;

export const EXPLOSION_RADIUS = {
  VICTORY: 100,
  GAMEOVER_SPREAD: 100
} as const;