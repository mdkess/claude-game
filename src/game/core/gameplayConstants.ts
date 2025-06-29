/**
 * Gameplay mechanics constants
 */

// Combat System Constants
export const PROJECTILE_POOL_SIZE = 200;
export const MULTI_SHOT_SPREAD_ANGLE = 0.15;

// Enemy Size Constants
export const ENEMY_RADIUS = {
  DEFAULT: 15,
  SWARM: 8,
  TANK: 20,
  SPLITTER: 12
} as const;

// Projectile Constants
export const PROJECTILE_ID_MULTIPLIER = 1000;
export const PROJECTILE_ID_RANGE = 1000;
export const PROJECTILE_BOUNDS_MARGIN = 100;
export const PROJECTILE_COLLISION_RADIUS = 5;
export const PROJECTILE_CHAIN_MAX_RANGE = 150;
export const PROJECTILE_CHAIN_RANGE = 150;
export const PROJECTILE_CHAIN_DAMAGE_MULTIPLIER = 0.8;

// Movement Strategy Constants
export const ZIGZAG_DEFAULT_AMPLITUDE = 30;
export const ZIGZAG_DEFAULT_FREQUENCY = 0.1;
export const ZIGZAG_DAMPING = 0.1;
export const DASH_DEFAULT_DURATION = 0.167;
export const DASH_DEFAULT_INTERVAL = 2;

// Visual Effect Constants
export const EXPLOSION_FLASH_RADIUS = 30;
export const EXPLOSION_FLASH_ALPHA = 0.8;
export const EXPLOSION_FLASH_SCALE = 3;
export const EXPLOSION_FLASH_DURATION = 0.3;

export const EXPLOSION_PARTICLE_BASE = 20;
export const EXPLOSION_PARTICLE_RANGE = 10;
export const EXPLOSION_ANGLE_VARIATION = 0.5;
export const EXPLOSION_SPEED_BASE = 3;
export const EXPLOSION_SPEED_RANGE = 4;
export const EXPLOSION_PARTICLE_SCALE_BASE = 0.5;
export const EXPLOSION_PARTICLE_SCALE_RANGE = 0.5;

export const EXPLOSION_SMOKE_COUNT = 8;
export const EXPLOSION_SMOKE_RADIUS = 20;

// Shockwave Constants
export const SHOCKWAVE_LINE_WIDTH = 3;
export const SHOCKWAVE_ALPHA = 0.8;
export const SHOCKWAVE_RADIUS = 10;
export const SHOCKWAVE_SCALE = 8;
export const SHOCKWAVE_DURATION = 0.6;

// Impact Ripple Constants
export const IMPACT_RIPPLE_COUNT = 3;
export const RIPPLE_LINE_WIDTH = 2;
export const RIPPLE_ALPHA = 0.6;
export const RIPPLE_RADIUS = 5;
export const RIPPLE_SCALE = 6;
export const RIPPLE_DURATION = 0.4;
export const RIPPLE_DELAY = 0.1;

// Muzzle Flash Constants
export const MUZZLE_FLASH_ALPHA = 0.9;
export const MUZZLE_FLASH_SCALE_X = 1.5;
export const MUZZLE_FLASH_SCALE_Y = 0.5;
export const MUZZLE_FLASH_DURATION = 0.15;
export const MUZZLE_SPARK_COUNT = 5;
export const SPARK_ANGLE_SPREAD = 0.5;
export const SPARK_SPEED_BASE = 5;
export const SPARK_SPEED_RANGE = 3;
export const MUZZLE_OFFSET = 30;

// Particle Constants
export const PARTICLE_RADIUS = 3;
export const PARTICLE_GRAVITY = 0.2;
export const PARTICLE_DRAG = 0.98;
export const PARTICLE_LIFE_DECAY = 2;

// Spark Constants
export const SPARK_LENGTH = 8;
export const SPARK_WIDTH = 1;
export const SPARK_END_SCALE = 0.2;
export const SPARK_DISTANCE = 20;
export const SPARK_DURATION = 0.3;

// Smoke Constants
export const SMOKE_RADIUS = 10;
export const SMOKE_ALPHA = 0.3;
export const SMOKE_RISE = 30;
export const SMOKE_SCALE = 2;
export const SMOKE_DURATION = 1;

// Trail Constants
export const TRAIL_RADIUS = 4;
export const TRAIL_ALPHA = 0.6;
export const TRAIL_END_SCALE = 0.2;
export const TRAIL_DURATION = 0.3;

// Power-up Effect Constants
export const POWERUP_PARTICLE_COUNT = 10;
export const POWERUP_PARTICLE_RADIUS = 2;
export const POWERUP_RADIUS = 40;
export const POWERUP_RISE = 50;
export const POWERUP_DURATION = 0.8;
export const POWERUP_DELAY_MULTIPLIER = 0.05;
export const POWERUP_STAR_POINTS = 8;
export const POWERUP_STAR_OUTER = 20;
export const POWERUP_STAR_INNER = 10;
export const POWERUP_BURST_ALPHA = 0.8;
export const POWERUP_BURST_SCALE = 2;
export const POWERUP_BURST_DURATION = 0.5;

// Misc Constants
export const SHAKE_RANDOM_MULTIPLIER = 0.5;