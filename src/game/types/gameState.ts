import { TowerStats, UpgradeLevel } from './index';

/**
 * Core game state - always present
 */
export interface CoreGameState {
  health: number;
  maxHealth: number;
  gold: number;
  score: number;
  wave: number;
  survivalTime: number;
  isPaused: boolean;
  isGameOver: boolean;
  speedMultiplier: number;
}

/**
 * Tower-related state
 */
export interface TowerState {
  towerStats: TowerStats;
  upgradeLevels: UpgradeLevel;
}

/**
 * Ability system state
 */
export interface AbilityState {
  speedBoostActive: boolean;
  speedBoostCooldown: number;
  speedBoostDuration: number;
}

/**
 * Kill streak system state
 */
export interface KillStreakState {
  killStreak: number;
  killStreakTimer: number;
  killStreakActive: boolean;
}

/**
 * Wave tracking state
 */
export interface WaveTrackingState {
  waveStartHealth: number;
  perfectWaveStreak: number;
  enemyCount: number;
  waveState: {
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

/**
 * Economic system state
 */
export interface EconomicState {
  goldPerRound: number;
  interestRate: number;
  healthRegen: number;
}

/**
 * Complete game state combining all subsystems
 */
export interface GameState extends 
  CoreGameState, 
  TowerState, 
  AbilityState, 
  KillStreakState, 
  WaveTrackingState, 
  EconomicState {
  // All properties are now required through the extended interfaces
}

/**
 * Type guards for checking state presence
 */
export function hasAbilityState(state: Partial<GameState>): state is Partial<GameState> & AbilityState {
  return state.speedBoostActive !== undefined && 
         state.speedBoostCooldown !== undefined && 
         state.speedBoostDuration !== undefined;
}

export function hasKillStreakState(state: Partial<GameState>): state is Partial<GameState> & KillStreakState {
  return state.killStreak !== undefined && 
         state.killStreakTimer !== undefined && 
         state.killStreakActive !== undefined;
}

export function hasEconomicState(state: Partial<GameState>): state is Partial<GameState> & EconomicState {
  return state.goldPerRound !== undefined && 
         state.interestRate !== undefined && 
         state.healthRegen !== undefined;
}