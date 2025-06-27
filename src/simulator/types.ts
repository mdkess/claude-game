import { GameState, PermanentUpgrades, UpgradeType } from '../game/types';

export interface SimulatorConfig {
  maxSimulatedTime: number; // in seconds
  timeStep: number; // simulation timestep in seconds (e.g., 1/60 for 60fps)
  strategyUpdateInterval: number; // how often to call strategy update (in seconds)
  permanentUpgrades?: PermanentUpgrades;
  logLevel?: 'none' | 'summary' | 'detailed';
}

export interface SimulatorMetrics {
  finalWave: number;
  survivalTime: number;
  totalGoldEarned: number;
  totalGoldSpent: number;
  goldEfficiency: number;
  totalEnemiesKilled: number;
  enemiesKilledByType: Record<string, number>;
  damageDealtTotal: number;
  damageTakenTotal: number;
  damageTakenByType: Record<string, number>;
  essenceEarned: number;
  upgradePurchases: Array<{
    time: number;
    upgrade: UpgradeType;
    cost: number;
    level: number;
  }>;
  deathCause?: string;
  deathTime?: number;
  maxHealth: number;
  finalStats: {
    damage: number;
    fireRate: number;
    range: number;
    health: number;
    healthRegen: number;
  };
}

export interface UpgradeStrategy {
  name: string;
  
  /**
   * Called every strategyUpdateInterval to decide on upgrades
   * @param gameState Current game state
   * @param upgradeCosts Current costs for each upgrade
   * @param metrics Current metrics
   * @returns The upgrade to purchase, or null to save gold
   */
  update(
    gameState: GameState,
    upgradeCosts: Record<UpgradeType, number>,
    metrics: SimulatorMetrics
  ): UpgradeType | null;
}

export interface SimulationResult {
  config: SimulatorConfig;
  strategy: string;
  metrics: SimulatorMetrics;
  success: boolean;
  error?: string;
}