import { GameCore } from '../game/core/GameCore';
import { SimulatorMetrics } from './types';
import { EnemyKilledEvent, TowerDamagedEvent } from '../game/core/types';
import { PermanentUpgrades, UpgradeType } from '../game/types';
import { Enemy } from '../game/entities/Enemy';
import { ESSENCE_CONVERSION_RATE } from '../game/core/constants';

/**
 * Headless game for simulation - extends GameCore with metrics tracking
 */
export class HeadlessGame extends GameCore {
  public metrics: SimulatorMetrics;
  
  constructor(permanentUpgrades?: PermanentUpgrades) {
    super(permanentUpgrades);
    
    // Initialize metrics
    this.metrics = {
      finalWave: 0,
      survivalTime: 0,
      totalGoldEarned: 0,
      totalGoldSpent: 0,
      goldEfficiency: 0,
      totalEnemiesKilled: 0,
      enemiesKilledByType: {},
      damageDealtTotal: 0,
      damageTakenTotal: 0,
      damageTakenByType: {},
      essenceEarned: 0,
      upgradePurchases: [],
      maxHealth: this.gameState.maxHealth,
      finalStats: {
        damage: this.tower.stats.damage,
        fireRate: this.tower.stats.fireRate,
        range: this.tower.stats.range,
        health: this.gameState.maxHealth,
        healthRegen: 0
      }
    };
  }
  
  protected onEnemyKilled(data: EnemyKilledEvent, goldEarned: number): void {
    const { enemy } = data;
    
    // Update metrics
    this.metrics.totalGoldEarned += goldEarned;
    this.metrics.totalEnemiesKilled++;
    this.metrics.enemiesKilledByType[enemy.type] = (this.metrics.enemiesKilledByType[enemy.type] || 0) + 1;
  }
  
  protected onTowerDamaged(data: TowerDamagedEvent): void {
    this.metrics.damageTakenTotal += data.damage;
    
    // Track damage by enemy type if available
    const dataWithType = data as TowerDamagedEvent & { enemyType?: string };
    if (dataWithType.enemyType) {
      const enemyType = dataWithType.enemyType;
      this.metrics.damageTakenByType[enemyType] = (this.metrics.damageTakenByType[enemyType] || 0) + data.damage;
    }
  }
  
  protected onDamageDealt(damage: number, _enemy: Enemy): void {
    this.metrics.damageDealtTotal += damage;
  }
  
  update(deltaTime: number): void {
    super.update(deltaTime);
    
    // Update metrics
    this.metrics.survivalTime = this.gameState.survivalTime;
    this.metrics.finalWave = this.gameState.wave;
  }
  
  protected gameOver(): void {
    super.gameOver();
    
    const essence = Math.floor(this.gameState.score * ESSENCE_CONVERSION_RATE * this.permanentUpgrades.essenceGain);
    this.metrics.essenceEarned = essence;
    
    // Final metrics update
    this.metrics.goldEfficiency = this.metrics.totalGoldSpent > 0 
      ? this.metrics.totalGoldEarned / this.metrics.totalGoldSpent 
      : 0;
    
    this.metrics.finalStats = {
      damage: this.tower.stats.damage,
      fireRate: this.tower.stats.fireRate,
      range: this.tower.stats.range,
      health: this.gameState.maxHealth,
      healthRegen: this.upgradeSystem.getHealthRegenRate()
    };
    
    // Set death cause
    this.metrics.deathCause = 'Tower destroyed';
    this.metrics.deathTime = this.gameState.survivalTime;
  }
  
  purchaseUpgrade(type: UpgradeType): boolean {
    const cost = this.upgradeSystem.getUpgradeCost(type);
    const success = super.purchaseUpgrade(type);
    
    if (success) {
      // Track purchase
      this.metrics.totalGoldSpent += cost;
      this.metrics.upgradePurchases.push({
        time: this.gameState.survivalTime,
        upgrade: type,
        cost: cost,
        level: this.gameState.upgradeLevels?.[type] || 1
      });
    }
    
    return success;
  }
  
  getUpgradeCosts(): Record<UpgradeType, number> {
    return {
      damage: this.upgradeSystem.getUpgradeCost('damage'),
      fireRate: this.upgradeSystem.getUpgradeCost('fireRate'),
      maxHealth: this.upgradeSystem.getUpgradeCost('maxHealth'),
      healthRegen: this.upgradeSystem.getUpgradeCost('healthRegen'),
      range: this.upgradeSystem.getUpgradeCost('range'),
      goldPerRound: this.upgradeSystem.getUpgradeCost('goldPerRound'),
      interest: this.upgradeSystem.getUpgradeCost('interest')
    };
  }
}