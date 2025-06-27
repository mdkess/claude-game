import { Enemy } from '../entities/Enemy';
import { EnemyType } from '../types';
import { gameEvents, GameEvents } from '../core/EventEmitter';
import { EnemyKilledEvent } from '../core/types';
import { enemyDefinitions, getScaledStats } from '../enemies/definitions/EnemyDefinitions';
import { generateWaveComposition as getWaveComposition, WaveComposition } from '../systems/WaveDefinitions';
import { GAME_SIZE, ENEMY_SPAWN_DISTANCE } from '../core/constants';

interface WaveState {
  currentWave: number;
  isWaveActive: boolean;
  enemiesRemaining: Map<EnemyType, number>;
  totalEnemiesRemaining: number;
  enemiesKilled: number;
  nextWaveTimer: number;
  composition: WaveComposition;
}

/**
 * Manages enemy waves and spawning
 */
export class WaveSystem {
  private enemies: Enemy[] = [];
  private enemyPool: Enemy[] = [];
  private spawnTimer: number = 0;
  private spawnQueue: Array<{ type: EnemyType; x: number; y: number }> = [];
  private waveState: WaveState;
  
  private readonly GAME_CENTER = GAME_SIZE / 2;
  private readonly NEXT_WAVE_DELAY = 3; // seconds
  
  constructor() {
    this.waveState = {
      currentWave: 1,
      isWaveActive: false,
      enemiesRemaining: new Map(),
      totalEnemiesRemaining: 0,
      enemiesKilled: 0,
      nextWaveTimer: 2, // Start first wave after 2 seconds
      composition: getWaveComposition(1)
    };
    
    // Pre-populate enemy pool
    for (let i = 0; i < 100; i++) {
      this.enemyPool.push(new Enemy());
    }
    
    gameEvents.on(GameEvents.EnemyKilled, this.handleEnemyDeath.bind(this));
  }
  
  update(deltaTime: number): void {
    // If wave is not active, count down to next wave
    if (!this.waveState.isWaveActive) {
      this.waveState.nextWaveTimer -= deltaTime;
      
      if (this.waveState.nextWaveTimer <= 0) {
        this.startNextWave();
      }
      
      // Update active enemies even between waves
      this.updateActiveEnemies(deltaTime);
      return;
    }
    
    // Update spawn timer
    this.spawnTimer += deltaTime;
    
    // Check if we should spawn an enemy
    if (this.spawnTimer >= this.waveState.composition.spawnDelay && this.spawnQueue.length > 0) {
      this.spawnNextEnemy();
      this.spawnTimer = 0;
    }
    
    // Update all active enemies
    this.updateActiveEnemies(deltaTime);
    
    // Check if wave is complete
    if (this.waveState.totalEnemiesRemaining === 0 && this.spawnQueue.length === 0 && this.getActiveEnemies().length === 0) {
      this.completeWave();
    }
  }
  
  private updateActiveEnemies(deltaTime: number): void {
    const target = { x: this.GAME_CENTER, y: this.GAME_CENTER };
    
    // Update enemies and collect dead ones
    const deadEnemies: Enemy[] = [];
    this.enemies.forEach(enemy => {
      if (enemy.isActive && !enemy.isDead) {
        enemy.update(deltaTime, target);
      } else if (!enemy.isActive || enemy.isDead) {
        deadEnemies.push(enemy);
      }
    });
    
    // Clean up dead enemies
    deadEnemies.forEach(enemy => this.releaseEnemy(enemy));
  }
  
  private startNextWave(): void {
    this.waveState.isWaveActive = true;
    this.waveState.composition = getWaveComposition(this.waveState.currentWave);
    this.waveState.enemiesRemaining = this.createEnemyCountMap(this.waveState.composition);
    this.waveState.totalEnemiesRemaining = this.getTotalEnemyCount(this.waveState.composition);
    this.waveState.enemiesKilled = 0;
    
    // Reset spawn timer
    this.spawnTimer = 0;
    
    // Create spawn queue
    this.createSpawnQueue();
  }
  
  private createSpawnQueue(): void {
    this.spawnQueue = [];
    
    // Add all enemies to spawn queue in shuffled order
    this.waveState.composition.enemies.forEach(enemyCount => {
      for (let i = 0; i < enemyCount.count; i++) {
        // Random spawn position around the edge
        const angle = Math.random() * Math.PI * 2;
        const x = this.GAME_CENTER + Math.cos(angle) * ENEMY_SPAWN_DISTANCE;
        const y = this.GAME_CENTER + Math.sin(angle) * ENEMY_SPAWN_DISTANCE;
        
        this.spawnQueue.push({ type: enemyCount.type, x, y });
      }
    });
    
    // Shuffle the queue for variety
    for (let i = this.spawnQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.spawnQueue[i], this.spawnQueue[j]] = [this.spawnQueue[j], this.spawnQueue[i]];
    }
  }
  
  private spawnNextEnemy(): void {
    const spawnData = this.spawnQueue.shift();
    if (!spawnData) return;
    
    this.createEnemyAtPosition(spawnData.x, spawnData.y, spawnData.type, this.waveState.currentWave);
  }
  
  private completeWave(): void {
    this.waveState.isWaveActive = false;
    this.waveState.nextWaveTimer = this.NEXT_WAVE_DELAY;
    
    // Emit wave completed event for bonus gold
    const bonusGold = this.waveState.composition.bonusGold || 0;
    gameEvents.emit(GameEvents.WaveCompleted, { 
      wave: this.waveState.currentWave,
      bonusGold 
    });
    
    // Increment wave number
    this.waveState.currentWave++;
  }
  
  private createEnemyAtPosition(x: number, y: number, type: EnemyType, wave: number): void {
    const definition = enemyDefinitions.get(type);
    if (!definition) {
      return;
    }
    
    // Handle spawn groups
    const spawnCount = definition.spawnGroup || 1;
    const angleStep = (Math.PI * 2) / spawnCount;
    const groupRadius = spawnCount > 1 ? 20 : 0;
    
    for (let i = 0; i < spawnCount; i++) {
      const angle = angleStep * i;
      const spawnX = x + Math.cos(angle) * groupRadius;
      const spawnY = y + Math.sin(angle) * groupRadius;
      
      const enemy = this.getEnemyFromPool();
      const scaledStats = getScaledStats(definition, wave);
      
      enemy.init({
        x: spawnX,
        y: spawnY,
        type,
        health: scaledStats.health,
        maxHealth: scaledStats.maxHealth,
        speed: scaledStats.speed,
        damage: scaledStats.damage,
        reward: scaledStats.reward,
        movementStrategy: definition.movement(),
        deathStrategy: definition.death()
      });
      
      this.enemies.push(enemy);
      
      // Emit enemy spawned event
      gameEvents.emit(GameEvents.EnemySpawned, enemy);
    }
  }
  
  private getEnemyFromPool(): Enemy {
    const enemy = this.enemyPool.pop();
    if (enemy) {
      return enemy;
    }
    // Create new enemy if pool is empty
    return new Enemy();
  }
  
  private releaseEnemy(enemy: Enemy): void {
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
      this.enemies.splice(index, 1);
      enemy.reset();
      this.enemyPool.push(enemy);
    }
  }
  
  private createEnemyCountMap(composition: WaveComposition): Map<EnemyType, number> {
    const map = new Map<EnemyType, number>();
    composition.enemies.forEach(enemyCount => {
      map.set(enemyCount.type, enemyCount.count);
    });
    return map;
  }
  
  private getTotalEnemyCount(composition: WaveComposition): number {
    return composition.enemies.reduce((total, enemyCount) => total + enemyCount.count, 0);
  }
  
  private handleEnemyDeath(data: EnemyKilledEvent): void {
    const { enemy, type, splitData } = data;
    
    // Update wave state
    if (this.waveState.isWaveActive) {
      this.waveState.enemiesKilled++;
      
      // Decrease remaining count for this enemy type
      const currentCount = this.waveState.enemiesRemaining.get(enemy.type as EnemyType) || 0;
      if (currentCount > 0) {
        this.waveState.enemiesRemaining.set(enemy.type as EnemyType, currentCount - 1);
        this.waveState.totalEnemiesRemaining--;
      }
    }
    
    // Handle splitter enemies
    if (type === 'splitter' && splitData) {
      this.handleSplitterDeath(splitData);
    }
    
    // Don't clean up the enemy immediately - it will be cleaned up in updateActiveEnemies
    // This allows other event handlers to read the enemy's properties
  }
  
  private handleSplitterDeath(splitData: { count: number; x: number; y: number }): void {
    const angleStep = (Math.PI * 2) / splitData.count;
    
    for (let i = 0; i < splitData.count; i++) {
      const angle = angleStep * i;
      const distance = 20;
      const x = splitData.x + Math.cos(angle) * distance;
      const y = splitData.y + Math.sin(angle) * distance;
      
      // Create swarm enemies from splitter
      this.createEnemyAtPosition(x, y, EnemyType.Swarm, this.waveState.currentWave);
      
      // Add to wave tracking if wave is active
      if (this.waveState.isWaveActive) {
        const swarmCount = this.waveState.enemiesRemaining.get(EnemyType.Swarm) || 0;
        this.waveState.enemiesRemaining.set(EnemyType.Swarm, swarmCount + 1);
        this.waveState.totalEnemiesRemaining++;
      }
    }
  }
  
  getActiveEnemies(): Enemy[] {
    return this.enemies.filter(e => e.isActive && !e.isDead);
  }
  
  getCurrentWave(): number {
    return this.waveState.currentWave;
  }
  
  getWaveState(): WaveState {
    return { ...this.waveState };
  }
  
  reset(): void {
    // Release all enemies back to pool
    this.enemies.forEach(enemy => {
      enemy.reset();
      this.enemyPool.push(enemy);
    });
    this.enemies = [];
    
    this.spawnTimer = 0;
    this.spawnQueue = [];
    
    // Reset wave state
    this.waveState = {
      currentWave: 1,
      isWaveActive: false,
      enemiesRemaining: new Map(),
      totalEnemiesRemaining: 0,
      enemiesKilled: 0,
      nextWaveTimer: 2,
      composition: getWaveComposition(1)
    };
  }
}