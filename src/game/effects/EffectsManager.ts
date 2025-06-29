import * as PIXI from 'pixi.js';
import { VisualEffects } from './VisualEffects';
import { ProjectileEffects } from './ProjectileEffects';
import { EnemyEffects } from './EnemyEffects';

export class EffectsManager {
  private visualEffects: VisualEffects;
  private projectileEffects: ProjectileEffects;
  private enemyEffects: EnemyEffects;
  private effectsContainer: PIXI.Container;
  
  constructor(parentContainer: PIXI.Container) {
    // Create a dedicated container for all effects
    this.effectsContainer = new PIXI.Container();
    this.effectsContainer.label = 'effects';
    parentContainer.addChild(this.effectsContainer);
    
    // Initialize effect systems
    this.visualEffects = new VisualEffects(this.effectsContainer);
    this.projectileEffects = new ProjectileEffects(this.effectsContainer);
    this.enemyEffects = new EnemyEffects(this.effectsContainer);
  }
  
  // Tower Effects
  onTowerShoot(x: number, y: number, angle: number, isMultiShot: boolean = false) {
    this.visualEffects.createMuzzleFlash(x, y, angle, isMultiShot ? 0x00ffff : 0x00ffaa);
    if (isMultiShot) {
      this.createScreenShake(3, 0.2);
    }
  }
  
  onTowerUpgrade(x: number, y: number) {
    this.visualEffects.createPowerUpEffect(x, y, 0x00ff00);
    this.createScreenShake(5, 0.3);
  }
  
  // Projectile Effects
  createProjectile(projectile: PIXI.Graphics, type: 'normal' | 'multi' | 'bounce' = 'normal'): PIXI.Container {
    const color = type === 'multi' ? 0x00ffff : type === 'bounce' ? 0xffaa00 : 0x00ffaa;
    return this.projectileEffects.createEnhancedProjectile(projectile, color);
  }
  
  updateProjectileTrail(id: number, x: number, y: number) {
    this.projectileEffects.startProjectileTrail(id, x, y);
  }
  
  onProjectileHit(x: number, y: number, isBounce: boolean = false) {
    this.visualEffects.createImpactRipple(x, y);
    if (isBounce) {
      this.createScreenShake(2, 0.1);
    }
  }
  
  onProjectileBounce(x: number, y: number, fromAngle: number, toAngle: number) {
    this.projectileEffects.createBounceEffect(x, y, fromAngle, toAngle, 0xffaa00);
  }
  
  onMultiShot(x: number, y: number, angles: number[]) {
    this.projectileEffects.createMultiShotEffect(x, y, angles);
  }
  
  cleanupProjectile(id: number) {
    this.projectileEffects.stopProjectileTrail(id);
  }
  
  // Enemy Effects
  onEnemySpawn(x: number, y: number, color: number) {
    this.enemyEffects.createSpawnEffect(x, y, color);
  }
  
  onEnemyHit(x: number, y: number, damage: number, enemyColor: number, isCritical: boolean = false) {
    this.enemyEffects.createHitEffect(x, y, enemyColor);
    this.enemyEffects.createDamageNumber(x, y, damage, isCritical);
    
    if (isCritical) {
      this.createScreenShake(4, 0.2);
    }
  }
  
  onEnemyDeath(x: number, y: number, enemyColor: number, isElite: boolean = false) {
    this.visualEffects.createExplosion(x, y, enemyColor, isElite ? 1.5 : 1);
    this.enemyEffects.createDeathEffect(x, y, enemyColor, isElite ? 1.5 : 1);
    this.createScreenShake(isElite ? 8 : 5, 0.3);
  }
  
  onShieldHit(x: number, y: number) {
    this.enemyEffects.createShieldHitEffect(x, y);
  }
  
  applySlowEffect(enemy: PIXI.Container) {
    this.enemyEffects.createSlowEffect(enemy);
  }
  
  // Wave Effects
  onWaveComplete() {
    // Victory fanfare
    const centerX = 400;
    const centerY = 400;
    
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const angle = (Math.PI * 2 * i) / 8;
        const x = centerX + Math.cos(angle) * 100;
        const y = centerY + Math.sin(angle) * 100;
        this.visualEffects.createExplosion(x, y, 0x00ff00, 0.7);
      }, i * 100);
    }
    
    this.createScreenShake(10, 0.5);
  }
  
  onGameOver() {
    this.createScreenShake(20, 1);
    // Create multiple explosions
    const centerX = 400;
    const centerY = 400;
    
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const x = centerX + (Math.random() - 0.5) * 100;
        const y = centerY + (Math.random() - 0.5) * 100;
        this.visualEffects.createExplosion(x, y, 0xff0000, 1.5);
      }, i * 150);
    }
  }
  
  // Screen Effects
  createScreenShake(intensity: number = 5, duration: number = 0.3) {
    this.visualEffects.createScreenShake(intensity, duration);
  }
  
  updateBasePosition(x: number, y: number) {
    this.visualEffects.updateBasePosition(x, y);
  }
  
  // Update
  update(deltaTime: number) {
    this.visualEffects.update(deltaTime);
  }
  
  // Cleanup
  destroy() {
    this.visualEffects.destroy();
    this.projectileEffects.destroy();
    this.enemyEffects.destroy();
    
    if (this.effectsContainer.parent) {
      this.effectsContainer.parent.removeChild(this.effectsContainer);
    }
    this.effectsContainer.destroy();
  }
}