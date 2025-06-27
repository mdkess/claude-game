import { GameState, TowerStats, UpgradeLevel, MiniUpgradeLevel, MiniUpgradeType } from '../types';

export class UpgradeSystem {
  private gameState: GameState;
  private towerStats: TowerStats;
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
    damage: 1.5,
    fireRate: 1.5,
    maxHealth: 1.5,
    healthRegen: 2,
    range: 1.5,
    goldPerRound: 1.6,  // Reduced from 1.8
    interest: 1.8       // Reduced from 2.0
  };
  
  constructor(gameState: GameState, towerStats: TowerStats) {
    this.gameState = gameState;
    this.towerStats = towerStats;
  }
  
  getUpgradeCost(type: keyof UpgradeLevel): number {
    const level = this.upgradeLevels[type];
    const baseCost = this.baseCosts[type];
    const scaling = this.costScaling[type];
    
    return Math.floor(baseCost * Math.pow(scaling, level));
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
        this.towerStats.damage += 5;
        break;
      case 'fireRate':
        this.towerStats.fireRate += 0.5;
        break;
      case 'maxHealth':
        this.gameState.maxHealth += 20;
        this.gameState.health += 20;
        break;
      case 'healthRegen':
        // Health regen handled in game update loop
        break;
      case 'range':
        this.towerStats.range += 25;
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
    return this.upgradeLevels.healthRegen;
  }
  
  getUpgradeLevels(): UpgradeLevel {
    return { ...this.upgradeLevels };
  }
  
  // Mini-upgrade methods
  getMiniUpgradeCost(type: MiniUpgradeType): number {
    const level = this.miniUpgradeLevels[type];
    const baseCost = this.miniUpgradeCosts[type];
    // Mini upgrades scale more gently
    return Math.floor(baseCost * Math.pow(1.3, level));
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
        this.towerStats.fireRate += 0.2; // +10% fire rate
        break;
      case 'sharpAmmo':
        this.towerStats.damage += 2;
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
    // Applied when tower stats are recalculated
    this.towerStats.fireRate += this.miniUpgradeLevels.quickShot * 0.2;
    this.towerStats.damage += this.miniUpgradeLevels.sharpAmmo * 2;
    // Health is applied immediately, not here
  }
  
  getCurrentTowerStats(): TowerStats {
    return { ...this.towerStats };
  }
}