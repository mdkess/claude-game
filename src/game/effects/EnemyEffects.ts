import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export class EnemyEffects {
  private container: PIXI.Container;
  
  constructor(container: PIXI.Container) {
    this.container = container;
  }
  
  /**
   * Create damage number popup
   */
  createDamageNumber(x: number, y: number, damage: number, isCritical: boolean = false) {
    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: isCritical ? 24 : 18,
      fontWeight: 'bold',
      fill: isCritical ? '#ffff00' : '#ffffff',
      stroke: { color: '#000000', width: 3 },
      dropShadow: {
        blur: 4,
        distance: 2,
        color: '#000000'
      }
    });
    
    const text = new PIXI.Text(damage.toString(), style);
    text.anchor.set(0.5, 0.5);
    text.position.set(x + (Math.random() - 0.5) * 20, y);
    this.container.addChild(text);
    
    // Animate
    gsap.to(text, {
      y: y - 40,
      alpha: 0,
      scaleX: isCritical ? 1.5 : 1.2,
      scaleY: isCritical ? 1.5 : 1.2,
      duration: 0.8,
      ease: "power2.out",
      onComplete: () => {
        this.container.removeChild(text);
        text.destroy();
      }
    });
    
    if (isCritical) {
      gsap.to(text, {
        rotation: Math.PI * 2,
        duration: 0.8,
        ease: "power2.out"
      });
    }
  }
  
  /**
   * Create hit effect on enemy
   */
  createHitEffect(x: number, y: number, color: number = 0xff0000) {
    // Blood splatter particles
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const particle = new PIXI.Graphics();
      particle.beginFill(color, 0.8);
      particle.drawCircle(0, 0, 2 + Math.random() * 3);
      particle.endFill();
      particle.position.set(x, y);
      this.container.addChild(particle);
      
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = 2 + Math.random() * 3;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      gsap.to(particle, {
        x: x + vx * 20,
        y: y + vy * 20 + 10, // Gravity effect
        alpha: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => {
          this.container.removeChild(particle);
          particle.destroy();
        }
      });
    }
    
    // Impact flash
    const flash = new PIXI.Graphics();
    flash.beginFill(0xffffff, 0.5);
    flash.drawCircle(0, 0, 15);
    flash.endFill();
    flash.position.set(x, y);
    flash.blendMode = 'add';
    this.container.addChild(flash);
    
    gsap.to(flash, {
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 0.2,
      ease: "power2.out",
      onComplete: () => {
        this.container.removeChild(flash);
        flash.destroy();
      }
    });
  }
  
  /**
   * Create death effect for enemy
   */
  createDeathEffect(x: number, y: number, enemyColor: number, size: number = 1) {
    // Main explosion
    const explosion = new PIXI.Graphics();
    explosion.beginFill(enemyColor, 0.8);
    explosion.drawCircle(0, 0, 20 * size);
    explosion.endFill();
    explosion.position.set(x, y);
    explosion.blendMode = 'add';
    this.container.addChild(explosion);
    
    gsap.to(explosion, {
      alpha: 0,
      scaleX: 3,
      scaleY: 3,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => {
        this.container.removeChild(explosion);
        explosion.destroy();
      }
    });
    
    // Gibs/chunks
    const chunkCount = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < chunkCount; i++) {
      const chunk = new PIXI.Graphics();
      chunk.beginFill(enemyColor);
      const chunkSize = 3 + Math.random() * 5 * size;
      chunk.drawRect(-chunkSize/2, -chunkSize/2, chunkSize, chunkSize);
      chunk.endFill();
      chunk.position.set(x, y);
      chunk.rotation = Math.random() * Math.PI * 2;
      this.container.addChild(chunk);
      
      const angle = (Math.PI * 2 * i) / chunkCount + Math.random() * 0.5;
      const speed = 3 + Math.random() * 5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 2; // Initial upward velocity
      
      gsap.to(chunk, {
        x: x + vx * 40,
        y: y + vy * 40 + 80, // Gravity
        rotation: chunk.rotation + Math.random() * Math.PI * 4,
        alpha: 0,
        duration: 1,
        ease: "power2.out",
        onComplete: () => {
          this.container.removeChild(chunk);
          chunk.destroy();
        }
      });
    }
    
    // Energy burst for special enemies
    if (size > 1) {
      const burst = new PIXI.Graphics();
      burst.lineStyle(3, 0xffffff, 0.8);
      burst.drawCircle(0, 0, 10);
      burst.position.set(x, y);
      this.container.addChild(burst);
      
      gsap.to(burst, {
        alpha: 0,
        scaleX: 5 * size,
        scaleY: 5 * size,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          this.container.removeChild(burst);
          burst.destroy();
        }
      });
    }
  }
  
  /**
   * Create spawn effect for enemy
   */
  createSpawnEffect(x: number, y: number, color: number) {
    // Portal effect
    const portal = new PIXI.Graphics();
    portal.lineStyle(2, color, 0.8);
    portal.drawCircle(0, 0, 5);
    portal.position.set(x, y);
    this.container.addChild(portal);
    
    gsap.fromTo(portal, 
      {
        alpha: 0,
        scaleX: 0,
        scaleY: 0
      },
      {
        alpha: 1,
        scaleX: 4,
        scaleY: 4,
        duration: 0.3,
        ease: "back.out(1.7)"
      }
    );
    
    gsap.to(portal, {
      alpha: 0,
      duration: 0.2,
      delay: 0.3,
      onComplete: () => {
        this.container.removeChild(portal);
        portal.destroy();
      }
    });
    
    // Energy particles
    for (let i = 0; i < 8; i++) {
      const particle = new PIXI.Graphics();
      particle.beginFill(color, 0.6);
      particle.drawCircle(0, 0, 2);
      particle.endFill();
      
      const angle = (Math.PI * 2 * i) / 8;
      const startRadius = 0;
      const endRadius = 30;
      
      particle.position.set(
        x + Math.cos(angle) * startRadius,
        y + Math.sin(angle) * startRadius
      );
      this.container.addChild(particle);
      
      gsap.fromTo(particle,
        {
          x: x + Math.cos(angle) * endRadius,
          y: y + Math.sin(angle) * endRadius,
          alpha: 0
        },
        {
          x: x,
          y: y,
          alpha: 1,
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => {
            this.container.removeChild(particle);
            particle.destroy();
          }
        }
      );
    }
  }
  
  /**
   * Create shield hit effect for armored enemies
   */
  createShieldHitEffect(x: number, y: number) {
    // Shield ripple
    const ripple = new PIXI.Graphics();
    ripple.lineStyle(3, 0x0088ff, 0.8);
    ripple.drawCircle(0, 0, 20);
    ripple.position.set(x, y);
    ripple.blendMode = 'add';
    this.container.addChild(ripple);
    
    gsap.to(ripple, {
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        this.container.removeChild(ripple);
        ripple.destroy();
      }
    });
    
    // Hexagonal pattern
    const hex = new PIXI.Graphics();
    hex.lineStyle(2, 0x0088ff, 0.5);
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      const x1 = Math.cos(angle) * 15;
      const y1 = Math.sin(angle) * 15;
      const nextAngle = (Math.PI * 2 * (i + 1)) / 6;
      const x2 = Math.cos(nextAngle) * 15;
      const y2 = Math.sin(nextAngle) * 15;
      
      if (i === 0) {
        hex.moveTo(x1, y1);
      }
      hex.lineTo(x2, y2);
    }
    hex.closePath();
    hex.position.set(x, y);
    this.container.addChild(hex);
    
    gsap.to(hex, {
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      rotation: Math.PI / 6,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => {
        this.container.removeChild(hex);
        hex.destroy();
      }
    });
  }
  
  /**
   * Create slow effect for frozen/slowed enemies
   */
  createSlowEffect(enemy: PIXI.Container) {
    // Ice crystals
    const crystalCount = 6;
    for (let i = 0; i < crystalCount; i++) {
      const crystal = new PIXI.Graphics();
      crystal.beginFill(0x88ddff, 0.6);
      crystal.drawPolygon([0, -5, 3, 0, 0, 5, -3, 0]);
      crystal.rotation = (Math.PI * 2 * i) / crystalCount;
      
      const radius = 20;
      crystal.position.set(
        Math.cos(crystal.rotation) * radius,
        Math.sin(crystal.rotation) * radius
      );
      enemy.addChild(crystal);
      
      gsap.to(crystal, {
        y: crystal.y - 10,
        alpha: 0,
        duration: 1,
        repeat: -1,
        ease: "power2.out",
        delay: i * 0.1
      });
    }
  }
  
  /**
   * Clean up all effects
   */
  destroy() {
    gsap.killTweensOf(this.container.children);
  }
}