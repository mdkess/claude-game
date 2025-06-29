import { Enemy } from '../entities/Enemy';
import { Tower } from '../entities/Tower';
import { Projectile } from '../entities/Projectile';
import { EnemyType } from '../types';

/**
 * Type guard to check if an object is an Enemy
 */
export function isEnemy(obj: unknown): obj is Enemy {
  return obj instanceof Enemy;
}

/**
 * Type guard to check if an object is a Tower
 */
export function isTower(obj: unknown): obj is Tower {
  return obj instanceof Tower;
}

/**
 * Type guard to check if an object is a Projectile
 */
export function isProjectile(obj: unknown): obj is Projectile {
  return obj instanceof Projectile;
}

/**
 * Type guard to check if an enemy is of a specific type
 */
export function isEnemyType(enemy: Enemy, type: EnemyType): boolean {
  return enemy.type === type;
}

/**
 * Type guard to check if an enemy is active and alive
 */
export function isActiveEnemy(enemy: unknown): enemy is Enemy {
  return isEnemy(enemy) && enemy.isActive && !enemy.isDead;
}

/**
 * Type guard to check if a projectile is active
 */
export function isActiveProjectile(projectile: unknown): projectile is Projectile {
  return isProjectile(projectile) && !projectile.isDestroyed;
}

/**
 * Type guard for arrays of entities
 */
export function areAllEnemies(entities: unknown[]): entities is Enemy[] {
  return entities.every(isEnemy);
}

export function areAllProjectiles(entities: unknown[]): entities is Projectile[] {
  return entities.every(isProjectile);
}

/**
 * Type guard for filtering active entities
 */
export function filterActiveEnemies(entities: unknown[]): Enemy[] {
  return entities.filter(isActiveEnemy);
}

export function filterActiveProjectiles(entities: unknown[]): Projectile[] {
  return entities.filter(isActiveProjectile);
}

/**
 * Safe entity access with type checking
 */
export function getEnemyOrNull(obj: unknown): Enemy | null {
  return isEnemy(obj) ? obj : null;
}

export function getProjectileOrNull(obj: unknown): Projectile | null {
  return isProjectile(obj) ? obj : null;
}

/**
 * Type guard for checking entity properties
 */
export function hasPosition(obj: unknown): obj is { x: number; y: number } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'x' in obj &&
    'y' in obj &&
    typeof (obj as Record<string, unknown>).x === 'number' &&
    typeof (obj as Record<string, unknown>).y === 'number'
  );
}

export function hasHealth(obj: unknown): obj is { health: number; maxHealth: number } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'health' in obj &&
    'maxHealth' in obj &&
    typeof (obj as Record<string, unknown>).health === 'number' &&
    typeof (obj as Record<string, unknown>).maxHealth === 'number'
  );
}

/**
 * Type guard for event data validation
 */
export function isValidEnemyKilledEvent(data: unknown): data is { enemy: Enemy } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'enemy' in data &&
    isEnemy((data as Record<string, unknown>).enemy)
  );
}

export function isValidProjectileHitEvent(
  data: unknown
): data is { projectile: Projectile; enemy: Enemy; damage: number } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'projectile' in data &&
    'enemy' in data &&
    'damage' in data &&
    isProjectile((data as Record<string, unknown>).projectile) &&
    isEnemy((data as Record<string, unknown>).enemy) &&
    typeof (data as Record<string, unknown>).damage === 'number'
  );
}