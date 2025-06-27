export interface GameState {
  health: number;
  maxHealth: number;
  gold: number;
  score: number;
  wave: number;
  survivalTime: number;
  isPaused: boolean;
  isGameOver: boolean;
  enemyCount?: number;
  towerStats?: TowerStats;
  healthRegen?: number;
  upgradeLevels?: UpgradeLevel;
  speedMultiplier?: number;
  // Ability states
  speedBoostActive?: boolean;
  speedBoostCooldown?: number;
  speedBoostDuration?: number;
  // Wave tracking
  waveStartHealth?: number;
  perfectWaveStreak?: number;
  // Kill streak tracking
  killStreak?: number;
  killStreakTimer?: number;
  killStreakActive?: boolean;
  // Economic tracking
  goldPerRound?: number;
  interestRate?: number;
  lastInterestTime?: number;
  waveState?: {
    currentWave: number;
    isWaveActive: boolean;
    enemiesRemaining: Record<string, number>;
    totalEnemiesRemaining: number;
    nextWaveTimer: number;
    composition: {
      enemies: Array<{
        type: string;
        count: number;
        displayName: string;
        icon: string;
      }>;
    };
  };
}

export interface TowerStats {
  damage: number;
  fireRate: number;
  range: number;
  projectileSpeed: number;
  multiShotChance?: number;
  bounceChance?: number;
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