import { EnemyType } from '../types';
import { MovementStrategy } from '../enemies/strategies/MovementStrategies';
import { DeathStrategy } from '../enemies/strategies/DeathStrategy';

export interface EnemyConfig {
  x: number;
  y: number;
  type: EnemyType;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  reward: number;
  movementStrategy: MovementStrategy;
  deathStrategy: DeathStrategy;
}

/**
 * Pure enemy entity with game logic only, no rendering
 */
export class Enemy {
  // Position and movement
  public x: number = 0;
  public y: number = 0;
  public speed: number = 0;
  
  // Stats
  public type: EnemyType = EnemyType.Basic;
  public health: number = 0;
  public maxHealth: number = 0;
  public damage: number = 0;
  public reward: number = 0;
  
  // State
  public isActive: boolean = false;
  public isDead: boolean = false;
  public lastDamageTime: number = 0;
  
  // Strategies
  private movementStrategy!: MovementStrategy;
  private deathStrategy!: DeathStrategy;
  
  // Size for collision detection
  private radius: number = 15;
  
  init(config: EnemyConfig): void {
    this.x = config.x;
    this.y = config.y;
    this.type = config.type;
    this.health = config.health;
    this.maxHealth = config.maxHealth;
    this.speed = config.speed;
    this.damage = config.damage;
    this.reward = config.reward;
    this.movementStrategy = config.movementStrategy;
    this.deathStrategy = config.deathStrategy;
    
    // Set radius based on enemy type
    switch (this.type) {
      case EnemyType.Swarm:
        this.radius = 8;
        break;
      case EnemyType.Tank:
        this.radius = 20;
        break;
      case EnemyType.Splitter:
        this.radius = 12;
        break;
      default:
        this.radius = 15;
    }
    
    this.isActive = true;
    this.isDead = false;
    this.lastDamageTime = 0;
  }
  
  reset(): void {
    this.x = 0;
    this.y = 0;
    this.speed = 0;
    this.health = 0;
    this.maxHealth = 0;
    this.damage = 0;
    this.reward = 0;
    this.isActive = false;
    this.isDead = false;
    this.lastDamageTime = 0;
  }
  
  update(deltaTime: number, target: { x: number; y: number }): void {
    if (!this.isActive || this.isDead) return;
    
    // Update movement
    const movement = this.movementStrategy.update(deltaTime, { x: this.x, y: this.y }, target);
    this.x += movement.dx;
    this.y += movement.dy;
  }
  
  takeDamage(damage: number): void {
    if (this.isDead || !this.isActive) return;
    
    this.health -= damage;
    this.lastDamageTime = Date.now();
    
    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
      
      // Handle death behavior - DeathStrategy now emits the event
      this.deathStrategy.onDeath(this);
    }
  }
  
  getRadius(): number {
    return this.radius;
  }
  
  checkTowerCollision(tower: { x: number; y: number; getRadius(): number }): boolean {
    const dx = this.x - tower.x;
    const dy = this.y - tower.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.radius + tower.getRadius();
  }
  
  getHealthPercentage(): number {
    return this.maxHealth > 0 ? this.health / this.maxHealth : 0;
  }
}