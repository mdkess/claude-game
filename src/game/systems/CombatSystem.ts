import { Tower } from '../entities/Tower';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { gameEvents, GameEvents } from '../core/EventEmitter';

/**
 * Manages combat between tower and enemies
 */
export class CombatSystem {
  private tower: Tower;
  private fireTimer: number = 0;
  private projectilePool: Projectile[] = [];
  
  constructor(tower: Tower) {
    this.tower = tower;
    
    // Pre-populate projectile pool
    for (let i = 0; i < 50; i++) {
      this.projectilePool.push(new Projectile());
    }
  }
  
  update(deltaTime: number, enemies: Enemy[], projectiles: Projectile[]): void {
    // Update fire timer
    this.fireTimer += deltaTime;
    
    // Check if we can fire
    const fireInterval = 1 / this.tower.stats.fireRate;
    
    if (this.fireTimer >= fireInterval) {
      const target = this.tower.findNearestTarget(enemies);
      
      if (target) {
        this.fireAtTarget(target as Enemy, projectiles);
        this.fireTimer = 0;
      }
    }
  }
  
  private fireAtTarget(target: Enemy, projectiles: Projectile[]): void {
    // Calculate angle to target
    const dx = target.x - this.tower.x;
    const dy = target.y - this.tower.y;
    const angle = Math.atan2(dy, dx);
    
    // Emit tower shoot event
    gameEvents.emit(GameEvents.TowerShoot, {
      x: this.tower.x,
      y: this.tower.y,
      angle: angle,
      isMultiShot: this.tower.stats.multiShotChance ? Math.random() < this.tower.stats.multiShotChance : false
    });
    
    // Fire main projectile
    const mainProjectile = this.createProjectile(target);
    if (mainProjectile) {
      projectiles.push(mainProjectile);
      gameEvents.emit(GameEvents.ProjectileSpawned, mainProjectile);
      
      // Handle multi-shot
      if (this.tower.stats.multiShotChance && Math.random() < this.tower.stats.multiShotChance) {
        // Fire second projectile with slight delay effect
        setTimeout(() => {
          const secondProjectile = this.createProjectile(target);
          if (secondProjectile) {
            projectiles.push(secondProjectile);
            gameEvents.emit(GameEvents.ProjectileSpawned, secondProjectile);
          }
        }, 50); // 50ms delay for visual effect
      }
    }
  }
  
  private createProjectile(target: Enemy): Projectile | null {
    const projectile = this.getProjectileFromPool();
    if (!projectile) return null;
    
    projectile.init({
      x: this.tower.x,
      y: this.tower.y,
      targetX: target.x,
      targetY: target.y,
      speed: this.tower.stats.projectileSpeed,
      range: this.tower.stats.range,
      damage: this.tower.stats.damage,
      bounceChance: this.tower.stats.bounceChance
    });
    
    return projectile;
  }
  
  private getProjectileFromPool(): Projectile | null {
    const projectile = this.projectilePool.pop();
    if (projectile) {
      return projectile;
    }
    // Create new projectile if pool is empty
    return new Projectile();
  }
  
  releaseProjectile(projectile: Projectile): void {
    projectile.reset();
    this.projectilePool.push(projectile);
  }
}