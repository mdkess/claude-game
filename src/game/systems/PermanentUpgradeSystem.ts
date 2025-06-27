import { PermanentUpgrades } from '../types';

export interface PermanentUpgradeInfo {
  name: string;
  description: string;
  effect: string;
  maxLevel: number;
  baseCost: number;
  costScaling: number;
}

export type PermanentUpgradeType = keyof PermanentUpgrades;

export class PermanentUpgradeSystem {
  private readonly upgradeInfo: Record<PermanentUpgradeType, PermanentUpgradeInfo> = {
    startingDamage: {
      name: 'Starting Damage',
      description: 'Increase tower starting damage',
      effect: '+2 damage per level',
      maxLevel: 10,
      baseCost: 10,
      costScaling: 1.5
    },
    startingFireRate: {
      name: 'Starting Fire Rate',
      description: 'Increase tower starting fire rate',
      effect: '+0.2 shots/s per level',
      maxLevel: 10,
      baseCost: 10,
      costScaling: 1.5
    },
    startingHealth: {
      name: 'Starting Health',
      description: 'Increase starting health',
      effect: '+10 HP per level',
      maxLevel: 10,
      baseCost: 8,
      costScaling: 1.5
    },
    goldMultiplier: {
      name: 'Gold Multiplier',
      description: 'Increase gold earned from enemies',
      effect: '+10% gold per level',
      maxLevel: 5,
      baseCost: 20,
      costScaling: 2
    },
    essenceGain: {
      name: 'Essence Gain',
      description: 'Increase essence earned on game over',
      effect: '+10% essence per level',
      maxLevel: 5,
      baseCost: 30,
      costScaling: 2
    },
    multiShot: {
      name: 'Multi-shot',
      description: 'Chance to fire multiple projectiles',
      effect: '+5% chance per level',
      maxLevel: 10,
      baseCost: 15,
      costScaling: 1.7
    },
    bounce: {
      name: 'Bounce',
      description: 'Chance for projectiles to bounce to nearby enemies',
      effect: '+5% chance per level',
      maxLevel: 10,
      baseCost: 15,
      costScaling: 1.7
    }
  };

  private readonly upgradesByCategory: Record<string, PermanentUpgradeType[]> = {
    offensive: ['startingDamage', 'startingFireRate', 'multiShot', 'bounce'],
    defensive: ['startingHealth'],
    economic: ['goldMultiplier', 'essenceGain']
  };

  /**
   * Get upgrade info for a specific type
   */
  getUpgradeInfo(type: PermanentUpgradeType): PermanentUpgradeInfo {
    return this.upgradeInfo[type];
  }

  /**
   * Get all upgrade info
   */
  getAllUpgradeInfo(): Record<PermanentUpgradeType, PermanentUpgradeInfo> {
    return this.upgradeInfo;
  }

  /**
   * Get upgrades by category
   */
  getUpgradesByCategory(category: string): PermanentUpgradeType[] {
    return this.upgradesByCategory[category] || [];
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    return Object.keys(this.upgradesByCategory);
  }

  /**
   * Get the cost for a specific upgrade level
   */
  getUpgradeCost(type: PermanentUpgradeType, currentLevel: number): number {
    const info = this.upgradeInfo[type];
    
    // Adjust for multiplier upgrades that start at 1.0
    const level = (type === 'goldMultiplier' || type === 'essenceGain') 
      ? currentLevel - 1 
      : currentLevel;
    
    if (level >= info.maxLevel) return -1; // Max level reached
    
    return Math.floor(info.baseCost * Math.pow(info.costScaling, level));
  }

  /**
   * Check if an upgrade is at max level
   */
  isMaxLevel(type: PermanentUpgradeType, permanentUpgrades: PermanentUpgrades): boolean {
    const info = this.upgradeInfo[type];
    const currentLevel = (type === 'goldMultiplier' || type === 'essenceGain') 
      ? permanentUpgrades[type] - 1 
      : permanentUpgrades[type];
    
    return currentLevel >= info.maxLevel;
  }

  /**
   * Get the display level for an upgrade (handles multipliers)
   */
  getCurrentLevel(type: PermanentUpgradeType, permanentUpgrades: PermanentUpgrades): number {
    if (type === 'goldMultiplier' || type === 'essenceGain') {
      return Math.round((permanentUpgrades[type] - 1) * 10) / 10;
    }
    return permanentUpgrades[type];
  }

  /**
   * Apply permanent upgrades to initial game values
   */
  applyPermanentUpgrades(baseDamage: number, baseFireRate: number, baseHealth: number, permanentUpgrades: PermanentUpgrades) {
    return {
      damage: baseDamage + (permanentUpgrades.startingDamage * 2),
      fireRate: baseFireRate + (permanentUpgrades.startingFireRate * 0.2),
      health: baseHealth + (permanentUpgrades.startingHealth * 10),
      multiShotChance: permanentUpgrades.multiShot * 0.05,
      bounceChance: permanentUpgrades.bounce * 0.05
    };
  }
}

// Create a singleton instance for UI components to use
export const permanentUpgradeSystem = new PermanentUpgradeSystem();