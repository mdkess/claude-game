import { Enemy } from '@/game/entities/Enemy';
import { EnemyType, TowerStats } from '@/game/types';
import { StraightMovement } from '@/game/enemies/strategies/MovementStrategies';
import { NormalDeath } from '@/game/enemies/strategies/DeathStrategy';

export function createMockEnemy(overrides: Partial<{
  x: number;
  y: number;
  health: number;
  type: EnemyType;
  isActive: boolean;
  isDead: boolean;
}> = {}): Enemy {
  const enemy = new Enemy();
  enemy.init({
    x: 100,
    y: 100,
    health: 50,
    maxHealth: 50,
    speed: 50,
    damage: 10,
    reward: 10,
    type: EnemyType.Basic,
    movementStrategy: new StraightMovement(50),
    deathStrategy: new NormalDeath(),
    ...overrides
  });
  
  if (overrides.isDead) {
    enemy.isDead = overrides.isDead;
  }
  if (overrides.isActive !== undefined) {
    enemy.isActive = overrides.isActive;
  }
  
  return enemy;
}

export function createMockTowerStats(overrides: Partial<TowerStats> = {}): TowerStats {
  return {
    damage: 10,
    fireRate: 2,
    range: 200,
    projectileSpeed: 300,
    multiShotCount: 0,
    bounceCount: 0,
    ...overrides
  };
}