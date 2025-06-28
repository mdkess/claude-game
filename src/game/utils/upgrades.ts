/**
 * Utility functions for upgrade calculations
 */

/**
 * Calculate upgrade cost based on level and scaling
 * @param baseCost Base cost of the upgrade
 * @param level Current level of the upgrade
 * @param scaling Scaling factor per level (default 1.5)
 * @returns The cost for the next level
 */
export function calculateUpgradeCost(
  baseCost: number,
  level: number,
  scaling: number = 1.5
): number {
  return Math.floor(baseCost * Math.pow(scaling, level));
}

/**
 * Calculate the total cost to go from one level to another
 * @param baseCost Base cost of the upgrade
 * @param fromLevel Starting level
 * @param toLevel Target level
 * @param scaling Scaling factor per level
 * @returns Total cost to upgrade from fromLevel to toLevel
 */
export function calculateTotalUpgradeCost(
  baseCost: number,
  fromLevel: number,
  toLevel: number,
  scaling: number = 1.5
): number {
  let totalCost = 0;
  for (let level = fromLevel; level < toLevel; level++) {
    totalCost += calculateUpgradeCost(baseCost, level, scaling);
  }
  return totalCost;
}

/**
 * Calculate the maximum affordable upgrade level given current gold
 * @param baseCost Base cost of the upgrade
 * @param currentLevel Current level
 * @param availableGold Available gold
 * @param scaling Scaling factor per level
 * @returns Maximum level that can be afforded
 */
export function calculateMaxAffordableLevel(
  baseCost: number,
  currentLevel: number,
  availableGold: number,
  scaling: number = 1.5
): number {
  let level = currentLevel;
  let remainingGold = availableGold;
  
  while (true) {
    const nextCost = calculateUpgradeCost(baseCost, level, scaling);
    if (nextCost > remainingGold) break;
    remainingGold -= nextCost;
    level++;
  }
  
  return level;
}

/**
 * Apply an upgrade multiplier to a base value
 * @param baseValue Base value before upgrades
 * @param upgradeLevel Number of upgrade levels
 * @param multiplierPerLevel Value added per level
 * @returns The upgraded value
 */
export function applyUpgradeMultiplier(
  baseValue: number,
  upgradeLevel: number,
  multiplierPerLevel: number
): number {
  return baseValue + (upgradeLevel * multiplierPerLevel);
}

/**
 * Apply a percentage-based upgrade
 * @param baseValue Base value before upgrades
 * @param upgradeLevel Number of upgrade levels
 * @param percentPerLevel Percentage increase per level (e.g., 0.1 for 10%)
 * @returns The upgraded value
 */
export function applyPercentageUpgrade(
  baseValue: number,
  upgradeLevel: number,
  percentPerLevel: number
): number {
  return baseValue * (1 + upgradeLevel * percentPerLevel);
}