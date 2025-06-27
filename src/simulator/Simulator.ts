import { HeadlessGame } from './HeadlessGame';
import { SimulatorConfig, SimulationResult, UpgradeStrategy } from './types';

export class Simulator {
  private config: SimulatorConfig;
  private game: HeadlessGame;
  private strategy: UpgradeStrategy;
  private lastStrategyUpdate: number = 0;
  
  constructor(config: SimulatorConfig, strategy: UpgradeStrategy) {
    this.config = config;
    this.strategy = strategy;
    this.game = new HeadlessGame(config.permanentUpgrades);
  }
  
  run(): SimulationResult {
    console.log(`\n=== Starting Simulation ===`);
    console.log(`Strategy: ${this.strategy.name}`);
    console.log(`Max Time: ${this.config.maxSimulatedTime}s`);
    console.log(`Time Step: ${this.config.timeStep}s`);
    console.log(`Strategy Update Interval: ${this.config.strategyUpdateInterval}s`);
    
    if (this.config.permanentUpgrades) {
      console.log(`Permanent Upgrades:`, this.config.permanentUpgrades);
    }
    
    console.log(`\n--- Simulation Start ---`);
    
    let simulatedTime = 0;
    let lastLogTime = 0;
    const logInterval = 10; // Log every 10 seconds of simulated time
    
    try {
      while (simulatedTime < this.config.maxSimulatedTime && !this.game.isGameOver()) {
        // Update game
        this.game.update(this.config.timeStep);
        
        // Check if we should update strategy
        if (simulatedTime - this.lastStrategyUpdate >= this.config.strategyUpdateInterval) {
          this.updateStrategy();
          this.lastStrategyUpdate = simulatedTime;
        }
        
        // Log progress
        if (this.config.logLevel !== 'none' && simulatedTime - lastLogTime >= logInterval) {
          this.logProgress(simulatedTime);
          lastLogTime = simulatedTime;
        }
        
        simulatedTime += this.config.timeStep;
      }
      
      // Log why the simulation ended
      if (this.game.isGameOver()) {
        console.log(`\n[Simulator] Game ended early - tower was destroyed at ${simulatedTime.toFixed(1)}s`);
      } else {
        console.log(`\n[Simulator] Simulation completed - reached time limit of ${this.config.maxSimulatedTime}s`);
      }
      
      // Final log
      if (this.config.logLevel !== 'none') {
        this.logProgress(simulatedTime);
      }
      
      console.log(`\n--- Simulation End ---`);
      
      const result: SimulationResult = {
        config: this.config,
        strategy: this.strategy.name,
        metrics: this.game.metrics,
        success: true
      };
      
      this.logSummary(result);
      
      return result;
      
    } catch (error) {
      console.error('Simulation error:', error);
      
      return {
        config: this.config,
        strategy: this.strategy.name,
        metrics: this.game.metrics,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  private updateStrategy() {
    const gameState = this.game.getState();
    const upgradeCosts = this.game.getUpgradeCosts();
    
    const upgrade = this.strategy.update(gameState, upgradeCosts, this.game.metrics);
    
    if (upgrade) {
      const canAfford = this.game.canAffordUpgrade(upgrade);
      if (canAfford) {
        this.game.purchaseUpgrade(upgrade);
        
        if (this.config.logLevel === 'detailed') {
          console.log(`[${gameState.survivalTime.toFixed(1)}s] Purchased ${upgrade} (Level ${gameState.upgradeLevels?.[upgrade] || 1}) for ${upgradeCosts[upgrade]}g`);
        }
      }
    }
  }
  
  private logProgress(time: number) {
    const state = this.game.getState();
    const metrics = this.game.metrics;
    // Enemy count is tracked in state
    const enemyCount = state.enemyCount || 0;
    
    console.log(
      `[${time.toFixed(1)}s] ` +
      `Wave ${state.wave} | ` +
      `Health: ${Math.ceil(state.health)}/${state.maxHealth} | ` +
      `Gold: ${state.gold} | ` +
      `Kills: ${metrics.totalEnemiesKilled} | ` +
      `Enemies: ${enemyCount} | ` +
      `Score: ${state.score}`
    );
  }
  
  private logSummary(result: SimulationResult) {
    const m = result.metrics;
    
    console.log(`\n=== Simulation Summary ===`);
    console.log(`Strategy: ${result.strategy}`);
    console.log(`Survived: ${m.survivalTime.toFixed(1)}s`);
    console.log(`Final Wave: ${m.finalWave}`);
    console.log(`Death Cause: ${m.deathCause || 'Time limit reached'}`);
    
    console.log(`\n--- Combat Stats ---`);
    console.log(`Enemies Killed: ${m.totalEnemiesKilled}`);
    console.log(`Damage Dealt: ${m.damageDealtTotal}`);
    console.log(`Damage Taken: ${m.damageTakenTotal}`);
    console.log(`Kill/Death Ratio: ${(m.damageDealtTotal / Math.max(1, m.damageTakenTotal)).toFixed(2)}`);
    
    console.log(`\n--- Economy Stats ---`);
    console.log(`Gold Earned: ${m.totalGoldEarned}`);
    console.log(`Gold Spent: ${m.totalGoldSpent}`);
    console.log(`Gold Efficiency: ${(m.goldEfficiency * 100).toFixed(1)}%`);
    console.log(`Essence Earned: ${m.essenceEarned}`);
    
    console.log(`\n--- Final Tower Stats ---`);
    console.log(`Damage: ${m.finalStats.damage}`);
    console.log(`Fire Rate: ${m.finalStats.fireRate.toFixed(1)}/s`);
    console.log(`Range: ${m.finalStats.range}`);
    console.log(`Max Health: ${m.finalStats.health}`);
    console.log(`Health Regen: ${m.finalStats.healthRegen}/s`);
    
    console.log(`\n--- Upgrade Path ---`);
    if (m.upgradePurchases.length > 0) {
      console.log(`Total Upgrades: ${m.upgradePurchases.length}`);
      
      if (this.config.logLevel === 'detailed') {
        m.upgradePurchases.forEach(up => {
          console.log(`  [${up.time.toFixed(1)}s] ${up.upgrade} -> Level ${up.level} (${up.cost}g)`);
        });
      } else {
        // Summary of upgrades
        const upgradeCounts: Record<string, number> = {};
        m.upgradePurchases.forEach(up => {
          upgradeCounts[up.upgrade] = (upgradeCounts[up.upgrade] || 0) + 1;
        });
        
        Object.entries(upgradeCounts).forEach(([upgrade, count]) => {
          console.log(`  ${upgrade}: ${count} purchases`);
        });
      }
    } else {
      console.log(`No upgrades purchased`);
    }
    
    console.log(`\n--- Enemy Breakdown ---`);
    Object.entries(m.enemiesKilledByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} killed`);
    });
    
    if (Object.keys(m.damageTakenByType).length > 0) {
      console.log(`\n--- Damage Sources ---`);
      Object.entries(m.damageTakenByType).forEach(([type, damage]) => {
        const percent = (damage / m.damageTakenTotal * 100).toFixed(1);
        console.log(`  ${type}: ${damage} damage (${percent}%)`);
      });
    }
  }
}