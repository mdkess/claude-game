import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export class ProjectileEffects {
  private container: PIXI.Container;
  private trails: Map<number, PIXI.Graphics[]> = new Map();
  
  constructor(container: PIXI.Container) {
    this.container = container;
  }
  
  /**
   * Create an enhanced projectile visual
   */
  createEnhancedProjectile(projectile: PIXI.Graphics, color: number = 0x00ffaa): PIXI.Container {
    const projectileContainer = new PIXI.Container();
    
    // Outer glow
    const outerGlow = new PIXI.Graphics();
    outerGlow.circle(0, 0, 20);
    outerGlow.fill({ color, alpha: 0.2 });
    projectileContainer.addChild(outerGlow);
    
    // Middle glow
    const middleGlow = new PIXI.Graphics();
    middleGlow.circle(0, 0, 12);
    middleGlow.fill({ color, alpha: 0.4 });
    projectileContainer.addChild(middleGlow);
    
    // Core
    const core = new PIXI.Graphics();
    core.circle(0, 0, 4);
    core.fill({ color: 0xffffff, alpha: 0.9 });
    projectileContainer.addChild(core);
    
    // Add the original projectile
    projectileContainer.addChild(projectile);
    
    // Pulsing animation
    gsap.to(outerGlow, {
      alpha: 0.1,
      duration: 0.3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    gsap.to(outerGlow.scale, {
      x: 1.2,
      y: 1.2,
      duration: 0.3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    gsap.to(middleGlow, {
      alpha: 0.3,
      duration: 0.3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 0.1
    });
    
    gsap.to(middleGlow.scale, {
      x: 1.1,
      y: 1.1,
      duration: 0.3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 0.1
    });
    
    return projectileContainer;
  }
  
  /**
   * Start creating a trail for a projectile
   */
  startProjectileTrail(projectileId: number, x: number, y: number, color: number = 0x00ff88) {
    if (!this.trails.has(projectileId)) {
      this.trails.set(projectileId, []);
    }
    
    const trail = new PIXI.Graphics();
    trail.circle(0, 0, 6);
    trail.fill({ color, alpha: 0.6 });
    trail.position.set(x, y);
    
    this.container.addChild(trail);
    this.trails.get(projectileId)!.push(trail);
    
    // Fade out trail segment
    gsap.to(trail, {
      alpha: 0,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => {
        this.container.removeChild(trail);
        trail.destroy();
        
        // Remove from trails array
        const trails = this.trails.get(projectileId);
        if (trails) {
          const index = trails.indexOf(trail);
          if (index > -1) trails.splice(index, 1);
        }
      }
    });
    
    gsap.to(trail.scale, {
      x: 0.2,
      y: 0.2,
      duration: 0.4,
      ease: "power2.out"
    });
  }
  
  /**
   * Create multi-shot spread effect
   */
  createMultiShotEffect(x: number, y: number, angles: number[], color: number = 0x00ffaa) {
    // Central burst
    const burst = new PIXI.Graphics();
    burst.circle(0, 0, 15);
    burst.fill({ color, alpha: 0.5 });
    burst.position.set(x, y);
    this.container.addChild(burst);
    
    gsap.to(burst, {
      alpha: 0,
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        this.container.removeChild(burst);
        burst.destroy();
      }
    });
    
    gsap.to(burst.scale, {
      x: 2,
      y: 2,
      duration: 0.3,
      ease: "power2.out"
    });
    
    // Direction indicators
    angles.forEach((angle, i) => {
      const line = new PIXI.Graphics();
      line.setStrokeStyle({ width: 2, color, alpha: 0.8 });
      line.moveTo(0, 0);
      line.lineTo(30, 0);
      line.stroke();
      line.position.set(x, y);
      line.rotation = angle;
      this.container.addChild(line);
      
      gsap.to(line, {
        alpha: 0,
        duration: 0.4,
        delay: i * 0.05,
        ease: "power2.out",
        onComplete: () => {
          this.container.removeChild(line);
          line.destroy();
        }
      });
      
      gsap.to(line.scale, {
        x: 2,
        duration: 0.4,
        delay: i * 0.05,
        ease: "power2.out"
      });
    });
  }
  
  /**
   * Create bounce effect when projectile bounces
   */
  createBounceEffect(x: number, y: number, fromAngle: number, toAngle: number, color: number = 0x00ffaa) {
    // Impact flash
    const flash = new PIXI.Graphics();
    flash.circle(0, 0, 10);
    flash.fill({ color: 0xffffff, alpha: 0.8 });
    flash.position.set(x, y);
    this.container.addChild(flash);
    
    gsap.to(flash, {
      alpha: 0,
      duration: 0.2,
      ease: "power2.out",
      onComplete: () => {
        this.container.removeChild(flash);
        flash.destroy();
      }
    });
    
    gsap.to(flash.scale, {
      x: 2,
      y: 2,
      duration: 0.2,
      ease: "power2.out"
    });
    
    // Direction change arc
    const arc = new PIXI.Graphics();
    arc.setStrokeStyle({ width: 2, color, alpha: 0.6 });
    arc.arc(0, 0, 20, fromAngle, toAngle);
    arc.stroke();
    arc.position.set(x, y);
    this.container.addChild(arc);
    
    gsap.to(arc, {
      alpha: 0,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => {
        this.container.removeChild(arc);
        arc.destroy();
      }
    });
    
    gsap.to(arc.scale, {
      x: 1.5,
      y: 1.5,
      duration: 0.4,
      ease: "power2.out"
    });
    
    // Spark particles at bounce point
    for (let i = 0; i < 5; i++) {
      const spark = new PIXI.Graphics();
      spark.circle(0, 0, 2);
      spark.fill({ color });
      spark.position.set(x, y);
      this.container.addChild(spark);
      
      const angle = fromAngle + Math.random() * Math.PI - Math.PI/2;
      const speed = 2 + Math.random() * 3;
      
      gsap.to(spark, {
        x: x + Math.cos(angle) * speed * 20,
        y: y + Math.sin(angle) * speed * 20,
        alpha: 0,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          this.container.removeChild(spark);
          spark.destroy();
        }
      });
    }
  }
  
  /**
   * Create charged shot effect
   */
  createChargedShotEffect(projectile: PIXI.Container, power: number = 1) {
    const color = 0x00ffff;
    
    // Electric arcs
    const arcCount = Math.floor(3 + power * 2);
    for (let i = 0; i < arcCount; i++) {
      const arc = new PIXI.Graphics();
      arc.setStrokeStyle({ width: 1, color, alpha: 0.8 });
      
      // Draw jagged line
      const points: number[] = [0, 0];
      const segments = 4;
      for (let j = 1; j <= segments; j++) {
        const x = (j / segments) * 20 - 10;
        const y = (Math.random() - 0.5) * 10;
        points.push(x, y);
      }
      
      arc.poly(points);
      arc.stroke();
      arc.rotation = (Math.PI * 2 * i) / arcCount;
      projectile.addChild(arc);
      
      gsap.to(arc, {
        alpha: 0,
        rotation: arc.rotation + Math.PI / 4,
        duration: 0.2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });
      
      gsap.to(arc.scale, {
        x: 1.5,
        y: 1.5,
        duration: 0.2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });
    }
    
    // Energy field
    const field = new PIXI.Graphics();
    field.setStrokeStyle({ width: 2, color, alpha: 0.3 });
    field.circle(0, 0, 15 + power * 5);
    field.stroke();
    projectile.addChild(field);
    
    gsap.to(field, {
      alpha: 0.1,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    gsap.to(field.scale, {
      x: 1.2,
      y: 1.2,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }
  
  /**
   * Clean up trails for a projectile
   */
  stopProjectileTrail(projectileId: number) {
    const trails = this.trails.get(projectileId);
    if (trails) {
      trails.forEach(trail => {
        gsap.killTweensOf(trail);
        if (trail.parent) {
          trail.parent.removeChild(trail);
        }
        trail.destroy();
      });
      this.trails.delete(projectileId);
    }
  }
  
  /**
   * Clean up all effects
   */
  destroy() {
    // Clean up all trails
    this.trails.forEach((trails, id) => {
      this.stopProjectileTrail(id);
    });
    this.trails.clear();
    
    // Kill all animations
    gsap.killTweensOf(this.container.children);
  }
}