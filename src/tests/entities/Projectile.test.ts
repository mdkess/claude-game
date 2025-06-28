import { describe, it, expect, beforeEach } from 'vitest';
import { Projectile } from '@/game/entities/Projectile';
import { createMockEnemy } from '../helpers/mock-factories';

describe('Projectile', () => {
  let projectile: Projectile;

  beforeEach(() => {
    projectile = new Projectile();
  });

  describe('initialization', () => {
    it('should initialize with correct properties', () => {
      projectile.init({
        x: 100,
        y: 100,
        targetX: 200,
        targetY: 200,
        speed: 300,
        range: 500,
        damage: 25,
        bounceCount: 0
      });

      expect(projectile.x).toBe(100);
      expect(projectile.y).toBe(100);
      expect(projectile.damage).toBe(25);
      expect(projectile.isDestroyed).toBe(false);
      expect(projectile.id).toBeGreaterThan(0);
    });

    it('should generate unique IDs for each initialization', () => {
      const projectile1 = new Projectile();
      const projectile2 = new Projectile();
      
      projectile1.init({
        x: 0, y: 0, targetX: 100, targetY: 100,
        speed: 300, range: 500, damage: 10
      });
      
      projectile2.init({
        x: 0, y: 0, targetX: 100, targetY: 100,
        speed: 300, range: 500, damage: 10
      });

      expect(projectile1.id).not.toBe(projectile2.id);
    });

    it('should handle zero-distance targets gracefully', () => {
      projectile.init({
        x: 100,
        y: 100,
        targetX: 100, // Same as origin
        targetY: 100, // Same as origin
        speed: 300,
        range: 500,
        damage: 25
      });

      // Should not throw error and velocity should be 0
      expect(projectile.x).toBe(100);
      expect(projectile.y).toBe(100);
    });
  });

  describe('collision detection', () => {
    let enemy: ReturnType<typeof createMockEnemy>;

    beforeEach(() => {
      projectile.init({
        x: 100,
        y: 100,
        targetX: 200,
        targetY: 200,
        speed: 300,
        range: 500,
        damage: 25
      });
      enemy = createMockEnemy({ x: 105, y: 105 });
    });

    it('should detect collision when within range', () => {
      const hit = projectile.checkCollision(enemy);
      expect(hit).toBe(true);
    });

    it('should not detect collision when out of range', () => {
      enemy.x = 200;
      enemy.y = 200;
      const hit = projectile.checkCollision(enemy);
      expect(hit).toBe(false);
    });

    it('should not detect collision with dead enemies', () => {
      enemy.isDead = true;
      const hit = projectile.checkCollision(enemy);
      expect(hit).toBe(false);
    });

    it('should not detect collision with inactive enemies', () => {
      enemy.isActive = false;
      const hit = projectile.checkCollision(enemy);
      expect(hit).toBe(false);
    });

    it('should not detect collision when projectile is destroyed', () => {
      projectile.destroy();
      const hit = projectile.checkCollision(enemy);
      expect(hit).toBe(false);
    });

    it('should not hit the same target twice', () => {
      // First hit
      projectile.onHit(enemy, [enemy]);
      
      // Second attempt
      const hit = projectile.checkCollision(enemy);
      expect(hit).toBe(false);
    });
  });

  describe('movement and range', () => {
    beforeEach(() => {
      projectile.init({
        x: 0,
        y: 0,
        targetX: 100,
        targetY: 0,
        speed: 100,
        range: 50,
        damage: 10
      });
    });

    it('should move toward target', () => {
      const deltaTime = 0.1; // 100ms
      projectile.update(deltaTime);
      
      expect(projectile.x).toBeGreaterThan(0);
      expect(projectile.y).toBe(0);
    });

    it('should destroy when max range reached', () => {
      // Move projectile beyond max range
      const deltaTime = 1; // 1 second, will travel 100 units
      projectile.update(deltaTime);
      
      expect(projectile.isDestroyed).toBe(true);
    });

    it('should destroy when going out of bounds', () => {
      projectile.x = -200; // Way off screen
      projectile.update(0.1);
      
      expect(projectile.isDestroyed).toBe(true);
    });
  });

  describe('reset functionality', () => {
    it('should reset all properties', () => {
      projectile.init({
        x: 100,
        y: 100,
        targetX: 200,
        targetY: 200,
        speed: 300,
        range: 500,
        damage: 25
      });

      const oldId = projectile.id;
      projectile.reset();

      expect(projectile.x).toBe(0);
      expect(projectile.y).toBe(0);
      expect(projectile.damage).toBe(0);
      expect(projectile.isDestroyed).toBe(false);
      expect(projectile.id).toBe(oldId); // ID should not change on reset
    });
  });

  describe('multi-shot bug prevention', () => {
    it('should handle multiple projectiles without ID conflicts', () => {
      const projectiles: Projectile[] = [];
      const ids = new Set<number>();

      // Simulate creating multiple projectiles quickly (like multi-shot)
      for (let i = 0; i < 5; i++) {
        const p = new Projectile();
        p.init({
          x: 400,
          y: 400,
          targetX: 400 + i * 10,
          targetY: 300,
          speed: 300,
          range: 200,
          damage: 15
        });
        projectiles.push(p);
        ids.add(p.id);
      }

      // All IDs should be unique
      expect(ids.size).toBe(5);
      
      // No projectile should be destroyed initially
      expect(projectiles.every(p => !p.isDestroyed)).toBe(true);
    });
  });
});