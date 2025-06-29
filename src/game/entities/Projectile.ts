import { normalizeVector } from '../utils/math';
import { gameEvents, GameEvents } from '../core/EventEmitter';
import { 
  PROJECTILE_ID_MULTIPLIER, 
  PROJECTILE_ID_RANGE, 
  PROJECTILE_BOUNDS_MARGIN
} from '../core/gameplayConstants';
import { GAME_SIZE } from '../core/constants';

export interface ProjectileTarget {
  x: number;
  y: number;
  isDead: boolean;
  isActive: boolean;
  getRadius(): number;
}

export interface ProjectileConfig {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  range: number;
  damage: number;
  bounceChance?: number;  // Legacy
  bounceCount?: number;   // Number of times to chain
}

/**
 * Pure projectile entity with game logic only, no rendering
 */
export class Projectile {
  public x: number = 0;
  public y: number = 0;
  public damage: number = 0;
  public isDestroyed: boolean = false;
  public id: number = 0;
  
  private velocityX: number = 0;
  private velocityY: number = 0;
  private speed: number = 0;
  private maxDistance: number = 0;
  private distanceTraveled: number = 0;
  private bounceChance: number = 0;  // Legacy
  private bounceCount: number = 0;    // Number of remaining bounces
  private hitTargets: Set<ProjectileTarget> = new Set();
  
  init(config: ProjectileConfig): void {
    // Generate new ID for each projectile initialization
    this.id = Date.now() * PROJECTILE_ID_MULTIPLIER + Math.floor(Math.random() * PROJECTILE_ID_RANGE);
    
    this.x = config.x;
    this.y = config.y;
    this.speed = config.speed;
    this.maxDistance = config.range;
    this.damage = config.damage;
    this.bounceChance = config.bounceChance || 0;  // Legacy
    this.bounceCount = config.bounceCount || 0;
    
    // Calculate initial velocity
    const dx = config.targetX - config.x;
    const dy = config.targetY - config.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) {
      this.velocityX = 0;
      this.velocityY = 0;
    } else {
      const direction = normalizeVector(dx, dy);
      this.velocityX = direction.x * this.speed;
      this.velocityY = direction.y * this.speed;
    }
    
    this.isDestroyed = false;
    this.distanceTraveled = 0;
    this.hitTargets.clear();
    
  }
  
  reset(): void {
    this.x = 0;
    this.y = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.damage = 0;
    this.speed = 0;
    this.maxDistance = 0;
    this.distanceTraveled = 0;
    this.bounceChance = 0;
    this.bounceCount = 0;
    this.isDestroyed = false;
    this.hitTargets.clear();
  }
  
  update(deltaTime: number, _targets?: ProjectileTarget[]): void {
    if (this.isDestroyed) return;
    
    const moveDistance = this.speed * deltaTime;
    
    // Update position
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
    
    this.distanceTraveled += moveDistance;
    
    // Destroy if max distance reached or out of bounds
    if (this.distanceTraveled >= this.maxDistance) {
      this.destroy();
    }
    
    // Also destroy if projectile goes way off screen (safety check)
    if (this.x < -PROJECTILE_BOUNDS_MARGIN || this.x > GAME_SIZE + PROJECTILE_BOUNDS_MARGIN || 
        this.y < -PROJECTILE_BOUNDS_MARGIN || this.y > GAME_SIZE + PROJECTILE_BOUNDS_MARGIN) {
      this.destroy();
    }
  }
  
  checkCollision(target: ProjectileTarget): boolean {
    if (this.isDestroyed) {
      return false;
    }
    
    if (target.isDead || !target.isActive || this.hitTargets.has(target)) {
      return false;
    }
    
    const dx = this.x - target.x;
    const dy = this.y - target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const combinedRadius = target.getRadius() + 5; // 5 is projectile collision radius
    
    return distance < combinedRadius;
  }
  
  onHit(target: ProjectileTarget, allTargets: ProjectileTarget[]): void {
    // Mark this target as hit to prevent multiple hits
    this.hitTargets.add(target);
    
    // Check for bounce/chain
    if (this.bounceCount > 0) {
      // Find a nearby target to chain to
      const nearbyTargets = allTargets.filter(t => 
        t !== target && 
        !t.isDead && 
        t.isActive && 
        !this.hitTargets.has(t)
      );
      
      if (nearbyTargets.length > 0) {
        // Find closest target within chain range
        let closestTarget: ProjectileTarget | null = null;
        let closestDistance = 150; // Max chain range
        
        for (const nearby of nearbyTargets) {
          const dx = nearby.x - this.x;
          const dy = nearby.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestTarget = nearby;
          }
        }
        
        if (closestTarget) {
          // Create a new chained projectile
          const chainProjectile = new Projectile();
          chainProjectile.init({
            x: this.x,
            y: this.y,
            targetX: closestTarget.x,
            targetY: closestTarget.y,
            speed: this.speed,
            range: 150, // Chain range
            damage: Math.floor(this.damage * 0.8), // 80% damage on chain
            bounceCount: this.bounceCount - 1 // One less bounce
          });
          
          // Copy hit targets to prevent hitting same targets
          chainProjectile.hitTargets = new Set(this.hitTargets);
          
          // Emit event to spawn the chained projectile
          gameEvents.emit(GameEvents.ProjectileSpawned, chainProjectile);
        }
      }
    }
    
    // Destroy this projectile
    this.destroy();
  }
  
  destroy(): void {
    this.isDestroyed = true;
  }
}