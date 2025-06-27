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
    
    // Determine total projectiles to fire
    const extraProjectiles = this.tower.stats.multiShotCount || 0;
    const totalProjectiles = 1 + extraProjectiles;
    
    // Emit tower shoot event
    gameEvents.emit(GameEvents.TowerShoot, {
      x: this.tower.x,
      y: this.tower.y,
      angle: angle,
      isMultiShot: extraProjectiles > 0
    });
    
    // Fire all projectiles with slight spread
    for (let i = 0; i < totalProjectiles; i++) {
      // Add slight angle spread for multiple projectiles
      const spreadAngle = extraProjectiles > 0 ? (i - extraProjectiles / 2) * 0.15 : 0;
      const projectileAngle = angle + spreadAngle;
      
      // Calculate target position with spread
      const distance = Math.sqrt(dx * dx + dy * dy);
      const targetX = this.tower.x + Math.cos(projectileAngle) * distance;
      const targetY = this.tower.y + Math.sin(projectileAngle) * distance;
      
      const projectile = this.createProjectileWithTarget(targetX, targetY);
      if (projectile) {
        projectiles.push(projectile);
        gameEvents.emit(GameEvents.ProjectileSpawned, projectile);
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
      bounceCount: this.tower.stats.bounceCount || 0
    });
    
    return projectile;
  }
  
  private createProjectileWithTarget(targetX: number, targetY: number): Projectile | null {
    const projectile = this.getProjectileFromPool();
    if (!projectile) return null;
    
    projectile.init({
      x: this.tower.x,
      y: this.tower.y,
      targetX: targetX,
      targetY: targetY,
      speed: this.tower.stats.projectileSpeed,
      range: this.tower.stats.range,
      damage: this.tower.stats.damage,
      bounceCount: this.tower.stats.bounceCount || 0
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