import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameCore } from '@/game/core/GameCore';
import { Projectile } from '@/game/entities/Projectile';
import { PermanentUpgrades } from '@/game/types';
import { gameEvents, GameEvents } from '@/game/core/EventEmitter';

describe('GameCore', () => {
  let gameCore: GameCore;
  let permanentUpgrades: PermanentUpgrades;

  beforeEach(() => {
    permanentUpgrades = {
      startingDamage: 0,
      startingFireRate: 0,
      startingHealth: 0,
      goldMultiplier: 1,
      essenceGain: 1,
      multiShot: 0,
      bounce: 0
    };
    
    gameCore = new GameCore(permanentUpgrades);
    gameEvents.removeAllListeners();
  });

  describe('initialization', () => {
    it('should apply permanent upgrades to initial stats', () => {
      const upgradedGame = new GameCore({
        ...permanentUpgrades,
        startingDamage: 2,
        startingHealth: 3
      });

      const state = upgradedGame.getState();
      const tower = upgradedGame['tower'];
      
      expect(tower.stats.damage).toBe(10 + 2 * 5); // Base 10 + 2 levels * 5
      expect(state.maxHealth).toBe(100 + 3 * 25); // Base 100 + 3 levels * 25
    });

    it('should initialize with correct starting gold', () => {
      const state = gameCore.getState();
      expect(state.gold).toBe(25); // STARTING_GOLD constant
    });
  });

  describe('projectile management', () => {
    it('should handle duplicate projectiles in array', () => {
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

      // Manually add projectiles to simulate the bug
      gameCore['projectiles'] = [projectile1, projectile2, projectile1]; // Duplicate!

      const warnSpy = vi.spyOn(console, 'warn');
      
      gameCore.update(0.1);
      
      // Should have removed the duplicate
      expect(gameCore['projectiles'].length).toBe(2);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('duplicate projectiles'));
      
      warnSpy.mockRestore();
    });

    it('should not update destroyed projectiles', () => {
      const projectile = new Projectile();
      projectile.init({
        x: 0, y: 0, targetX: 100, targetY: 100,
        speed: 300, range: 500, damage: 10
      });
      projectile.destroy();
      
      const updateSpy = vi.spyOn(projectile, 'update');
      
      gameCore['projectiles'] = [projectile];
      gameCore.update(0.1);
      
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should clean up destroyed projectiles', () => {
      const projectile = new Projectile();
      projectile.init({
        x: 0, y: 0, targetX: 100, targetY: 100,
        speed: 300, range: 500, damage: 10
      });
      
      gameCore['projectiles'] = [projectile];
      
      // Destroy the projectile
      projectile.destroy();
      
      // Update should clean it up
      gameCore.update(0.1);
      
      expect(gameCore['projectiles'].length).toBe(0);
    });
  });

  describe('upgrade purchasing', () => {
    beforeEach(() => {
      // Give enough gold for upgrades
      gameCore['gameState'].gold = 1000; // Need to set internal state directly
    });

    it('should apply upgrades to tower stats', () => {
      const initialDamage = gameCore['tower'].stats.damage;
      
      gameCore.purchaseUpgrade('damage');
      
      expect(gameCore['tower'].stats.damage).toBe(initialDamage + 5);
    });

    it('should update game state for economic upgrades', () => {
      // Ensure the properties exist and start at 0
      expect(gameCore.getState().goldPerRound).toBe(0);
      expect(gameCore.getState().interestRate).toBe(0);
      
      // Purchase economic upgrades
      const purchased1 = gameCore.purchaseUpgrade('goldPerRound');
      expect(purchased1).toBe(true);
      expect(gameCore.getState().goldPerRound).toBe(15); // 1 level * 15
      
      const purchased2 = gameCore.purchaseUpgrade('interest');
      expect(purchased2).toBe(true);
      expect(gameCore.getState().interestRate).toBe(0.02); // 1 level * 0.02
    });

    it('should handle multiple upgrade systems correctly', () => {
      // This tests that the UpgradeSystem doesn't mutate shared state
      const game1 = new GameCore(permanentUpgrades);
      const game2 = new GameCore(permanentUpgrades);
      
      game1.getState().gold = 1000;
      game2.getState().gold = 1000;
      
      game1.purchaseUpgrade('damage');
      
      // game2's tower should not be affected
      expect(game1['tower'].stats.damage).toBe(15);
      expect(game2['tower'].stats.damage).toBe(10);
    });
  });

  describe('game state management', () => {
    it('should track survival time', () => {
      const initialTime = gameCore.getState().survivalTime;
      
      gameCore.update(1.5); // 1.5 seconds
      
      expect(gameCore.getState().survivalTime).toBe(initialTime + 1.5);
    });

    it('should not update when paused', () => {
      const initialTime = gameCore.getState().survivalTime;
      gameCore.pause(); // Use the pause method instead of directly setting state
      
      gameCore.update(1.0);
      
      expect(gameCore.getState().survivalTime).toBe(initialTime);
    });

    it('should not update when game over', () => {
      const initialTime = gameCore.getState().survivalTime;
      
      // Trigger game over by setting health to 0 and calling update
      // This will properly set isGameOver through the game logic
      const state = gameCore.getState();
      state.health = 0;
      
      // Emit a tower damaged event to trigger game over
      gameCore['gameState'].health = 1;
      gameCore['eventHandlers'].towerDamaged({ damage: 1 });
      
      expect(gameCore.getState().isGameOver).toBe(true);
      
      gameCore.update(1.0);
      
      expect(gameCore.getState().survivalTime).toBe(initialTime);
    });
  });

  describe('speed boost ability', () => {
    it('should activate speed boost', () => {
      const initialFireRate = gameCore['tower'].stats.fireRate;
      
      const activated = gameCore.activateSpeedBoost();
      
      expect(activated).toBe(true);
      expect(gameCore.getState().speedBoostActive).toBe(true);
      expect(gameCore['tower'].stats.fireRate).toBe(initialFireRate * 2);
    });

    it('should not activate when on cooldown', () => {
      gameCore.activateSpeedBoost();
      gameCore.update(0.1); // Small time passage
      
      const activated = gameCore.activateSpeedBoost();
      
      expect(activated).toBe(false);
    });

    it('should deactivate after duration expires', () => {
      const initialFireRate = gameCore['tower'].stats.fireRate;
      
      gameCore.activateSpeedBoost();
      gameCore.update(4); // Speed boost duration is 3 seconds
      
      expect(gameCore.getState().speedBoostActive).toBe(false);
      expect(gameCore['tower'].stats.fireRate).toBe(initialFireRate);
    });
  });
});