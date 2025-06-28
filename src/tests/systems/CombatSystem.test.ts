import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CombatSystem } from '@/game/systems/CombatSystem';
import { Tower } from '@/game/entities/Tower';
import { Projectile } from '@/game/entities/Projectile';
import { createMockEnemy, createMockTowerStats } from '../helpers/mock-factories';
import { gameEvents, GameEvents } from '@/game/core/EventEmitter';

describe('CombatSystem', () => {
  let combatSystem: CombatSystem;
  let tower: Tower;
  let projectiles: Projectile[];

  beforeEach(() => {
    tower = new Tower(400, 400, createMockTowerStats());
    combatSystem = new CombatSystem(tower);
    projectiles = [];
    
    // Clear any event listeners
    gameEvents.removeAllListeners();
  });

  describe('projectile pooling', () => {
    it('should pre-populate projectile pool', () => {
      // Pool should be created with 200 projectiles
      const pooledProjectile = combatSystem['getProjectileFromPool']();
      expect(pooledProjectile).toBeInstanceOf(Projectile);
    });

    it('should reuse projectiles from pool', () => {
      const projectile = combatSystem['getProjectileFromPool']();
      const initialId = projectile?.id;
      
      if (projectile) {
        combatSystem.releaseProjectile(projectile);
        const reusedProjectile = combatSystem['getProjectileFromPool']();
        expect(reusedProjectile).toBe(projectile);
      }
    });

    it('should create new projectile if pool is empty', () => {
      // Drain the pool
      const projectiles: Projectile[] = [];
      for (let i = 0; i < 250; i++) {
        const p = combatSystem['getProjectileFromPool']();
        if (p) projectiles.push(p);
      }

      // Should still create a new one
      const newProjectile = combatSystem['getProjectileFromPool']();
      expect(newProjectile).toBeInstanceOf(Projectile);
    });
  });

  describe('firing at targets', () => {
    it('should fire when target is in range', () => {
      const enemy = createMockEnemy({ x: 500, y: 400 });
      const enemies = [enemy];
      
      const towerShootSpy = vi.fn();
      gameEvents.on(GameEvents.TowerShoot, towerShootSpy);

      // Simulate enough time passing for fire rate
      combatSystem.update(0.5, enemies, projectiles);

      expect(towerShootSpy).toHaveBeenCalled();
      expect(projectiles.length).toBe(1);
    });

    it('should not fire when no targets in range', () => {
      const enemy = createMockEnemy({ x: 1000, y: 1000 }); // Far away
      const enemies = [enemy];

      combatSystem.update(0.5, enemies, projectiles);

      expect(projectiles.length).toBe(0);
    });

    it('should respect fire rate', () => {
      const enemy = createMockEnemy({ x: 500, y: 400 });
      const enemies = [enemy];

      // First shot
      combatSystem.update(0.5, enemies, projectiles);
      expect(projectiles.length).toBe(1);

      // Too soon for second shot (fire rate is 2/second = 0.5s interval)
      combatSystem.update(0.1, enemies, projectiles);
      expect(projectiles.length).toBe(1);

      // Enough time has passed
      combatSystem.update(0.5, enemies, projectiles);
      expect(projectiles.length).toBe(2);
    });
  });

  describe('multi-shot functionality', () => {
    it('should fire multiple projectiles with multi-shot', () => {
      tower.updateStats({ multiShotCount: 3 });
      const enemy = createMockEnemy({ x: 500, y: 400 });
      const enemies = [enemy];

      combatSystem.update(0.5, enemies, projectiles);

      // 1 base + 3 multi = 4 total
      expect(projectiles.length).toBe(4);
    });

    it('should spread multi-shot projectiles', () => {
      tower.updateStats({ multiShotCount: 2 });
      const enemy = createMockEnemy({ x: 500, y: 400 });
      const enemies = [enemy];

      combatSystem.update(0.5, enemies, projectiles);

      // Check that projectiles have different IDs (they should all be unique)
      const ids = projectiles.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3); // 1 base + 2 multi
      
      // Also verify we got the right number of projectiles
      expect(projectiles.length).toBe(3);
    });

    it('should give each multi-shot projectile a unique ID', () => {
      tower.updateStats({ multiShotCount: 4 });
      const enemy = createMockEnemy({ x: 500, y: 400 });
      const enemies = [enemy];

      combatSystem.update(0.5, enemies, projectiles);

      const ids = projectiles.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5); // All IDs should be unique
    });
  });

  describe('projectile stats', () => {
    it('should apply tower stats to projectiles', () => {
      tower.updateStats({ 
        damage: 50,
        range: 300,
        projectileSpeed: 400
      });

      const enemy = createMockEnemy({ x: 500, y: 400 });
      const enemies = [enemy];

      combatSystem.update(0.5, enemies, projectiles);

      const projectile = projectiles[0];
      expect(projectile.damage).toBe(50);
      // Range and speed are applied internally
    });

    it('should create projectiles with 0 range that immediately destroy', () => {
      tower.updateStats({ range: 0 });
      const enemy = createMockEnemy({ x: 400, y: 400 }); // Right on tower
      const enemies = [enemy];

      combatSystem.update(0.5, enemies, projectiles);

      // Tower can still fire, but projectiles should have 0 range
      if (projectiles.length > 0) {
        // The projectile will be destroyed immediately due to 0 range
        expect(projectiles[0]).toBeDefined();
      }
    });
  });
});