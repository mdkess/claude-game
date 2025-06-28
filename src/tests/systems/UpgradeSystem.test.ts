import { describe, it, expect, beforeEach } from 'vitest';
import { UpgradeSystem } from '@/game/systems/UpgradeSystem';
import { GameState } from '@/game/types';
import { createMockTowerStats } from '../helpers/mock-factories';

describe('UpgradeSystem', () => {
  let upgradeSystem: UpgradeSystem;
  let gameState: GameState;
  let baseTowerStats: ReturnType<typeof createMockTowerStats>;

  beforeEach(() => {
    gameState = {
      health: 100,
      maxHealth: 100,
      gold: 1000,
      score: 0,
      wave: 1,
      survivalTime: 0,
      isPaused: false,
      isGameOver: false,
      speedMultiplier: 1,
      towerStats: createMockTowerStats(),
      goldPerRound: 0,
      interestRate: 0,
      speedBoostActive: false,
      speedBoostCooldown: 0,
      speedBoostDuration: 0,
      waveStartHealth: 100,
      perfectWaveStreak: 0,
      killStreak: 0,
      killStreakTimer: 0,
      killStreakActive: false
    };
    
    baseTowerStats = createMockTowerStats();
    upgradeSystem = new UpgradeSystem(gameState, baseTowerStats);
  });

  describe('upgrade costs', () => {
    it('should calculate initial upgrade costs correctly', () => {
      expect(upgradeSystem.getUpgradeCost('damage')).toBe(20);
      expect(upgradeSystem.getUpgradeCost('fireRate')).toBe(40);
      expect(upgradeSystem.getUpgradeCost('range')).toBe(35);
    });

    it('should scale costs with upgrade level', () => {
      upgradeSystem.purchaseUpgrade('damage');
      expect(upgradeSystem.getUpgradeCost('damage')).toBe(30); // 20 * 1.5
      
      upgradeSystem.purchaseUpgrade('damage');
      expect(upgradeSystem.getUpgradeCost('damage')).toBe(45); // 20 * 1.5^2
    });
  });

  describe('purchasing upgrades', () => {
    it('should deduct gold when purchasing', () => {
      const initialGold = gameState.gold;
      upgradeSystem.purchaseUpgrade('damage');
      
      expect(gameState.gold).toBe(initialGold - 20);
    });

    it('should not purchase if insufficient gold', () => {
      gameState.gold = 10;
      const result = upgradeSystem.purchaseUpgrade('damage');
      
      expect(result).toBe(false);
      expect(gameState.gold).toBe(10);
    });

    it('should update max health when purchasing health upgrade', () => {
      const initialMaxHealth = gameState.maxHealth;
      upgradeSystem.purchaseUpgrade('maxHealth');
      
      expect(gameState.maxHealth).toBe(initialMaxHealth + 20);
      expect(gameState.health).toBe(initialMaxHealth + 20);
    });
  });

  describe('stats calculation', () => {
    it('should not mutate base tower stats', () => {
      const originalDamage = baseTowerStats.damage;
      
      upgradeSystem.purchaseUpgrade('damage');
      const currentStats = upgradeSystem.getCurrentTowerStats();
      
      expect(baseTowerStats.damage).toBe(originalDamage); // Base unchanged
      expect(currentStats.damage).toBe(originalDamage + 5); // Current increased
    });

    it('should calculate cumulative upgrades correctly', () => {
      // Purchase multiple upgrades
      upgradeSystem.purchaseUpgrade('damage'); // +5
      upgradeSystem.purchaseUpgrade('damage'); // +5
      upgradeSystem.purchaseUpgrade('fireRate'); // +0.5
      upgradeSystem.purchaseUpgrade('range'); // +25
      
      const stats = upgradeSystem.getCurrentTowerStats();
      
      expect(stats.damage).toBe(baseTowerStats.damage + 10);
      expect(stats.fireRate).toBe(baseTowerStats.fireRate + 0.5);
      expect(stats.range).toBe(baseTowerStats.range + 25);
    });

    it('should return a new stats object each time', () => {
      const stats1 = upgradeSystem.getCurrentTowerStats();
      const stats2 = upgradeSystem.getCurrentTowerStats();
      
      expect(stats1).not.toBe(stats2);
      expect(stats1).toEqual(stats2);
    });
  });

  describe('mini upgrades', () => {
    it('should handle mini upgrade purchases', () => {
      const result = upgradeSystem.purchaseMiniUpgrade('sharpAmmo');
      
      expect(result).toBe(true);
      expect(gameState.gold).toBe(1000 - 15);
    });

    it('should apply mini upgrade effects to stats', () => {
      upgradeSystem.purchaseMiniUpgrade('sharpAmmo'); // +2 damage
      upgradeSystem.purchaseMiniUpgrade('quickShot'); // +0.2 fire rate
      
      const stats = upgradeSystem.getCurrentTowerStats();
      
      expect(stats.damage).toBe(baseTowerStats.damage + 2);
      expect(stats.fireRate).toBe(baseTowerStats.fireRate + 0.2);
    });

    it('should scale mini upgrade costs', () => {
      expect(upgradeSystem.getMiniUpgradeCost('sharpAmmo')).toBe(15);
      
      upgradeSystem.purchaseMiniUpgrade('sharpAmmo');
      expect(upgradeSystem.getMiniUpgradeCost('sharpAmmo')).toBe(19); // 15 * 1.3
    });
  });

  describe('upgrade levels tracking', () => {
    it('should track upgrade levels correctly', () => {
      upgradeSystem.purchaseUpgrade('damage');
      upgradeSystem.purchaseUpgrade('damage');
      upgradeSystem.purchaseUpgrade('fireRate');
      
      const levels = upgradeSystem.getUpgradeLevels();
      
      expect(levels.damage).toBe(2);
      expect(levels.fireRate).toBe(1);
      expect(levels.range).toBe(0);
    });
  });
});