import * as PIXI from 'pixi.js';
import { Projectile } from '../entities/Projectile';
import { COLORS } from '../core/constants';
import { EffectsManager } from '../effects/EffectsManager';

/**
 * Handles rendering of Projectile entities using PIXI
 */
export class ProjectileRenderer {
  private container: PIXI.Container;
  private sprites: Map<Projectile, PIXI.Container> = new Map();
  private lastPositions: Map<Projectile, { x: number; y: number }> = new Map();
  
  constructor(container: PIXI.Container) {
    this.container = container;
  }
  
  /**
   * Create or update the visual representation of a projectile
   */
  render(projectile: Projectile, effectsManager?: EffectsManager): void {
    let sprite = this.sprites.get(projectile);
    
    // Create sprite if it doesn't exist
    if (!sprite) {
      sprite = this.createSprite();
      this.sprites.set(projectile, sprite);
      this.container.addChild(sprite);
      this.lastPositions.set(projectile, { x: projectile.x, y: projectile.y });
    }
    
    // Create trail effect if moved
    const lastPos = this.lastPositions.get(projectile);
    if (effectsManager && lastPos && (Math.abs(lastPos.x - projectile.x) > 2 || Math.abs(lastPos.y - projectile.y) > 2)) {
      effectsManager.updateProjectileTrail(projectile.id || Date.now(), projectile.x, projectile.y);
    }
    
    // Update position
    sprite.x = projectile.x;
    sprite.y = projectile.y;
    this.lastPositions.set(projectile, { x: projectile.x, y: projectile.y });
    
    // Hide if destroyed
    sprite.visible = !projectile.isDestroyed;
  }
  
  /**
   * Remove the visual representation of a projectile
   */
  remove(projectile: Projectile, effectsManager?: EffectsManager): void {
    const sprite = this.sprites.get(projectile);
    if (sprite) {
      this.container.removeChild(sprite);
      sprite.destroy();
      this.sprites.delete(projectile);
      this.lastPositions.delete(projectile);
      
      // Clean up trail effect
      if (effectsManager) {
        effectsManager.cleanupProjectile(projectile.id || Date.now());
      }
    }
  }
  
  /**
   * Clean up sprites for projectiles that are no longer active
   */
  cleanupInactive(activeProjectiles: Projectile[]): void {
    const activeSet = new Set(activeProjectiles);
    const toRemove: Projectile[] = [];
    
    for (const [projectile, _] of this.sprites) {
      if (!activeSet.has(projectile)) {
        toRemove.push(projectile);
      }
    }
    
    toRemove.forEach(projectile => this.remove(projectile));
  }
  
  /**
   * Clear all projectile sprites
   */
  clear(): void {
    for (const [_, sprite] of this.sprites) {
      this.container.removeChild(sprite);
      sprite.destroy();
    }
    this.sprites.clear();
  }
  
  private createSprite(): PIXI.Container {
    const sprite = new PIXI.Container();
    const graphics = new PIXI.Graphics();
    
    // Draw projectile with trail effect
    graphics.circle(0, 0, 6);
    graphics.fill({ color: COLORS.PROJECTILE.TRAIL, alpha: 0.5 });
    
    graphics.circle(0, 0, 4);
    graphics.fill({ color: COLORS.PROJECTILE.MAIN, alpha: 1 });
    
    graphics.circle(0, 0, 2);
    graphics.fill({ color: COLORS.PROJECTILE.CORE, alpha: 1 });
    
    sprite.addChild(graphics);
    return sprite;
  }
}