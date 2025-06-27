import * as PIXI from 'pixi.js';
import { Enemy } from '../entities/Enemy';
import { COLORS, ENEMY_HEALTH_BAR } from '../core/constants';
import { drawPolygon } from '../utils/drawing';
import { enemyDefinitions } from '../enemies/definitions/EnemyDefinitions';

/**
 * Handles rendering of Enemy entities using PIXI
 */
export class EnemyRenderer {
  private container: PIXI.Container;
  private sprites: Map<Enemy, PIXI.Container> = new Map();
  private flashStates: Map<Enemy, { endTime: number }> = new Map();
  
  constructor(container: PIXI.Container) {
    this.container = container;
  }
  
  /**
   * Create or update the visual representation of an enemy
   */
  render(enemy: Enemy): void {
    let sprite = this.sprites.get(enemy);
    
    // Create sprite if it doesn't exist
    if (!sprite) {
      sprite = this.createSprite(enemy);
      this.sprites.set(enemy, sprite);
      this.container.addChild(sprite);
    }
    
    // Update position
    sprite.x = enemy.x;
    sprite.y = enemy.y;
    
    // Update visibility
    sprite.visible = enemy.isActive && !enemy.isDead;
    
    // Update health bar
    this.updateHealthBar(sprite, enemy);
    
    // Update flash effect
    this.updateFlashEffect(sprite, enemy);
  }
  
  /**
   * Remove the visual representation of an enemy
   */
  remove(enemy: Enemy): void {
    const sprite = this.sprites.get(enemy);
    if (sprite) {
      this.container.removeChild(sprite);
      sprite.destroy();
      this.sprites.delete(enemy);
    }
  }
  
  /**
   * Clear all enemy sprites
   */
  clear(): void {
    for (const [_, sprite] of this.sprites) {
      this.container.removeChild(sprite);
      sprite.destroy();
    }
    this.sprites.clear();
    this.flashStates.clear();
  }
  
  /**
   * Clean up sprites for enemies that are no longer in the active list
   */
  cleanupInactive(activeEnemies: Enemy[]): void {
    const activeSet = new Set(activeEnemies);
    
    // Find enemies that have sprites but are not in the active list
    const toRemove: Enemy[] = [];
    for (const [enemy, _] of this.sprites) {
      if (!activeSet.has(enemy)) {
        toRemove.push(enemy);
      }
    }
    
    // Remove their sprites
    toRemove.forEach(enemy => this.remove(enemy));
  }
  
  private createSprite(enemy: Enemy): PIXI.Container {
    const sprite = new PIXI.Container();
    
    // Get visual config from enemy definitions
    const definition = enemyDefinitions.get(enemy.type);
    const visual = definition?.visual || {
      color: 0xff0000,
      size: 15,
      shape: 'circle' as const
    };
    
    // Create enemy graphics
    const graphics = new PIXI.Graphics();
    
    // Draw glow
    if (visual.shape === 'circle') {
      graphics.circle(0, 0, visual.size * 1.5);
    } else if (visual.shape === 'square') {
      graphics.rect(-visual.size * 1.5, -visual.size * 1.5, visual.size * 3, visual.size * 3);
    } else if (visual.shape === 'triangle') {
      drawPolygon(graphics, 0, 0, visual.size * 1.5, 3);
    } else if (visual.shape === 'hexagon') {
      drawPolygon(graphics, 0, 0, visual.size * 1.5, 6);
    }
    graphics.fill({ color: visual.color, alpha: 0.3 });
    
    // Draw main shape
    if (visual.shape === 'circle') {
      graphics.circle(0, 0, visual.size);
    } else if (visual.shape === 'square') {
      graphics.rect(-visual.size, -visual.size, visual.size * 2, visual.size * 2);
    } else if (visual.shape === 'triangle') {
      drawPolygon(graphics, 0, 0, visual.size, 3);
    } else if (visual.shape === 'hexagon') {
      drawPolygon(graphics, 0, 0, visual.size, 6);
    }
    graphics.fill({ color: visual.color, alpha: 1 });
    
    sprite.addChild(graphics);
    
    // Create health bar
    const healthBar = this.createHealthBar();
    sprite.addChild(healthBar);
    
    return sprite;
  }
  
  private createHealthBar(): PIXI.Container {
    const healthBarContainer = new PIXI.Container();
    healthBarContainer.y = ENEMY_HEALTH_BAR.Y_OFFSET;
    
    // Background
    const bgGraphics = new PIXI.Graphics();
    bgGraphics.rect(
      -ENEMY_HEALTH_BAR.WIDTH / 2,
      -ENEMY_HEALTH_BAR.HEIGHT / 2,
      ENEMY_HEALTH_BAR.WIDTH,
      ENEMY_HEALTH_BAR.HEIGHT
    );
    bgGraphics.fill({ color: 0x000000, alpha: 0.5 });
    healthBarContainer.addChild(bgGraphics);
    
    // Foreground (will be updated)
    const fgGraphics = new PIXI.Graphics();
    healthBarContainer.addChild(fgGraphics);
    
    return healthBarContainer;
  }
  
  private updateHealthBar(sprite: PIXI.Container, enemy: Enemy): void {
    const healthBar = sprite.children[1] as PIXI.Container;
    if (!healthBar || healthBar.children.length < 2) return;
    
    const fgGraphics = healthBar.children[1] as PIXI.Graphics;
    fgGraphics.clear();
    
    const healthPercent = enemy.getHealthPercentage();
    if (healthPercent < 1) {
      // Show health bar only when damaged
      healthBar.visible = true;
      
      const width = ENEMY_HEALTH_BAR.WIDTH * healthPercent;
      const color = healthPercent > 0.5 ? COLORS.HEALTH_HIGH : 
                   healthPercent > 0.25 ? COLORS.HEALTH_MEDIUM : 
                   COLORS.HEALTH_LOW;
      
      fgGraphics.rect(
        -ENEMY_HEALTH_BAR.WIDTH / 2,
        -ENEMY_HEALTH_BAR.HEIGHT / 2,
        width,
        ENEMY_HEALTH_BAR.HEIGHT
      );
      fgGraphics.fill({ color, alpha: 1 });
    } else {
      // Hide health bar when at full health
      healthBar.visible = false;
    }
  }
  
  private updateFlashEffect(sprite: PIXI.Container, enemy: Enemy): void {
    const graphics = sprite.children[0] as PIXI.Graphics;
    if (!graphics) return;
    
    // Check if enemy was recently damaged
    const flashState = this.flashStates.get(enemy);
    const currentTime = Date.now();
    
    // If enemy was just damaged, start flash
    if (enemy.lastDamageTime > 0) {
      const timeSinceDamage = (currentTime - enemy.lastDamageTime) / 1000;
      if (timeSinceDamage < 0.167) { // Flash for ~10 frames at 60fps
        if (!flashState || flashState.endTime < currentTime) {
          this.flashStates.set(enemy, { endTime: currentTime + 167 }); // 167ms
        }
      }
    }
    
    // Apply flash effect if active
    if (flashState && currentTime < flashState.endTime) {
      graphics.alpha = 0.5;
    } else {
      graphics.alpha = 1;
      // Clean up expired flash state
      if (flashState && currentTime >= flashState.endTime) {
        this.flashStates.delete(enemy);
      }
    }
  }
}