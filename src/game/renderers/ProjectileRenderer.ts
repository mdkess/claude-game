import * as PIXI from 'pixi.js';
import { Projectile } from '../entities/Projectile';
import { COLORS } from '../core/constants';
import { EffectsManager } from '../effects/EffectsManager';
import { BaseRenderer } from './BaseRenderer';

/**
 * Handles rendering of Projectile entities using PIXI
 */
export class ProjectileRenderer extends BaseRenderer<Projectile> {
  private lastPositions: Map<Projectile, { x: number; y: number }> = new Map();
  private effectsManager?: EffectsManager;
  
  setEffectsManager(effectsManager: EffectsManager): void {
    this.effectsManager = effectsManager;
  }
  
  /**
   * Create or update the visual representation of a projectile
   */
  render(projectile: Projectile, effectsManager?: EffectsManager): void {
    // Update effects manager if provided
    if (effectsManager) {
      this.effectsManager = effectsManager;
    }
    
    // Use base class update
    this.update(projectile);
    
    // Update trail effect
    const lastPos = this.lastPositions.get(projectile);
    if (this.effectsManager && lastPos && 
        (Math.abs(lastPos.x - projectile.x) > 2 || Math.abs(lastPos.y - projectile.y) > 2)) {
      this.effectsManager.updateProjectileTrail(projectile.id || Date.now(), projectile.x, projectile.y);
    }
    
    this.lastPositions.set(projectile, { x: projectile.x, y: projectile.y });
  }
  
  /**
   * Implementation of abstract method from BaseRenderer
   */
  protected updateSprite(projectile: Projectile, sprite: PIXI.Container): void {
    sprite.x = projectile.x;
    sprite.y = projectile.y;
    sprite.visible = !projectile.isDestroyed;
    
    // Initialize last position if needed
    if (!this.lastPositions.has(projectile)) {
      this.lastPositions.set(projectile, { x: projectile.x, y: projectile.y });
    }
  }
  
  /**
   * Override remove to clean up trail effects
   */
  remove(projectile: Projectile, effectsManager?: EffectsManager): void {
    // Update effects manager if provided
    if (effectsManager) {
      this.effectsManager = effectsManager;
    }
    
    // Clean up trail effect
    if (this.effectsManager) {
      this.effectsManager.cleanupProjectile(projectile.id || Date.now());
    }
    
    // Clean up last position
    this.lastPositions.delete(projectile);
    
    // Call base class remove
    super.remove(projectile);
  }
  
  /**
   * Override clear to clean up last positions
   */
  clear(): void {
    this.lastPositions.clear();
    super.clear();
  }
  
  protected createSprite(): PIXI.Container {
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