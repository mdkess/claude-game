import { GameState, PermanentUpgrades, UpgradeLevel } from '../types';
import { Tower } from '../entities/Tower';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { WaveSystem } from '../systems/WaveSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import { PermanentUpgradeSystem } from '../systems/PermanentUpgradeSystem';
import { TemporaryEffects } from '../systems/TemporaryEffects';
import { gameEvents, GameEvents } from './EventEmitter';
import { EnemyKilledEvent, TowerDamagedEvent } from './types';
import { 
  GAME_CENTER,
  DEFAULT_HEALTH,
  ESSENCE_CONVERSION_RATE,
  STARTING_GOLD,
  SPEED_BOOST_DURATION,
  SPEED_BOOST_COOLDOWN,
  SPEED_BOOST_MULTIPLIER,
  PERFECT_WAVE_BONUS_MULTIPLIER,
  KILL_STREAK_THRESHOLD,
  KILL_STREAK_TIME_WINDOW,
  KILL_STREAK_DAMAGE_BONUS,
  KILL_STREAK_DURATION,
  UPGRADE_VALUES
} from './constants';

/**
 * Core game logic without any rendering
 */
export class GameCore {
  // Game state
  protected gameState: GameState;
  protected permanentUpgrades: PermanentUpgrades;
  
  // Entities
  protected tower: Tower;
  protected projectiles: Projectile[] = [];
  
  // Systems
  protected waveSystem: WaveSystem;
  protected combatSystem: CombatSystem;
  protected upgradeSystem: UpgradeSystem;
  protected permanentUpgradeSystem: PermanentUpgradeSystem;
  protected temporaryEffects: TemporaryEffects;
  
  // Event handlers
  private eventHandlers = {
    enemyKilled: null as ((data: EnemyKilledEvent) => void) | null,
    towerDamaged: null as ((data: TowerDamagedEvent) => void) | null,
    waveCompleted: null as ((data: { wave: number; bonusGold: number }) => void) | null,
    projectileSpawned: null as ((projectile: Projectile) => void) | null,
  };
  
  // Callbacks
  onGameOver?: (score: number, essence: number) => void;
  
  constructor(permanentUpgrades?: PermanentUpgrades) {
    this.permanentUpgrades = permanentUpgrades || {
      startingDamage: 0,
      startingFireRate: 0,
      startingHealth: 0,
      goldMultiplier: 1,
      essenceGain: 1,
      multiShot: 0,
      bounce: 0
    };
    
    // Initialize permanent upgrade system
    this.permanentUpgradeSystem = new PermanentUpgradeSystem();
    
    // Initialize tower
    const towerStats = this.getInitialTowerStats();
    this.tower = new Tower(GAME_CENTER, GAME_CENTER, towerStats);
    
    // Initialize game state
    const upgradedStats = this.permanentUpgradeSystem.applyPermanentUpgrades(
      10, // base damage (not used here)
      2,  // base fire rate (not used here)
      DEFAULT_HEALTH,
      this.permanentUpgrades
    );
    const baseHealth = upgradedStats.health;
    this.gameState = {
      // Core state
      health: baseHealth,
      maxHealth: baseHealth,
      gold: STARTING_GOLD,
      score: 0,
      wave: 1,
      survivalTime: 0,
      isPaused: false,
      isGameOver: false,
      speedMultiplier: 1,
      // Tower state
      towerStats: { ...towerStats },
      upgradeLevels: {
        damage: 0,
        fireRate: 0,
        maxHealth: 0,
        healthRegen: 0,
        range: 0,
        goldPerRound: 0,
        interest: 0
      },
      // Ability state
      speedBoostActive: false,
      speedBoostCooldown: 0,
      speedBoostDuration: 0,
      // Kill streak state
      killStreak: 0,
      killStreakTimer: 0,
      killStreakActive: false,
      // Wave tracking state
      waveStartHealth: baseHealth,
      perfectWaveStreak: 0,
      enemyCount: 0,
      waveState: {
        currentWave: 1,
        isWaveActive: false,
        enemiesRemaining: {},
        totalEnemiesRemaining: 0,
        nextWaveTimer: 0,
        composition: {
          enemies: []
        }
      },
      // Economic state
      goldPerRound: 0,
      interestRate: 0,
      lastInterestTime: 0,
      healthRegen: 0
    };
    
    // Initialize systems
    this.waveSystem = new WaveSystem();
    this.combatSystem = new CombatSystem(this.tower);
    this.upgradeSystem = new UpgradeSystem(this.gameState, towerStats);
    this.temporaryEffects = new TemporaryEffects();
    
    this.setupEventListeners();
  }
  
  protected getInitialTowerStats() {
    const baseStats = {
      damage: 10,
      fireRate: 2,
      range: 200,
      projectileSpeed: 300
    };
    
    const upgradedStats = this.permanentUpgradeSystem.applyPermanentUpgrades(
      baseStats.damage,
      baseStats.fireRate,
      DEFAULT_HEALTH,
      this.permanentUpgrades
    );
    
    return {
      damage: upgradedStats.damage,
      fireRate: upgradedStats.fireRate,
      range: baseStats.range,
      projectileSpeed: baseStats.projectileSpeed,
      multiShotCount: upgradedStats.multiShotCount,
      bounceCount: upgradedStats.bounceCount
    };
  }
  
  private setupEventListeners() {
    // Create handlers and store them
    this.eventHandlers.enemyKilled = (data: EnemyKilledEvent) => {
      const { enemy } = data;
      const goldEarned = Math.floor(enemy.reward * this.permanentUpgrades.goldMultiplier);
      this.gameState.gold += goldEarned;
      this.gameState.score += enemy.reward;
      
      // Update kill streak
      this.updateKillStreak();
      
      this.onEnemyKilled(data, goldEarned);
    };
    
    this.eventHandlers.towerDamaged = (data: TowerDamagedEvent) => {
      this.gameState.health -= data.damage;
      this.onTowerDamaged(data);
      
      if (this.gameState.health <= 0) {
        this.gameOver();
      }
    };
    
    this.eventHandlers.waveCompleted = (data: { wave: number; bonusGold: number }) => {
      // Check for perfect wave
      let finalBonusGold = data.bonusGold;
      if (this.gameState.health === this.gameState.waveStartHealth) {
        // Perfect wave - no damage taken!
        this.gameState.perfectWaveStreak = (this.gameState.perfectWaveStreak || 0) + 1;
        finalBonusGold = Math.floor(data.bonusGold * PERFECT_WAVE_BONUS_MULTIPLIER);
      } else {
        this.gameState.perfectWaveStreak = 0;
      }
      
      // Add gold per round bonus
      const goldPerRoundBonus = this.gameState.goldPerRound || 0;
      finalBonusGold += goldPerRoundBonus;
      
      this.gameState.gold += finalBonusGold;
      
      // Reset wave start health for next wave
      this.gameState.waveStartHealth = this.gameState.health;
    };
    
    this.eventHandlers.projectileSpawned = (projectile: Projectile) => {
      this.projectiles.push(projectile);
    };
    
    // Register handlers
    gameEvents.on(GameEvents.EnemyKilled, this.eventHandlers.enemyKilled);
    gameEvents.on(GameEvents.TowerDamaged, this.eventHandlers.towerDamaged);
    gameEvents.on(GameEvents.WaveCompleted, this.eventHandlers.waveCompleted);
    gameEvents.on(GameEvents.ProjectileSpawned, this.eventHandlers.projectileSpawned);
  }
  
  // Hook methods for subclasses to override
  protected onEnemyKilled(_data: EnemyKilledEvent, _goldEarned: number): void {
    // Subclasses can override to add visual effects, metrics tracking, etc.
  }
  
  protected onTowerDamaged(_data: TowerDamagedEvent): void {
    // Subclasses can override to add visual effects, metrics tracking, etc.
  }
  
  protected onDamageDealt(_damage: number, _enemy: Enemy): void {
    // Subclasses can override to track damage dealt
  }
  
  update(deltaTime: number): void {
    if (this.gameState.isGameOver || this.gameState.isPaused) return;
    
    // Apply speed multiplier
    const adjustedDeltaTime = deltaTime * (this.gameState.speedMultiplier || 1);
    
    // Update survival time
    this.gameState.survivalTime += adjustedDeltaTime;
    
    // Update temporary effects
    this.temporaryEffects.update(adjustedDeltaTime);
    
    // Update speed boost ability
    this.updateSpeedBoost(adjustedDeltaTime);
    
    // Update kill streak timer
    this.updateKillStreakTimer(adjustedDeltaTime);
    
    // Apply interest
    this.applyInterest(adjustedDeltaTime);
    
    // Health regeneration
    const regenRate = this.upgradeSystem.getHealthRegenRate();
    if (regenRate > 0 && this.gameState.health < this.gameState.maxHealth) {
      this.gameState.health = Math.min(
        this.gameState.maxHealth,
        this.gameState.health + (regenRate * adjustedDeltaTime)
      );
    }
    
    // Update systems
    this.waveSystem.update(adjustedDeltaTime);
    const enemies = this.waveSystem.getActiveEnemies();
    this.combatSystem.update(adjustedDeltaTime, enemies, this.projectiles);
    
    // Update projectiles (skip destroyed ones as safety check)
    this.projectiles.forEach(p => {
      if (!p.isDestroyed) {
        p.update(adjustedDeltaTime, enemies);
      }
    });
    
    // Check collisions
    this.checkCollisions(enemies);
    
    // Clean up dead entities and return to pool
    const activeProjectiles: Projectile[] = [];
    const seenIds = new Set<number>();
    const duplicateIds = new Set<number>();
    
    this.projectiles.forEach(p => {
      if (seenIds.has(p.id)) {
        duplicateIds.add(p.id);
        // Skip duplicates - don't add to active array
        return;
      }
      seenIds.add(p.id);
      
      if (p.isDestroyed) {
        this.combatSystem.releaseProjectile(p);
      } else {
        activeProjectiles.push(p);
      }
    });
    this.projectiles = activeProjectiles;
    
    // Only log if we actually found duplicates (keep this for debugging edge cases)
    if (duplicateIds.size > 0) {
      console.warn(`[GameCore] Removed ${duplicateIds.size} duplicate projectiles`);
    }
    
    // Update game state from wave system
    this.gameState.wave = this.waveSystem.getCurrentWave();
  }
  
  private checkCollisions(enemies: Enemy[]) {
    // Projectile-enemy collisions
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      
      if (projectile.isDestroyed) {
        continue;
      }
      
      for (const enemy of enemies) {
        if (projectile.checkCollision(enemy)) {
          enemy.takeDamage(projectile.damage);
          this.onDamageDealt(projectile.damage, enemy);
          projectile.onHit(enemy, enemies);
          break;
        }
      }
    }
    
    // Enemy-tower collisions
    for (const enemy of enemies) {
      if (!enemy.isDead && enemy.isActive && enemy.checkTowerCollision(this.tower)) {
        gameEvents.emit(GameEvents.TowerDamaged, { 
          damage: enemy.damage,
          enemyType: enemy.type 
        } as TowerDamagedEvent & { enemyType: string });
        enemy.takeDamage(enemy.health);
      }
    }
  }
  
  protected gameOver() {
    if (this.gameState.isGameOver) return;
    
    this.gameState.isGameOver = true;
    this.gameState.health = 0;
    
    const essence = Math.floor(this.gameState.score * ESSENCE_CONVERSION_RATE * this.permanentUpgrades.essenceGain);
    
    // Clean up
    this.waveSystem.reset();
    
    // Clear all projectiles
    this.projectiles = [];
    
    if (this.onGameOver) {
      this.onGameOver(this.gameState.score, essence);
    }
  }
  
  // Public API
  pause() {
    this.gameState.isPaused = true;
  }
  
  resume() {
    this.gameState.isPaused = false;
  }
  
  toggleSpeed() {
    this.gameState.speedMultiplier = this.gameState.speedMultiplier === 1 ? 2 : 1;
  }
  
  getState() {
    const waveState = this.waveSystem.getWaveState();
    return { 
      ...this.gameState,
      enemyCount: this.waveSystem.getActiveEnemies().length,
      towerStats: { ...this.tower.stats },
      healthRegen: this.upgradeSystem.getHealthRegenRate(),
      upgradeLevels: this.upgradeSystem.getUpgradeLevels(),
      waveState: {
        currentWave: waveState.currentWave,
        isWaveActive: waveState.isWaveActive,
        enemiesRemaining: Object.fromEntries(waveState.enemiesRemaining),
        totalEnemiesRemaining: waveState.totalEnemiesRemaining,
        nextWaveTimer: waveState.nextWaveTimer,
        composition: waveState.composition
      }
    };
  }
  
  getUpgradeCost(type: keyof UpgradeLevel): number {
    return this.upgradeSystem.getUpgradeCost(type);
  }
  
  canAffordUpgrade(type: keyof UpgradeLevel): boolean {
    return this.upgradeSystem.canAffordUpgrade(type);
  }
  
  purchaseUpgrade(type: keyof UpgradeLevel): boolean {
    const success = this.upgradeSystem.purchaseUpgrade(type);
    if (success) {
      // Get the updated stats from the upgrade system
      const upgradedStats = this.upgradeSystem.getCurrentTowerStats();
      this.tower.updateStats(upgradedStats);
      
      // Update economic values
      if (type === 'goldPerRound') {
        const level = this.upgradeSystem.getUpgradeLevels().goldPerRound;
        this.gameState.goldPerRound = level * UPGRADE_VALUES.GOLD_PER_ROUND;
      } else if (type === 'interest') {
        const level = this.upgradeSystem.getUpgradeLevels().interest;
        this.gameState.interestRate = level * UPGRADE_VALUES.INTEREST_RATE;
      }
    }
    return success;
  }
  
  isGameOver(): boolean {
    return this.gameState.isGameOver;
  }
  
  getActiveEnemies(): Enemy[] {
    return this.waveSystem.getActiveEnemies();
  }
  
  getTower(): Tower {
    return this.tower;
  }
  
  getProjectiles(): Projectile[] {
    return this.projectiles;
  }
  
  // Ability methods
  private updateSpeedBoost(deltaTime: number): void {
    if (this.gameState.speedBoostCooldown > 0) {
      this.gameState.speedBoostCooldown -= deltaTime;
    }
    
    if (this.gameState.speedBoostActive && this.gameState.speedBoostDuration > 0) {
      this.gameState.speedBoostDuration -= deltaTime;
      if (this.gameState.speedBoostDuration <= 0) {
        this.deactivateSpeedBoost();
      }
    }
  }
  
  activateSpeedBoost(): boolean {
    if (this.gameState.speedBoostCooldown > 0 || this.gameState.speedBoostActive) {
      return false; // Still on cooldown or already active
    }
    
    this.gameState.speedBoostActive = true;
    this.gameState.speedBoostDuration = SPEED_BOOST_DURATION;
    this.gameState.speedBoostCooldown = SPEED_BOOST_COOLDOWN;
    
    // Apply speed boost to tower using temporary effects
    const originalFireRate = this.tower.stats.fireRate;
    const boostedFireRate = originalFireRate * SPEED_BOOST_MULTIPLIER;
    this.tower.stats.fireRate = boostedFireRate;
    
    this.temporaryEffects.startEffect(
      'speedBoost',
      originalFireRate,
      boostedFireRate,
      SPEED_BOOST_DURATION,
      () => {
        // Restore original fire rate when effect expires
        this.tower.stats.fireRate = originalFireRate;
        this.gameState.speedBoostActive = false;
        this.gameState.speedBoostDuration = 0;
      }
    );
    
    return true;
  }
  
  private deactivateSpeedBoost(): void {
    // End the effect early
    const originalFireRate = this.temporaryEffects.getOriginalValue('speedBoost');
    if (originalFireRate !== undefined) {
      this.tower.stats.fireRate = originalFireRate;
    }
    
    this.gameState.speedBoostActive = false;
    this.gameState.speedBoostDuration = 0;
    this.temporaryEffects.endEffect('speedBoost');
  }
  
  // Kill streak methods
  private updateKillStreak(): void {
    this.gameState.killStreak = (this.gameState.killStreak || 0) + 1;
    this.gameState.killStreakTimer = KILL_STREAK_TIME_WINDOW;
    
    if (this.gameState.killStreak >= KILL_STREAK_THRESHOLD && !this.gameState.killStreakActive) {
      this.activateKillStreak();
    }
  }
  
  private updateKillStreakTimer(deltaTime: number): void {
    if (this.gameState.killStreakTimer > 0) {
      this.gameState.killStreakTimer -= deltaTime;
      if (this.gameState.killStreakTimer <= 0) {
        this.gameState.killStreak = 0;
      }
    }
  }
  
  private activateKillStreak(): void {
    this.gameState.killStreakActive = true;
    
    // Apply damage bonus using temporary effects
    const originalDamage = this.tower.stats.damage;
    const boostedDamage = originalDamage * KILL_STREAK_DAMAGE_BONUS;
    this.tower.stats.damage = boostedDamage;
    
    this.temporaryEffects.startEffect(
      'killStreak',
      originalDamage,
      boostedDamage,
      KILL_STREAK_DURATION,
      () => {
        // Restore original damage when effect expires
        this.tower.stats.damage = originalDamage;
        this.gameState.killStreakActive = false;
        this.gameState.killStreak = 0;
      }
    );
  }
  
  private deactivateKillStreak(): void {
    // End the effect early
    const originalDamage = this.temporaryEffects.getOriginalValue('killStreak');
    if (originalDamage !== undefined) {
      this.tower.stats.damage = originalDamage;
    }
    
    this.gameState.killStreakActive = false;
    this.gameState.killStreak = 0;
    this.temporaryEffects.endEffect('killStreak');
  }
  
  private applyInterest(deltaTime: number): void {
    if (!this.gameState.interestRate || this.gameState.interestRate <= 0) return;
    
    // Apply interest every second
    this.gameState.lastInterestTime = (this.gameState.lastInterestTime || 0) + deltaTime;
    
    if (this.gameState.lastInterestTime >= 1.0) {
      const interestGain = Math.floor(this.gameState.gold * this.gameState.interestRate);
      if (interestGain > 0) {
        this.gameState.gold += interestGain;
      }
      this.gameState.lastInterestTime -= 1.0;
    }
  }
  
  destroy() {
    // Remove event listeners
    if (this.eventHandlers.enemyKilled) {
      gameEvents.off(GameEvents.EnemyKilled, this.eventHandlers.enemyKilled);
    }
    if (this.eventHandlers.towerDamaged) {
      gameEvents.off(GameEvents.TowerDamaged, this.eventHandlers.towerDamaged);
    }
    if (this.eventHandlers.waveCompleted) {
      gameEvents.off(GameEvents.WaveCompleted, this.eventHandlers.waveCompleted);
    }
    if (this.eventHandlers.projectileSpawned) {
      gameEvents.off(GameEvents.ProjectileSpawned, this.eventHandlers.projectileSpawned);
    }
    
    // Clear temporary effects
    if (this.temporaryEffects) {
      this.temporaryEffects.clear();
    }
    
    if (this.waveSystem) {
      this.waveSystem.reset();
    }
    
    this.projectiles = [];
  }
}