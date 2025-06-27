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
  render(enemy: Enemy, deltaTime: number = 0.016): void {
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
    
    // Update animations
    this.updateAnimations(sprite, enemy, deltaTime);
    
    // Update health bar
    this.updateHealthBar(sprite, enemy);
    
    // Update flash effect
    // this.updateFlashEffect(sprite, enemy);
  }
  
  private updateAnimations(sprite: PIXI.Container, enemy: Enemy, deltaTime: number): void {
    interface AnimatedSprite extends PIXI.Container {
      outerGlow?: PIXI.Graphics;
      glowContainer?: PIXI.Container;
      mainContainer?: PIXI.Container;
      pulseTime?: number;
    }
    
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
    
    // Create layers for effects
    const glowContainer = new PIXI.Container();
    const mainContainer = new PIXI.Container();
    
    // Outer glow (pulsing)
    const outerGlow = new PIXI.Graphics();
    if (visual.shape === 'circle') {
      outerGlow.circle(0, 0, visual.size * 2);
    } else if (visual.shape === 'square') {
      outerGlow.rect(-visual.size * 2, -visual.size * 2, visual.size * 4, visual.size * 4);
    } else if (visual.shape === 'triangle') {
      drawPolygon(outerGlow, 0, 0, visual.size * 2, 3);
    } else if (visual.shape === 'hexagon') {
      drawPolygon(outerGlow, 0, 0, visual.size * 2, 6);
    }
    outerGlow.fill({ color: visual.color, alpha: 0.4 });
    glowContainer.addChild(outerGlow);
    
    // Inner glow
    const innerGlow = new PIXI.Graphics();
    if (visual.shape === 'circle') {
      innerGlow.circle(0, 0, visual.size * 1.5);
    } else if (visual.shape === 'square') {
      innerGlow.rect(-visual.size * 1.5, -visual.size * 1.5, visual.size * 3, visual.size * 3);
    } else if (visual.shape === 'triangle') {
      drawPolygon(innerGlow, 0, 0, visual.size * 1.5, 3);
    } else if (visual.shape === 'hexagon') {
      drawPolygon(innerGlow, 0, 0, visual.size * 1.5, 6);
    }
    innerGlow.fill({ color: visual.color, alpha: 0.5 });
    glowContainer.addChild(innerGlow);
    
    // Main shape with gradient effect
    const mainGraphics = new PIXI.Graphics();
    
    // Draw main shape with stroke
    mainGraphics.setStrokeStyle({ width: 2, color: visual.color });
    if (visual.shape === 'circle') {
      mainGraphics.circle(0, 0, visual.size);
    } else if (visual.shape === 'square') {
      mainGraphics.rect(-visual.size, -visual.size, visual.size * 2, visual.size * 2);
    } else if (visual.shape === 'triangle') {
      drawPolygon(mainGraphics, 0, 0, visual.size, 3);
    } else if (visual.shape === 'hexagon') {
      drawPolygon(mainGraphics, 0, 0, visual.size, 6);
    }
    mainGraphics.stroke();
    mainGraphics.fill({ color: visual.color, alpha: 1 });
    
    // Inner core (lighter)
    const coreGraphics = new PIXI.Graphics();
    const coreSize = visual.size * 0.6;
    if (visual.shape === 'circle') {
      coreGraphics.circle(0, 0, coreSize);
    } else if (visual.shape === 'square') {
      coreGraphics.rect(-coreSize, -coreSize, coreSize * 2, coreSize * 2);
    } else if (visual.shape === 'triangle') {
      drawPolygon(coreGraphics, 0, 0, coreSize, 3);
    } else if (visual.shape === 'hexagon') {
      drawPolygon(coreGraphics, 0, 0, coreSize, 6);
    }
    // Make core brighter by mixing with white
    const brightColor = this.blendColors(visual.color, 0xffffff, 0.5);
    coreGraphics.fill({ color: brightColor, alpha: 0.8 });
    
    mainContainer.addChild(mainGraphics);
    mainContainer.addChild(coreGraphics);
    
    // Store references for animation
    interface AnimatedSprite extends PIXI.Container {
      outerGlow?: PIXI.Graphics;
      glowContainer?: PIXI.Container;
      mainContainer?: PIXI.Container;
      pulseTime?: number;
    }
    
    const animatedSprite = sprite as AnimatedSprite;
    animatedSprite.outerGlow = outerGlow;
    animatedSprite.glowContainer = glowContainer;
    animatedSprite.mainContainer = mainContainer;
    animatedSprite.pulseTime = Math.random() * Math.PI * 2; // Random start phase
    
    sprite.addChild(glowContainer);
    sprite.addChild(mainContainer);
    
    // Create health bar
    const healthBar = this.createHealthBar();
    sprite.addChild(healthBar);
    
    return sprite;
  }
  
  private blendColors(color1: number, color2: number, factor: number): number {
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;
    
    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;
    
    const r = Math.round(r1 * (1 - factor) + r2 * factor);
    const g = Math.round(g1 * (1 - factor) + g2 * factor);
    const b = Math.round(b1 * (1 - factor) + b2 * factor);
    
    return (r << 16) | (g << 8) | b;
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
    // Find the health bar container (should be the last child)
    const healthBar = sprite.children[sprite.children.length - 1] as PIXI.Container;
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