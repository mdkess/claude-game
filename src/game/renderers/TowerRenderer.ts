import * as PIXI from 'pixi.js';
import { Tower } from '../entities/Tower';
import { COLORS, TOWER_RADIUS, TOWER_SIDES, TOWER_ANIMATION } from '../core/constants';
import { drawPolygon } from '../utils/drawing';

/**
 * Handles rendering of Tower entity using PIXI
 */
export class TowerRenderer {
  private container: PIXI.Container;
  private sprite: PIXI.Container;
  private towerGraphics: PIXI.Graphics;
  private rangeGraphics: PIXI.Graphics;
  private rangeRippleContainer: PIXI.Container;
  private pulseTime: number = 0;
  private damageFlashTime: number = 0;
  private lastHealth: number = 0;
  private rangeAnimationTime: number = 0;
  
  constructor(container: PIXI.Container) {
    this.container = container;
    
    // Create sprite container
    this.sprite = new PIXI.Container();
    
    // Create graphics
    this.rangeRippleContainer = new PIXI.Container();
    this.rangeGraphics = new PIXI.Graphics();
    this.towerGraphics = new PIXI.Graphics();
    
    // Add range indicator first so it renders behind the tower
    this.sprite.addChild(this.rangeRippleContainer);
    this.sprite.addChild(this.rangeGraphics);
    this.sprite.addChild(this.towerGraphics);
    
    // Add to main container
    this.container.addChild(this.sprite);
  }
  
  /**
   * Update the visual representation of the tower
   */
  render(tower: Tower, deltaTime: number, currentHealth: number): void {
    // Update position
    this.sprite.x = tower.x;
    this.sprite.y = tower.y;
    
    // Check if tower took damage
    if (this.lastHealth > 0 && currentHealth < this.lastHealth) {
      this.damageFlashTime = 0.3; // Flash for 0.3 seconds
    }
    this.lastHealth = currentHealth;
    
    // Update damage flash
    if (this.damageFlashTime > 0) {
      this.damageFlashTime -= deltaTime;
    }
    
    // Update pulse animation (affected by game speed)
    this.pulseTime += deltaTime * 2;
    const pulseScale = 1 + Math.sin(this.pulseTime) * 0.05;
    this.towerGraphics.scale.set(pulseScale);
    
    // Update range animation (affected by game speed)
    this.rangeAnimationTime += deltaTime;
    this.updateRangeAnimation(tower, deltaTime);
    
    // Redraw if stats changed (range indicator needs update)
    this.draw(tower);
  }
  
  /**
   * Clean up the tower sprite
   */
  destroy(): void {
    this.container.removeChild(this.sprite);
    this.sprite.destroy();
  }
  
  private draw(tower: Tower): void {
    // Draw range indicator with animated dashed line
    this.rangeGraphics.clear();
    
    // Create rotating dashed circle
    const dashLength = 20;
    const dashGap = 10;
    const circumference = 2 * Math.PI * tower.stats.range;
    const dashPlusGap = dashLength + dashGap;
    const totalDashes = Math.floor(circumference / dashPlusGap);
    const actualGapLength = dashGap / tower.stats.range; // Convert to radians
    const rotationOffset = this.rangeAnimationTime * 0.5; // Rotate slowly
    
    this.rangeGraphics.setStrokeStyle({ width: 2, color: COLORS.TOWER.MAIN, alpha: TOWER_ANIMATION.GLOW_ALPHA });
    
    // Draw complete circle with dashes
    const fullCircle = 2 * Math.PI;
    const adjustedDashLength = fullCircle / totalDashes - actualGapLength;
    
    for (let i = 0; i < totalDashes; i++) {
      const baseAngle = (i * fullCircle / totalDashes);
      const startAngle = baseAngle + rotationOffset;
      const endAngle = startAngle + adjustedDashLength;
      
      this.rangeGraphics.moveTo(
        Math.cos(startAngle) * tower.stats.range,
        Math.sin(startAngle) * tower.stats.range
      );
      
      this.rangeGraphics.arc(0, 0, tower.stats.range, startAngle, endAngle);
    }
    
    this.rangeGraphics.stroke();
    
    // Add subtle fill
    this.rangeGraphics.circle(0, 0, tower.stats.range);
    this.rangeGraphics.fill({ color: COLORS.TOWER.MAIN, alpha: 0.02 });
    
    // Draw tower
    this.towerGraphics.clear();
    
    // Draw glow effect
    drawPolygon(this.towerGraphics, 0, 0, TOWER_RADIUS * TOWER_ANIMATION.PULSE_MAX, TOWER_SIDES);
    this.towerGraphics.fill({ color: COLORS.TOWER.GLOW, alpha: TOWER_ANIMATION.GLOW_ALPHA });
    
    // Draw main tower (flash red when damaged)
    drawPolygon(this.towerGraphics, 0, 0, TOWER_RADIUS, TOWER_SIDES);
    const flashIntensity = this.damageFlashTime > 0 ? Math.sin(this.damageFlashTime * 20) * 0.5 + 0.5 : 0;
    const towerColor = flashIntensity > 0 
      ? this.blendColors(COLORS.TOWER.MAIN, 0xff0000, flashIntensity)
      : COLORS.TOWER.MAIN;
    this.towerGraphics.fill({ color: towerColor, alpha: 1 });
    
    // Draw inner detail
    drawPolygon(this.towerGraphics, 0, 0, TOWER_RADIUS * TOWER_ANIMATION.PULSE_MIN, TOWER_SIDES);
    this.towerGraphics.fill({ color: COLORS.TOWER.INNER, alpha: 1 });
    
    // Draw center core
    this.towerGraphics.circle(0, 0, TOWER_RADIUS * 0.3);
    this.towerGraphics.fill({ color: COLORS.TOWER.CORE, alpha: 1 });
  }

  private updateRangeAnimation(tower: Tower, deltaTime: number): void {
    // Create expanding ripples periodically
    if (this.rangeAnimationTime % 3 < deltaTime) { // Every 3 seconds
      const ripple = new PIXI.Graphics();
      ripple.setStrokeStyle({ width: 2, color: COLORS.TOWER.MAIN, alpha: 0.5 });
      ripple.circle(0, 0, tower.stats.range);
      ripple.stroke();
      
      // Store animation data
      interface AnimatedRipple extends PIXI.Graphics {
        startTime: number;
        range: number;
      }
      const animatedRipple = ripple as AnimatedRipple;
      animatedRipple.startTime = this.rangeAnimationTime;
      animatedRipple.range = tower.stats.range;
      
      this.rangeRippleContainer.addChild(ripple);
    }
    
    // Update existing ripples
    for (let i = this.rangeRippleContainer.children.length - 1; i >= 0; i--) {
      const ripple = this.rangeRippleContainer.children[i] as PIXI.Graphics & { startTime: number; range: number };
      const age = this.rangeAnimationTime - ripple.startTime;
      
      if (age > 2) {
        // Remove old ripples
        this.rangeRippleContainer.removeChild(ripple);
        ripple.destroy();
      } else {
        // Animate ripple
        const progress = age / 2;
        const scale = 1 + progress * 0.2;
        ripple.scale.set(scale);
        ripple.alpha = 0.5 * (1 - progress);
      }
    }
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
}