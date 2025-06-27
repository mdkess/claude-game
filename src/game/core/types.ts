// Core event types
export interface EnemyKilledEvent {
  enemy: {
    x: number;
    y: number;
    damage: number;
    reward: number;
    isDead: boolean;
    isActive: boolean;
    type: string;
  };
  type: 'normal' | 'splitter' | 'exploding';
  splitData?: {
    count: number;
    type: string;
    x: number;
    y: number;
  };
  explosionData?: {
    x: number;
    y: number;
    radius: number;
    damage: number;
  };
}

export interface TowerDamagedEvent {
  damage: number;
}

export interface WaveStartedEvent {
  wave: number;
  enemyType: string;
  spawnPosition: { x: number; y: number };
}

export interface UpgradePurchasedEvent {
  type: string;
  cost: number;
  newLevel: number;
}