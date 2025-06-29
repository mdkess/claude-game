import * as PIXI from 'pixi.js';
import { Enemy } from '../entities/Enemy';
import { COLORS, ENEMY_HEALTH_BAR } from '../core/constants';
import { drawPolygon } from '../utils/drawing';
import { enemyDefinitions } from '../enemies/definitions/EnemyDefinitions';
import { BaseRenderer } from './BaseRenderer';
import { createLayeredShape, ShapeType } from '../utils/shapeRenderer';

interface AnimatedSprite extends PIXI.Container {
  outerGlow?: PIXI.Graphics;
  glowContainer?: PIXI.Container;
  mainContainer?: PIXI.Container;
  pulseTime?: number;
  healthBar?: PIXI.Graphics;
  healthBarBg?: PIXI.Graphics;
}

/**
 * Handles rendering of Enemy entities using PIXI
 */
export class EnemyRenderer extends BaseRenderer<Enemy, AnimatedSprite> {
  private flashStates: Map<Enemy, { endTime: number }> = new Map();
  
  /**
   * Create or update the visual representation of an enemy
   */
  render(enemy: Enemy, deltaTime: number = 0.016): void {
    // Use base class update method
    this.update(enemy);
    
    // Get sprite for additional updates
    const sprite = this.sprites.get(enemy);
    if (sprite) {
      // Update animations
      this.updateAnimations(sprite, enemy, deltaTime);
      
      // Update flash effect
      // this.updateFlashEffect(sprite, enemy);
    }
  }
  
  /**
   * Implementation of abstract method from BaseRenderer
   */
  protected updateSprite(enemy: Enemy, sprite: AnimatedSprite): void {
    // Update position
    sprite.x = enemy.x;
    sprite.y = enemy.y;
    
    // Update visibility
    sprite.visible = enemy.isActive && !enemy.isDead;
    
    // Update health bar
    this.updateHealthBar(sprite, enemy);
  }
  
  private updateAnimations(sprite: AnimatedSprite, enemy: Enemy, deltaTime: number): void {
    
    const animatedSprite = sprite as AnimatedSprite;
    if (!animatedSprite.outerGlow || !animatedSprite.mainContainer || animatedSprite.pulseTime === undefined) return;
    
    // Update pulse time (affected by game speed)
    animatedSprite.pulseTime += deltaTime * 3;
    
    // Check if recently hit for enhanced pulse
    const currentTime = Date.now();
    const timeSinceHit = enemy.lastDamageTime > 0 ? (currentTime - enemy.lastDamageTime) / 1000 : 999;
    const hitBoost = timeSinceHit < 0.3 ? (0.3 - timeSinceHit) * 2 : 0;
    
    // Pulse the outer glow (enhanced when hit)
    const pulseScale = 1 + Math.sin(animatedSprite.pulseTime) * 0.2 + hitBoost * 0.3;
    animatedSprite.outerGlow.scale.set(pulseScale);
    
    // Rotate different shapes at different speeds (affected by game speed)
    const definition = enemyDefinitions.get(enemy.type);
    if (definition?.visual.shape === 'hexagon') {
      animatedSprite.mainContainer.rotation += deltaTime * 0.6;
    } else if (definition?.visual.shape === 'square') {
      animatedSprite.mainContainer.rotation += deltaTime * 1.2;
    } else if (definition?.visual.shape === 'triangle') {
      animatedSprite.mainContainer.rotation -= deltaTime * 0.9;
    }
    
    // Scale based on health
    const healthPercent = enemy.getHealthPercentage();
    const healthScale = 0.9 + healthPercent * 0.1;
    animatedSprite.mainContainer.scale.set(healthScale);
  }
  
  /**
   * Override remove to also clean up flash states
   */
  remove(enemy: Enemy): void {
    super.remove(enemy);
    this.flashStates.delete(enemy);
  }
  
  /**
   * Override clear to also clean up flash states
   */
  clear(): void {
    super.clear();
    this.flashStates.clear();
  }
  
  protected createSprite(enemy: Enemy): AnimatedSprite {
    const sprite = new PIXI.Container() as AnimatedSprite;
    
    // Get visual config from enemy definitions
    const definition = enemyDefinitions.get(enemy.type);
    const visual = definition?.visual || {
      color: 0xff0000,
      size: 15,
      shape: 'circle' as const
    };
    
    // Create layered shape using the helper
    const layeredShape = createLayeredShape(
      visual.shape as ShapeType,
      visual.size,
      visual.color,
      {
        glowScale: 2,
        innerGlowScale: 1.5,
        coreScale: 0.6,
        strokeWidth: 2,
        glowAlpha: 0.4,
        innerGlowAlpha: 0.5,
        coreAlpha: 0.8,
        coreColorBlend: 0.5
      }
    );
    
    // Store references for animation
    sprite.outerGlow = layeredShape.outerGlow;
    sprite.glowContainer = layeredShape.container.children[0] as PIXI.Container;
    sprite.mainContainer = layeredShape.container.children[1] as PIXI.Container;
    sprite.pulseTime = Math.random() * Math.PI * 2; // Random start phase
    
    sprite.addChild(layeredShape.container);
    
    // Create health bar
    const healthBarContainer = this.createHealthBar();
    sprite.addChild(healthBarContainer);
    
    // Store health bar references
    sprite.healthBarBg = healthBarContainer.children[0] as PIXI.Graphics;
    sprite.healthBar = healthBarContainer.children[1] as PIXI.Graphics;
    
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
  
  private updateHealthBar(sprite: AnimatedSprite, enemy: Enemy): void {
    if (!sprite.healthBar || !sprite.healthBarBg) return;
    
    const healthBar = sprite.healthBar;
    const healthBarContainer = healthBar.parent;
    
    healthBar.clear();
    
    const healthPercent = enemy.getHealthPercentage();
    if (healthPercent < 1) {
      // Show health bar only when damaged
      healthBarContainer.visible = true;
      
      const width = ENEMY_HEALTH_BAR.WIDTH * healthPercent;
      const color = healthPercent > 0.5 ? COLORS.HEALTH_HIGH : 
                   healthPercent > 0.25 ? COLORS.HEALTH_MEDIUM : 
                   COLORS.HEALTH_LOW;
      
      healthBar.rect(
        -ENEMY_HEALTH_BAR.WIDTH / 2,
        -ENEMY_HEALTH_BAR.HEIGHT / 2,
        width,
        ENEMY_HEALTH_BAR.HEIGHT
      );
      healthBar.fill({ color, alpha: 1 });
    } else {
      // Hide health bar when at full health
      healthBarContainer.visible = false;
    }
  }
  
  private updateFlashEffect(sprite: PIXI.Container, enemy: Enemy): void {
    // Interface for flash overlay
    interface FlashOverlay extends PIXI.Graphics {
      isFlashOverlay: boolean;
    }
    
    // Find or create flash overlay
    let flashOverlay = sprite.children.find(child => (child as FlashOverlay).isFlashOverlay) as FlashOverlay | undefined;
    
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
      if (!flashOverlay) {
        // Create white flash overlay
        flashOverlay = new PIXI.Graphics() as FlashOverlay;
        flashOverlay.isFlashOverlay = true;
        
        // Get enemy visual info
        const definition = enemyDefinitions.get(enemy.type);
        const visual = definition?.visual || { size: 15, shape: 'circle' as const };
        
        // Draw white outline and inner ring for impact effect
        flashOverlay.setStrokeStyle({ width: 3, color: 0xffffff });
        
        // Outer impact ring
        if (visual.shape === 'circle') {
          flashOverlay.circle(0, 0, visual.size + 5);
        } else if (visual.shape === 'square') {
          const s = visual.size + 5;
          flashOverlay.rect(-s, -s, s * 2, s * 2);
        } else if (visual.shape === 'triangle') {
          drawPolygon(flashOverlay, 0, 0, visual.size + 5, 3);
        } else if (visual.shape === 'hexagon') {
          drawPolygon(flashOverlay, 0, 0, visual.size + 5, 6);
        }
        flashOverlay.stroke();
        
        // Inner bright core flash (smaller)
        const coreSize = visual.size * 0.3;
        flashOverlay.circle(0, 0, coreSize);
        flashOverlay.fill({ color: 0xffffff, alpha: 0.8 });
        
        // Add some energy lines radiating outward
        const numLines = 6;
        for (let i = 0; i < numLines; i++) {
          const angle = (i / numLines) * Math.PI * 2;
          const innerRadius = visual.size * 0.7;
          const outerRadius = visual.size * 1.3;
          
          flashOverlay.setStrokeStyle({ width: 1, color: 0xffffff, alpha: 0.6 });
          flashOverlay.moveTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius);
          flashOverlay.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
          flashOverlay.stroke();
        }
        
        sprite.addChild(flashOverlay);
      }
      
      // Fade out the flash
      const progress = (flashState.endTime - currentTime) / 167;
      flashOverlay.alpha = progress;
      
      // Rotate the energy lines for dynamic effect
      flashOverlay.rotation = (1 - progress) * Math.PI * 0.5;
      
      // Scale up the impact ring as it fades
      const scaleProgress = 1 + (1 - progress) * 0.3;
      flashOverlay.scale.set(scaleProgress);
    } else {
      // Remove flash overlay when done
      if (flashOverlay) {
        sprite.removeChild(flashOverlay);
        flashOverlay.destroy();
      }
      // Clean up expired flash state
      if (flashState && currentTime >= flashState.endTime) {
        this.flashStates.delete(enemy);
      }
    }
  }
}