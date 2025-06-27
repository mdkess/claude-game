import { normalizeVector } from '../utils/math';
import { gameEvents, GameEvents } from '../core/EventEmitter';

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
  bounceChance?: number;
}

/**
 * Pure projectile entity with game logic only, no rendering
 */
export class Projectile {
  public x: number = 0;
  public y: number = 0;
  public damage: number = 0;
  public isDestroyed: boolean = false;
  public id: number = Date.now() + Math.random();
  
  private velocityX: number = 0;
  private velocityY: number = 0;
  private speed: number = 0;
  private maxDistance: number = 0;
  private distanceTraveled: number = 0;
  private bounceChance: number = 0;
  private hitTargets: Set<ProjectileTarget> = new Set();
  
  init(config: ProjectileConfig): void {
    this.x = config.x;
    this.y = config.y;
    this.speed = config.speed;
    this.maxDistance = config.range;
    this.damage = config.damage;
    this.bounceChance = config.bounceChance || 0;
    this.id = Date.now() + Math.random(); // Generate new ID on init
    
    // Calculate initial velocity
    const direction = normalizeVector(
      config.targetX - config.x,
      config.targetY - config.y
    );
    
    this.velocityX = direction.x * this.speed;
    this.velocityY = direction.y * this.speed;
    
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
    const GAME_SIZE = 800; // From constants
    const MARGIN = 100;
    if (this.x < -MARGIN || this.x > GAME_SIZE + MARGIN || 
        this.y < -MARGIN || this.y > GAME_SIZE + MARGIN) {
      this.destroy();
    }
  }
  
  checkCollision(target: ProjectileTarget): boolean {
    if (target.isDead || !target.isActive || this.hitTargets.has(target)) return false;
    
    const dx = this.x - target.x;
    const dy = this.y - target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < target.getRadius() + 5; // 5 is projectile collision radius
  }
  
  onHit(target: ProjectileTarget, allTargets: ProjectileTarget[]): void {
    // Mark this target as hit to prevent multiple hits
    this.hitTargets.add(target);
    
    // Check for bounce
    if (this.bounceChance > 0 && Math.random() < this.bounceChance) {
      // Find a nearby target to bounce to
      const nearbyTargets = allTargets.filter(t => 
        t !== target && 
        !t.isDead && 
        t.isActive && 
        !this.hitTargets.has(t)
      );
      
      if (nearbyTargets.length > 0) {
        // Find closest target within bounce range
        let closestTarget: ProjectileTarget | null = null;
        let closestDistance = 150; // Max bounce range
        
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
          // Create a new bounced projectile
          const bounceProjectile = new Projectile();
          bounceProjectile.init({
            x: this.x,
            y: this.y,
            targetX: closestTarget.x,
            targetY: closestTarget.y,
            speed: this.speed,
            range: 150, // Bounce range
            damage: this.damage,
            bounceChance: 0 // No further bounces
          });
          
          // Copy hit targets to prevent hitting same targets
          bounceProjectile.hitTargets = new Set(this.hitTargets);
          
          // Emit event to spawn the bounced projectile
          gameEvents.emit(GameEvents.ProjectileSpawned, bounceProjectile);
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