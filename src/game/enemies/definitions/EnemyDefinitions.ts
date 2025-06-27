import { EnemyType } from '../../types';
import { StraightMovement, MovementStrategy } from '../strategies/MovementStrategies';
import { NormalDeath, SplitterDeath, DeathStrategy } from '../strategies/DeathStrategy';

export interface EnemyDefinition {
  type: EnemyType;
  displayName: string;
  baseStats: {
    health: number;
    speed: number;
    damage: number;
    reward: number;
  };
  visual: {
    color: number;
    size: number;
    shape: 'circle' | 'hexagon' | 'triangle' | 'square';
  };
  movement: () => MovementStrategy;
  death: () => DeathStrategy;
  spawnGroup?: number; // How many spawn together
}

export const enemyDefinitions: Map<EnemyType, EnemyDefinition> = new Map([
  [EnemyType.Basic, {
    type: EnemyType.Basic,
    displayName: 'Basic Enemy',
    baseStats: {
      health: 15,
      speed: 80,
      damage: 10,
      reward: 5
    },
    visual: {
      color: 0x00ff88,
      size: 15,
      shape: 'circle'
    },
    movement: () => new StraightMovement(80),
    death: () => new NormalDeath()
  }],
  
  [EnemyType.Swarm, {
    type: EnemyType.Swarm,
    displayName: 'Swarm Enemy',
    baseStats: {
      health: 5,
      speed: 160,
      damage: 5,
      reward: 2
    },
    visual: {
      color: 0xffaa00,
      size: 8,
      shape: 'triangle'
    },
    movement: () => new StraightMovement(160),
    death: () => new NormalDeath(),
    spawnGroup: 5
  }],
  
  [EnemyType.Tank, {
    type: EnemyType.Tank,
    displayName: 'Tank Enemy',
    baseStats: {
      health: 80,
      speed: 40,
      damage: 20,
      reward: 20
    },
    visual: {
      color: 0xff4444,
      size: 20,
      shape: 'hexagon'
    },
    movement: () => new StraightMovement(40),
    death: () => new NormalDeath()
  }],
  
  [EnemyType.Splitter, {
    type: EnemyType.Splitter,
    displayName: 'Splitter Enemy',
    baseStats: {
      health: 25,
      speed: 80,
      damage: 10,
      reward: 10
    },
    visual: {
      color: 0xaa44ff,
      size: 12,
      shape: 'square'
    },
    movement: () => new StraightMovement(80),
    death: () => new SplitterDeath(3, 'swarm')
  }]
]);

// Helper function to get scaled stats for a given wave
export function getScaledStats(definition: EnemyDefinition, waveNumber: number) {
  // More gradual health scaling - 3% per wave instead of 5%
  const scaleFactor = Math.pow(1.03, waveNumber - 1);
  // Even slower speed scaling - 1% per wave instead of 2%
  const speedScale = Math.pow(1.01, waveNumber - 1);
  
  return {
    health: definition.baseStats.health * scaleFactor,
    maxHealth: definition.baseStats.health * scaleFactor,
    speed: definition.baseStats.speed * speedScale,
    damage: definition.baseStats.damage,
    reward: definition.baseStats.reward
  };
}