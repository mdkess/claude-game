import { UpgradeStrategy, SimulatorMetrics } from './types';
import { GameState, UpgradeType } from '../game/types';

/**
 * Always buys the cheapest available upgrade
 */
export class CheapestStrategy implements UpgradeStrategy {
  name = 'Cheapest First';
  
  update(
    gameState: GameState,
    upgradeCosts: Record<UpgradeType, number>,
    _metrics: SimulatorMetrics
  ): UpgradeType | null {
    const affordableUpgrades = (Object.keys(upgradeCosts) as UpgradeType[])
      .filter(type => gameState.gold >= upgradeCosts[type])
      .sort((a, b) => upgradeCosts[a] - upgradeCosts[b]);
    
    return affordableUpgrades[0] || null;
  }
}

/**
 * Focuses on damage upgrades
 */
export class DamageFocusStrategy implements UpgradeStrategy {
  name = 'Damage Focus';
  
  update(
    gameState: GameState,
    upgradeCosts: Record<UpgradeType, number>,
    _metrics: SimulatorMetrics
  ): UpgradeType | null {
    // Priority order: damage > fireRate > range > maxHealth > healthRegen
    const priorityOrder: UpgradeType[] = ['damage', 'fireRate', 'range', 'maxHealth', 'healthRegen'];
    
    for (const upgrade of priorityOrder) {
      if (gameState.gold >= upgradeCosts[upgrade]) {
        return upgrade;
      }
    }
    
    return null;
  }
}

/**
 * Tries to balance all upgrades evenly
 */
export class BalancedStrategy implements UpgradeStrategy {
  name = 'Balanced';
  
  update(
    gameState: GameState,
    upgradeCosts: Record<UpgradeType, number>,
    _metrics: SimulatorMetrics
  ): UpgradeType | null {
    if (!gameState.upgradeLevels) return null;
    
    // Find the upgrade with the lowest level that we can afford
    const affordableUpgrades = (Object.keys(upgradeCosts) as UpgradeType[])
      .filter(type => gameState.gold >= upgradeCosts[type])
      .sort((a, b) => (gameState.upgradeLevels![a] || 0) - (gameState.upgradeLevels![b] || 0));
    
    return affordableUpgrades[0] || null;
  }
}

/**
 * Focuses on survivability (health and regen)
 */
export class TankStrategy implements UpgradeStrategy {
  name = 'Tank';
  
  update(
    gameState: GameState,
    upgradeCosts: Record<UpgradeType, number>,
    _metrics: SimulatorMetrics
  ): UpgradeType | null {
    // Priority order: maxHealth > healthRegen > damage > range > fireRate
    const priorityOrder: UpgradeType[] = ['maxHealth', 'healthRegen', 'damage', 'range', 'fireRate'];
    
    for (const upgrade of priorityOrder) {
      if (gameState.gold >= upgradeCosts[upgrade]) {
        return upgrade;
      }
    }
    
    return null;
  }
}

/**
 * Adaptive strategy that changes based on game state
 */
export class AdaptiveStrategy implements UpgradeStrategy {
  name = 'Adaptive';
  
  update(
    gameState: GameState,
    upgradeCosts: Record<UpgradeType, number>,
    _metrics: SimulatorMetrics
  ): UpgradeType | null {
    if (!gameState.upgradeLevels) return null;
    
    // If health is low, prioritize health/regen
    const healthPercent = gameState.health / gameState.maxHealth;
    if (healthPercent < 0.3) {
      if (gameState.gold >= upgradeCosts.maxHealth) return 'maxHealth';
      if (gameState.gold >= upgradeCosts.healthRegen) return 'healthRegen';
    }
    
    // If we have low damage output compared to wave, prioritize damage
    const damageLevel = gameState.upgradeLevels.damage || 0;
    const fireRateLevel = gameState.upgradeLevels.fireRate || 0;
    const effectiveDamageLevel = damageLevel + fireRateLevel * 0.5;
    
    if (effectiveDamageLevel < gameState.wave * 2) {
      if (gameState.gold >= upgradeCosts.damage) return 'damage';
      if (gameState.gold >= upgradeCosts.fireRate) return 'fireRate';
    }
    
    // Otherwise, go balanced
    const affordableUpgrades = (Object.keys(upgradeCosts) as UpgradeType[])
      .filter(type => gameState.gold >= upgradeCosts[type])
      .sort((a, b) => (gameState.upgradeLevels![a] || 0) - (gameState.upgradeLevels![b] || 0));
    
    return affordableUpgrades[0] || null;
  }
}

/**
 * Greedy strategy that saves up for expensive upgrades
 */
export class GreedyStrategy implements UpgradeStrategy {
  name = 'Greedy';
  private targetUpgrade: UpgradeType | null = null;
  
  update(
    gameState: GameState,
    upgradeCosts: Record<UpgradeType, number>,
    _metrics: SimulatorMetrics
  ): UpgradeType | null {
    // If we don't have a target, pick the most expensive upgrade we don't have many levels in
    if (!this.targetUpgrade || !gameState.upgradeLevels) {
      const upgrades = (Object.keys(upgradeCosts) as UpgradeType[])
        .filter(type => (gameState.upgradeLevels?.[type] || 0) < 10)
        .sort((a, b) => upgradeCosts[b] - upgradeCosts[a]);
      
      this.targetUpgrade = upgrades[0] || null;
    }
    
    // If we can afford our target, buy it and pick a new target
    if (this.targetUpgrade && gameState.gold >= upgradeCosts[this.targetUpgrade]) {
      const purchased = this.targetUpgrade;
      this.targetUpgrade = null;
      return purchased;
    }
    
    // Otherwise, save gold
    return null;
  }
}

/**
 * Focuses on economic upgrades early to snowball
 */
export class EconomicStrategy implements UpgradeStrategy {
  name = 'Economic Focus';
  
  update(
    gameState: GameState,
    upgradeCosts: Record<UpgradeType, number>,
    _metrics: SimulatorMetrics
  ): UpgradeType | null {
    const levels = gameState.upgradeLevels || {
      damage: 0,
      fireRate: 0,
      maxHealth: 0,
      healthRegen: 0,
      range: 0,
      goldPerRound: 0,
      interest: 0
    };
    
    // Early game: Focus on economic upgrades
    if (gameState.wave < 10) {
      // Priority: interest > goldPerRound > damage > maxHealth
      const earlyPriority: UpgradeType[] = ['interest', 'goldPerRound', 'damage', 'maxHealth', 'fireRate'];
      
      for (const upgrade of earlyPriority) {
        if (gameState.gold >= upgradeCosts[upgrade]) {
          // Limit economic upgrades to reasonable levels early
          if ((upgrade === 'interest' && levels.interest < 3) ||
              (upgrade === 'goldPerRound' && levels.goldPerRound < 4) ||
              (upgrade !== 'interest' && upgrade !== 'goldPerRound')) {
            return upgrade;
          }
        }
      }
    } else {
      // Mid/late game: Balance defense and offense
      const latePriority: UpgradeType[] = ['damage', 'maxHealth', 'fireRate', 'range', 'goldPerRound', 'interest', 'healthRegen'];
      
      for (const upgrade of latePriority) {
        if (gameState.gold >= upgradeCosts[upgrade]) {
          return upgrade;
        }
      }
    }
    
    return null;
  }
}

// Export all strategies
export const strategies = {
  cheapest: new CheapestStrategy(),
  damage: new DamageFocusStrategy(),
  balanced: new BalancedStrategy(),
  tank: new TankStrategy(),
  adaptive: new AdaptiveStrategy(),
  greedy: new GreedyStrategy(),
  economic: new EconomicStrategy()
};