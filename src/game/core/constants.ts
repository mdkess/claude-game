// Game Configuration Constants

// Canvas and Game Area
export const GAME_SIZE = 800;
export const GAME_CENTER = GAME_SIZE / 2;
export const FPS = 60;

// Colors
export const COLORS = {
  BACKGROUND: 0x1a1a1a,
  BACKGROUND_FILL: 0x0a0a0a,
  BORDER: 0x00ff88,
  TOWER: {
    MAIN: 0x00ff88,
    GLOW: 0x00ff88,
    INNER: 0x1a1a1a,
    CORE: 0x00ffaa,
  },
  HEALTH_BAR: {
    BACKGROUND: 0x333333,
    FILL: 0x44ff44,
  },
  PROJECTILE: {
    TRAIL: 0x00ff88,
    MAIN: 0x00ffaa,
    CORE: 0xffffff,
  },
  HEALTH_HIGH: 0x00ff00,
  HEALTH_MEDIUM: 0xffff00,
  HEALTH_LOW: 0xff0000,
} as const;

// Tower Constants
export const TOWER_RADIUS = 30;
export const TOWER_SIDES = 6;
export const TOWER_ANIMATION = {
  PULSE_SPEED: 0.05,
  PULSE_MIN: 0.7,
  PULSE_MAX: 1.5,
  GLOW_ALPHA: 0.3,
} as const;

// Projectile Constants
export const PROJECTILE_RADIUS = {
  BASIC: 8,
  SMALL: 4,
  TINY: 2,
} as const;

// Enemy Constants
export const ENEMY_SPAWN_DISTANCE = 600;
export const ENEMY_HEALTH_BAR = {
  WIDTH: 30,
  HEIGHT: 4,
  Y_OFFSET: -10,
} as const;

// Game Mechanics
export const WAVE_DURATION_SECONDS = 30;
export const DIFFICULTY_SCALING_FACTOR = 1.1;
export const ESSENCE_CONVERSION_RATE = 0.15; // 15% of score becomes essence
export const STARTING_GOLD = 25;

// Upgrade Constants
export const UPGRADE_VALUES = {
  DAMAGE: 5,
  FIRE_RATE: 0.5,
  HEALTH: 20,
  RANGE: 25,
} as const;

// Health and Combat
export const DEFAULT_HEALTH = 100;
export const HEALTH_PER_PERMANENT_UPGRADE = 10;
export const DAMAGE_PER_PERMANENT_UPGRADE = 2;
export const FIRE_RATE_PER_PERMANENT_UPGRADE = 0.2;
export const MULTI_SHOT_CHANCE_PER_UPGRADE = 0.05; // 5% per level
export const BOUNCE_CHANCE_PER_UPGRADE = 0.05; // 5% per level
export const MULTI_SHOT_DELAY = 100; // milliseconds between multi-shots
export const BOUNCE_RANGE = 150; // range to find bounce targets
export const BOUNCE_DAMAGE_MULTIPLIER = 0.5; // bounced projectiles do 50% damage

// Performance
export const OBJECT_POOL_INITIAL_SIZE = 50;

// Abilities
export const SPEED_BOOST_DURATION = 3; // seconds
export const SPEED_BOOST_COOLDOWN = 10; // seconds
export const SPEED_BOOST_MULTIPLIER = 2; // 2x fire rate

// Bonuses
export const PERFECT_WAVE_BONUS_MULTIPLIER = 1.5; // 50% bonus gold
export const KILL_STREAK_THRESHOLD = 5; // kills needed
export const KILL_STREAK_TIME_WINDOW = 3; // seconds to get kills
export const KILL_STREAK_DAMAGE_BONUS = 1.5; // 50% damage boost
export const KILL_STREAK_DURATION = 5; // seconds