import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export interface Particle {
  sprite: PIXI.Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  scale: number;
  alpha: number;
  color: number;
}

export class VisualEffects {
  private container: PIXI.Container;
  private particles: Particle[] = [];
  private shockwaves: PIXI.Graphics[] = [];
  
  constructor(container: PIXI.Container) {
    this.container = container;
  }
  
  /**
   * Create a powerful explosion effect at the given position
   */
  createExplosion(x: number, y: number, color: number = 0xff6600, scale: number = 1) {
    // Main flash
    const flash = new PIXI.Graphics();
    flash.circle(0, 0, 30 * scale);
    flash.fill({ color: 0xffffff });
    flash.position.set(x, y);
    flash.alpha = 0.8;
    this.container.addChild(flash);
    
    gsap.to(flash, {
      alpha: 0,
      width: flash.width * 3,
      height: flash.height * 3,
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        this.container.removeChild(flash);
        flash.destroy();
      }
    });
    
    // Shockwave ring
    this.createShockwave(x, y, color, scale);
    
    // Particle burst
    const particleCount = 20 + Math.floor(Math.random() * 10);
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = 3 + Math.random() * 4;
      this.createParticle(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
        0.5 + Math.random() * 0.5
      );
    }
    
    // Smoke particles
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 20;
      this.createSmokeParticle(
        x + Math.cos(angle) * dist,
        y + Math.sin(angle) * dist
      );
    }
  }
  
  /**
   * Create a shockwave ring effect
   */
  createShockwave(x: number, y: number, color: number = 0x00ff88, scale: number = 1) {
    const shockwave = new PIXI.Graphics();
    shockwave.setStrokeStyle({ width: 3, color, alpha: 0.8 });
    shockwave.circle(0, 0, 10);
    shockwave.stroke();
    shockwave.position.set(x, y);
    shockwave.scale.set(scale);
    this.container.addChild(shockwave);
    this.shockwaves.push(shockwave);
    
    gsap.to(shockwave, {
      alpha: 0,
      width: shockwave.width * 8,
      height: shockwave.height * 8,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => {
        const index = this.shockwaves.indexOf(shockwave);
        if (index > -1) this.shockwaves.splice(index, 1);
        this.container.removeChild(shockwave);
        shockwave.destroy();
      }
    });
  }
  
  /**
   * Create an impact ripple effect
   */
  createImpactRipple(x: number, y: number, color: number = 0x00ffaa) {
    const rippleCount = 3;
    for (let i = 0; i < rippleCount; i++) {
      const ripple = new PIXI.Graphics();
      ripple.setStrokeStyle({ width: 2, color, alpha: 0.6 });
      ripple.circle(0, 0, 5);
      ripple.stroke();
      ripple.position.set(x, y);
      this.container.addChild(ripple);
      
      gsap.to(ripple, {
        alpha: 0,
        width: ripple.width * 6,
        height: ripple.height * 6,
        duration: 0.4,
        delay: i * 0.1,
        ease: "power2.out",
        onComplete: () => {
          this.container.removeChild(ripple);
          ripple.destroy();
        }
      });
    }
  }
  
  /**
   * Create a muzzle flash effect when tower shoots
   */
  createMuzzleFlash(x: number, y: number, angle: number, color: number = 0x00ffaa) {
    // Main flash
    const flash = new PIXI.Graphics();
    flash.poly([
      0, 0,
      40, -10,
      50, 0,
      40, 10
    ]);
    flash.fill({ color });
    flash.position.set(x, y);
    flash.rotation = angle;
    flash.alpha = 0.9;
    this.container.addChild(flash);
    
    gsap.to(flash, {
      alpha: 0,
      scaleX: 1.5,
      scaleY: 0.5,
      duration: 0.15,
      ease: "power2.out",
      onComplete: () => {
        this.container.removeChild(flash);
        flash.destroy();
      }
    });
    
    // Spark particles
    for (let i = 0; i < 5; i++) {
      const sparkAngle = angle + (Math.random() - 0.5) * 0.5;
      const speed = 5 + Math.random() * 3;
      this.createSparkParticle(
        x + Math.cos(angle) * 30,
        y + Math.sin(angle) * 30,
        Math.cos(sparkAngle) * speed,
        Math.sin(sparkAngle) * speed,
        color
      );
    }
  }
  
  /**
   * Create a particle
   */
  private createParticle(
    x: number, 
    y: number, 
    vx: number, 
    vy: number, 
    color: number, 
    scale: number = 1
  ) {
    const particle = new PIXI.Graphics();
    particle.circle(0, 0, 3);
    particle.fill({ color });
    particle.position.set(x, y);
    particle.scale.set(scale);
    this.container.addChild(particle);
    
    this.particles.push({
      sprite: particle,
      vx,
      vy,
      life: 1,
      maxLife: 1,
      scale,
      alpha: 1,
      color
    });
  }
  
  /**
   * Create a spark particle
   */
  private createSparkParticle(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: number
  ) {
    const spark = new PIXI.Graphics();
    spark.rect(-8, -1, 16, 2);
    spark.fill({ color });
    spark.position.set(x, y);
    spark.rotation = Math.atan2(vy, vx);
    this.container.addChild(spark);
    
    gsap.to(spark, {
      alpha: 0,
      scaleX: 0.2,
      x: x + vx * 20,
      y: y + vy * 20,
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        this.container.removeChild(spark);
        spark.destroy();
      }
    });
  }
  
  /**
   * Create smoke particle
   */
  private createSmokeParticle(x: number, y: number) {
    const smoke = new PIXI.Graphics();
    smoke.circle(0, 0, 10);
    smoke.fill({ color: 0x666666 });
    smoke.position.set(x, y);
    smoke.alpha = 0.3;
    this.container.addChild(smoke);
    
    gsap.to(smoke, {
      alpha: 0,
      y: y - 30,
      width: smoke.width * 2,
      height: smoke.height * 2,
      duration: 1,
      ease: "power2.out",
      onComplete: () => {
        this.container.removeChild(smoke);
        smoke.destroy();
      }
    });
  }
  
  /**
   * Create a projectile trail effect
   */
  createProjectileTrail(x: number, y: number, color: number = 0x00ff88) {
    const trail = new PIXI.Graphics();
    trail.circle(0, 0, 4);
    trail.fill({ color });
    trail.position.set(x, y);
    trail.alpha = 0.6;
    this.container.addChild(trail);
    
    gsap.to(trail, {
      alpha: 0,
      scaleX: 0.2,
      scaleY: 0.2,
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        this.container.removeChild(trail);
        trail.destroy();
      }
    });
  }
  
  /**
   * Create screen shake effect
   */
  createScreenShake(intensity: number = 5, duration: number = 0.3) {
    const originalX = this.container.parent.x;
    const originalY = this.container.parent.y;
    
    gsap.to(this.container.parent, {
      x: originalX,
      y: originalY,
      duration: duration,
      ease: "elastic.out(1, 0.5)",
      onUpdate: function() {
        this.targets()[0].x = originalX + (Math.random() - 0.5) * intensity;
        this.targets()[0].y = originalY + (Math.random() - 0.5) * intensity;
      },
      onComplete: () => {
        this.container.parent.x = originalX;
        this.container.parent.y = originalY;
      }
    });
  }
  
  /**
   * Create a power-up effect for upgrades
   */
  createPowerUpEffect(x: number, y: number, color: number = 0x00ff00) {
    // Rising particles
    for (let i = 0; i < 10; i++) {
      const particle = new PIXI.Graphics();
      particle.circle(0, 0, 2);
      particle.fill({ color });
      
      const angle = (Math.PI * 2 * i) / 10;
      const radius = 40;
      particle.position.set(
        x + Math.cos(angle) * radius,
        y + Math.sin(angle) * radius
      );
      this.container.addChild(particle);
      
      gsap.to(particle, {
        y: particle.y - 50,
        alpha: 0,
        duration: 0.8,
        delay: i * 0.05,
        ease: "power2.out",
        onComplete: () => {
          this.container.removeChild(particle);
          particle.destroy();
        }
      });
    }
    
    // Central burst
    const burst = new PIXI.Graphics();
    burst.star(0, 0, 8, 20, 10);
    burst.fill({ color });
    burst.position.set(x, y);
    burst.alpha = 0.8;
    this.container.addChild(burst);
    
    gsap.to(burst, {
      alpha: 0,
      rotation: Math.PI,
      scaleX: 2,
      scaleY: 2,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => {
        this.container.removeChild(burst);
        burst.destroy();
      }
    });
  }
  
  /**
   * Update all particles
   */
  update(deltaTime: number) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Physics
      particle.sprite.x += particle.vx;
      particle.sprite.y += particle.vy;
      particle.vy += 0.2; // Gravity
      particle.vx *= 0.98; // Drag
      
      // Fade out
      particle.life -= deltaTime * 2;
      particle.sprite.alpha = particle.alpha * particle.life;
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.container.removeChild(particle.sprite);
        particle.sprite.destroy();
        this.particles.splice(i, 1);
      }
    }
  }
  
  /**
   * Clean up all effects
   */
  destroy() {
    // Clean up particles
    for (const particle of this.particles) {
      this.container.removeChild(particle.sprite);
      particle.sprite.destroy();
    }
    this.particles = [];
    
    // Clean up shockwaves
    for (const shockwave of this.shockwaves) {
      this.container.removeChild(shockwave);
      shockwave.destroy();
    }
    this.shockwaves = [];
    
    // Kill all gsap animations on container children
    gsap.killTweensOf(this.container.children);
  }
}