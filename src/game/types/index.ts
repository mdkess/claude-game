// Re-export GameState and related types from the new file
export type { 
  GameState, 
  CoreGameState, 
  TowerState, 
  AbilityState, 
  KillStreakState, 
  WaveTrackingState, 
  EconomicState,
  hasAbilityState,
  hasKillStreakState,
  hasEconomicState
} from './gameState';

export interface TowerStats {
  damage: number;
  fireRate: number;
  range: number;
  projectileSpeed: number;
  multiShotChance?: number;  // Legacy - to be removed
  bounceChance?: number;      // Legacy - to be removed
  multiShotCount?: number;    // Number of extra projectiles
  bounceCount?: number;       // Number of chain bounces
}

export interface EnemyStats {
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  reward: number;
}

export enum EnemyType {
  Basic = 'basic',
  Swarm = 'swarm',
  Tank = 'tank',
  Splitter = 'splitter'
}

export interface UpgradeLevel {
  damage: number;
  fireRate: number;
  maxHealth: number;
  healthRegen: number;
  range: number;
  goldPerRound: number;
  interest: number;
}

export type UpgradeType = keyof UpgradeLevel;

export interface MiniUpgradeLevel {
  quickShot: number;
  sharpAmmo: number;
  bandages: number;
}

export type MiniUpgradeType = keyof MiniUpgradeLevel;

export interface PermanentUpgrades {
  startingDamage: number;
  startingFireRate: number;
  startingHealth: number;
  goldMultiplier: number;
  essenceGain: number;
  multiShot: number;
  bounce: number;
}