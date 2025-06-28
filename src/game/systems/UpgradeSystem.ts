import { GameState, TowerStats, UpgradeLevel, MiniUpgradeLevel, MiniUpgradeType } from '../types';
import { calculateUpgradeCost, applyUpgradeMultiplier } from '../utils/upgrades';
import { UPGRADE_VALUES, MINI_UPGRADE_VALUES, UPGRADE_SCALING } from '../core/constants';

export class UpgradeSystem {
  private gameState: GameState;
  private baseTowerStats: TowerStats;
  private upgradeLevels: UpgradeLevel = {
    damage: 0,
    fireRate: 0,
    maxHealth: 0,
    healthRegen: 0,
    range: 0,
    goldPerRound: 0,
    interest: 0
  };
  
  private miniUpgradeLevels: MiniUpgradeLevel = {
    quickShot: 0,
    sharpAmmo: 0,
    bandages: 0
  };
  
  private baseCosts = {
    damage: 20,
    fireRate: 40,
    maxHealth: 30,
    healthRegen: 60,
    range: 35,
    goldPerRound: 40,  // Reduced from 50
    interest: 80       // Reduced from 100
  };
  
  private miniUpgradeCosts = {
    quickShot: 10,
    sharpAmmo: 15,
    bandages: 12
  };
  
  private costScaling = {
    damage: UPGRADE_SCALING.DEFAULT,
    fireRate: UPGRADE_SCALING.DEFAULT,
    maxHealth: UPGRADE_SCALING.DEFAULT,
    healthRegen: UPGRADE_SCALING.VERY_EXPENSIVE,
    range: UPGRADE_SCALING.DEFAULT,
    goldPerRound: 1.6,  // Slightly higher than default
    interest: UPGRADE_SCALING.EXPENSIVE
  };
  
  constructor(gameState: GameState, baseTowerStats: TowerStats) {
    this.gameState = gameState;
    this.baseTowerStats = { ...baseTowerStats }; // Make a copy to avoid mutations
  }
  
  getUpgradeCost(type: keyof UpgradeLevel): number {
    const level = this.upgradeLevels[type];
    const baseCost = this.baseCosts[type];
    const scaling = this.costScaling[type];
    
    return calculateUpgradeCost(baseCost, level, scaling);
  }
  
  canAffordUpgrade(type: keyof UpgradeLevel): boolean {
    return this.gameState.gold >= this.getUpgradeCost(type);
  }
  
  purchaseUpgrade(type: keyof UpgradeLevel): boolean {
    const cost = this.getUpgradeCost(type);
    
    if (!this.canAffordUpgrade(type)) {
      return false;
    }
    
    this.gameState.gold -= cost;
    this.upgradeLevels[type]++;
    
    // Apply upgrade effects
    switch (type) {
      case 'damage':
        // Damage increase handled in getCurrentTowerStats
        break;
      case 'fireRate':
        // Fire rate increase handled in getCurrentTowerStats
        break;
      case 'maxHealth':
        this.gameState.maxHealth += UPGRADE_VALUES.HEALTH;
        this.gameState.health += UPGRADE_VALUES.HEALTH;
        break;
      case 'healthRegen':
        // Health regen handled in game update loop
        break;
      case 'range':
        // Range increase handled in getCurrentTowerStats
        break;
      case 'goldPerRound':
        // Gold per round handled in game update loop
        break;
      case 'interest':
        // Interest handled in game update loop
        break;
    }
    
    return true;
  }
  
  getHealthRegenRate(): number {
    return this.upgradeLevels.healthRegen * UPGRADE_VALUES.HEALTH_REGEN;
  }
  
  getUpgradeLevels(): UpgradeLevel {
    return { ...this.upgradeLevels };
  }
  
  // Mini-upgrade methods
  getMiniUpgradeCost(type: MiniUpgradeType): number {
    const level = this.miniUpgradeLevels[type];
    const baseCost = this.miniUpgradeCosts[type];
    // Mini upgrades scale more gently
    return calculateUpgradeCost(baseCost, level, UPGRADE_SCALING.MINI);
  }
  
  canAffordMiniUpgrade(type: MiniUpgradeType): boolean {
    return this.gameState.gold >= this.getMiniUpgradeCost(type);
  }
  
  purchaseMiniUpgrade(type: MiniUpgradeType): boolean {
    const cost = this.getMiniUpgradeCost(type);
    
    if (!this.canAffordMiniUpgrade(type)) {
      return false;
    }
    
    this.gameState.gold -= cost;
    this.miniUpgradeLevels[type]++;
    
    // Apply mini-upgrade effects
    switch (type) {
      case 'quickShot':
        // Fire rate increase handled in getCurrentTowerStats
        break;
      case 'sharpAmmo':
        // Damage increase handled in getCurrentTowerStats
        break;
      case 'bandages':
        this.gameState.maxHealth += 10;
        this.gameState.health += 10;
        break;
    }
    
    return true;
  }
  
  getMiniUpgradeLevels(): MiniUpgradeLevel {
    return { ...this.miniUpgradeLevels };
  }
  
  // Apply all mini-upgrade bonuses to base stats
  applyMiniUpgradeBonuses(): void {
    // This method is no longer needed - bonuses are calculated in getCurrentTowerStats
  }
  
  getCurrentTowerStats(): TowerStats {
    // Calculate current stats based on base stats and upgrades
    const stats = { ...this.baseTowerStats };
    
    // Apply regular upgrades using utility functions
    stats.damage = applyUpgradeMultiplier(stats.damage, this.upgradeLevels.damage, UPGRADE_VALUES.DAMAGE);
    stats.fireRate = applyUpgradeMultiplier(stats.fireRate, this.upgradeLevels.fireRate, UPGRADE_VALUES.FIRE_RATE);
    stats.range = applyUpgradeMultiplier(stats.range, this.upgradeLevels.range, UPGRADE_VALUES.RANGE);
    
    // Apply mini-upgrades
    stats.damage = applyUpgradeMultiplier(stats.damage, this.miniUpgradeLevels.sharpAmmo, MINI_UPGRADE_VALUES.SHARP_AMMO);
    stats.fireRate = applyUpgradeMultiplier(stats.fireRate, this.miniUpgradeLevels.quickShot, MINI_UPGRADE_VALUES.QUICK_SHOT);
    
    return stats;
  }
}