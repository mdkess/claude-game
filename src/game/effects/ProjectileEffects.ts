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
    outerGlow.beginFill(color, 0.2);
    outerGlow.drawCircle(0, 0, 20);
    outerGlow.endFill();
    projectileContainer.addChild(outerGlow);
    
    // Middle glow
    const middleGlow = new PIXI.Graphics();
    middleGlow.beginFill(color, 0.4);
    middleGlow.drawCircle(0, 0, 12);
    middleGlow.endFill();
    projectileContainer.addChild(middleGlow);
    
    // Core
    const core = new PIXI.Graphics();
    core.beginFill(0xffffff, 0.9);
    core.drawCircle(0, 0, 4);
    core.endFill();
    projectileContainer.addChild(core);
    
    // Add the original projectile
    projectileContainer.addChild(projectile);
    
    // Pulsing animation
    gsap.to(outerGlow, {
      alpha: 0.1,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 0.3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    gsap.to(middleGlow, {
      alpha: 0.3,
      scaleX: 1.1,
      scaleY: 1.1,
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
    trail.beginFill(color, 0.6);
    trail.drawCircle(0, 0, 6);
    trail.endFill();
    trail.position.set(x, y);
    
    this.container.addChild(trail);
    this.trails.get(projectileId)!.push(trail);
    
    // Fade out trail segment
    gsap.to(trail, {
      alpha: 0,
      scaleX: 0.2,
      scaleY: 0.2,
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
  }
  
  /**
   * Create multi-shot spread effect
   */
  createMultiShotEffect(x: number, y: number, angles: number[], color: number = 0x00ffaa) {
    // Central burst
    const burst = new PIXI.Graphics();
    burst.beginFill(color, 0.5);
    burst.drawCircle(0, 0, 15);
    burst.endFill();
    burst.position.set(x, y);
    this.container.addChild(burst);
    
    gsap.to(burst, {
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        this.container.removeChild(burst);
        burst.destroy();
      }
    });
    
    // Direction indicators
    angles.forEach((angle, i) => {
      const line = new PIXI.Graphics();
      line.lineStyle(2, color, 0.8);
      line.moveTo(0, 0);
      line.lineTo(30, 0);
      line.position.set(x, y);
      line.rotation = angle;
      this.container.addChild(line);
      
      gsap.to(line, {
        alpha: 0,
        scaleX: 2,
        duration: 0.4,
        delay: i * 0.05,
        ease: "power2.out",
        onComplete: () => {
          this.container.removeChild(line);
          line.destroy();
        }
      });
    });
  }
  
  /**
   * Create bounce effect when projectile bounces
   */
  createBounceEffect(x: number, y: number, fromAngle: number, toAngle: number, color: number = 0x00ffaa) {
    // Impact flash
    const flash = new PIXI.Graphics();
    flash.beginFill(0xffffff, 0.8);
    flash.drawCircle(0, 0, 10);
    flash.endFill();
    flash.position.set(x, y);
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
    
    // Direction change arc
    const arc = new PIXI.Graphics();
    arc.lineStyle(2, color, 0.6);
    arc.arc(0, 0, 20, fromAngle, toAngle);
    arc.position.set(x, y);
    this.container.addChild(arc);
    
    gsap.to(arc, {
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => {
        this.container.removeChild(arc);
        arc.destroy();
      }
    });
    
    // Spark particles at bounce point
    for (let i = 0; i < 5; i++) {
      const spark = new PIXI.Graphics();
      spark.beginFill(color);
      spark.drawCircle(0, 0, 2);
      spark.endFill();
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
      arc.lineStyle(1, color, 0.8);
      
      // Draw jagged line
      const points: number[] = [0, 0];
      const segments = 4;
      for (let j = 1; j <= segments; j++) {
        const x = (j / segments) * 20 - 10;
        const y = (Math.random() - 0.5) * 10;
        points.push(x, y);
      }
      
      arc.drawPolygon(points);
      arc.rotation = (Math.PI * 2 * i) / arcCount;
      projectile.addChild(arc);
      
      gsap.to(arc, {
        alpha: 0,
        scaleX: 1.5,
        scaleY: 1.5,
        rotation: arc.rotation + Math.PI / 4,
        duration: 0.2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });
    }
    
    // Energy field
    const field = new PIXI.Graphics();
    field.lineStyle(2, color, 0.3);
    field.drawCircle(0, 0, 15 + power * 5);
    projectile.addChild(field);
    
    gsap.to(field, {
      alpha: 0.1,
      scaleX: 1.2,
      scaleY: 1.2,
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