import * as PIXI from 'pixi.js';
import { GameCore } from './core/GameCore';
import { PermanentUpgrades } from './types';
import { TowerRenderer } from './renderers/TowerRenderer';
import { EnemyRenderer } from './renderers/EnemyRenderer';
import { ProjectileRenderer } from './renderers/ProjectileRenderer';
import { EffectsManager } from './effects/EffectsManager';
import { gameEvents, GameEvents } from './core/EventEmitter';
import { Enemy } from './entities/Enemy';
import { EnemyKilledEvent, TowerDamagedEvent } from './core/types';
import { enemyDefinitions } from './enemies/definitions/EnemyDefinitions';
import { 
  GAME_SIZE, 
  COLORS,
  FPS
} from './core/constants';

/**
 * Visual game that extends GameCore with PIXI rendering
 */
export class Game extends GameCore {
  private app: PIXI.Application;
  private gameContainer!: PIXI.Container;
  private backgroundGraphics!: PIXI.Graphics;
  
  // Renderers
  private towerRenderer!: TowerRenderer;
  private enemyRenderer!: EnemyRenderer;
  private projectileRenderer!: ProjectileRenderer;
  private effectsManager!: EffectsManager;
  
  private boundHandleResize?: () => void;
  private boundUpdate?: (ticker: PIXI.Ticker) => void;
  private isInitialized: boolean = false;
  private towerShootHandler?: (data: { x: number; y: number; angle: number; isMultiShot: boolean }) => void;
  private enemySpawnedHandler?: (data: Enemy) => void;
  
  constructor(permanentUpgrades?: PermanentUpgrades) {
    super(permanentUpgrades);
    
    console.log('[Game] Creating new Game instance with upgrades:', permanentUpgrades);
    this.app = new PIXI.Application();
    console.log('[Game] PIXI Application created');
  }
  
  async init(canvas: HTMLCanvasElement) {
    console.log('[Game] Initializing PIXI application');
    
    try {
      await this.app.init({
        canvas,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: COLORS.BACKGROUND,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
      });
      
      await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));
    } catch (error) {
      throw error;
    }
    this.gameContainer = new PIXI.Container();
    this.app.stage.addChild(this.gameContainer);
    
    this.createBackground();
    this.setupRenderers();
    this.startGameLoop();
    
    this.boundHandleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.boundHandleResize);
    this.handleResize();
    
    this.isInitialized = true;
    console.log('[Game] Initialization complete');
  }
  
  private createBackground() {
    this.backgroundGraphics = new PIXI.Graphics();
    this.backgroundGraphics.rect(0, 0, GAME_SIZE, GAME_SIZE);
    this.backgroundGraphics.fill({ color: COLORS.BACKGROUND_FILL, alpha: 1 });
    this.backgroundGraphics.setStrokeStyle({ width: 4, color: COLORS.BORDER, alpha: 0.5 });
    this.backgroundGraphics.rect(0, 0, GAME_SIZE, GAME_SIZE);
    this.backgroundGraphics.stroke();
    this.gameContainer.addChild(this.backgroundGraphics);
    
    const mask = new PIXI.Graphics();
    mask.rect(0, 0, GAME_SIZE, GAME_SIZE);
    mask.fill({ color: 0xffffff });
    this.gameContainer.mask = mask;
    this.gameContainer.addChild(mask);
  }
  
  private setupRenderers() {
    this.towerRenderer = new TowerRenderer(this.gameContainer);
    this.enemyRenderer = new EnemyRenderer(this.gameContainer);
    this.projectileRenderer = new ProjectileRenderer(this.gameContainer);
    this.effectsManager = new EffectsManager(this.gameContainer);
    
    // Listen for tower shoot events
    this.towerShootHandler = (data) => {
      this.effectsManager.onTowerShoot(data.x, data.y, data.angle, data.isMultiShot);
    };
    gameEvents.on(GameEvents.TowerShoot, this.towerShootHandler);
    
    // Listen for enemy spawned events
    this.enemySpawnedHandler = (enemy) => {
      this.onEnemySpawned(enemy);
    };
    gameEvents.on(GameEvents.EnemySpawned, this.enemySpawnedHandler);
  }
  
  private startGameLoop() {
    this.boundUpdate = this.handleTick.bind(this);
    this.app.ticker.add(this.boundUpdate);
  }
  
  private handleTick(ticker: PIXI.Ticker) {
    if (!this.isInitialized || !this.gameState) return;
    
    // Convert PIXI's deltaTime (in frames) to seconds
    const deltaTime = ticker.deltaTime / FPS;
    
    // Update game logic
    super.update(deltaTime);
    
    // Update effects
    this.effectsManager.update(deltaTime);
    
    // Render everything
    this.renderEntities(deltaTime);
    
    // Clean up dead enemy sprites
    const enemies = this.getActiveEnemies();
    this.enemyRenderer.cleanupInactive(enemies);
    
    // Clean up destroyed projectile sprites
    const projectiles = this.getProjectiles();
    const activeProjectiles = projectiles.filter(p => !p.isDestroyed);
    this.projectileRenderer.cleanupInactive(activeProjectiles);
  }
  
  private renderEntities(deltaTime: number) {
    // Render tower
    this.towerRenderer.render(this.getTower(), deltaTime, this.gameState.health);
    
    // Render enemies
    const enemies = this.getActiveEnemies();
    enemies.forEach(enemy => this.enemyRenderer.render(enemy));
    
    // Render projectiles
    this.getProjectiles().forEach(projectile => this.projectileRenderer.render(projectile, this.effectsManager));
  }
  
  private handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.app.renderer.resize(width, height);
    
    // Detect if mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || width < 768;
    
    // Adjust sizing for mobile
    const minSize = isMobile ? 300 : 400;
    const maxSize = isMobile ? 800 : 1200;
    const padding = isMobile ? 0.95 : 0.9;
    
    // Calculate game size to fit screen
    const gameSize = Math.max(minSize, Math.min(maxSize, Math.min(width * padding, height * padding)));
    const scale = gameSize / GAME_SIZE;
    
    this.gameContainer.scale.set(scale);
    this.gameContainer.x = (width - gameSize) / 2;
    this.gameContainer.y = (height - gameSize) / 2;
  }
  
  debugDamage(amount: number) {
    console.log(`[DEBUG] Dealing ${amount} damage`);
    this.gameState.health -= amount;
    if (this.gameState.health <= 0) {
      this.gameOver();
    }
  }
  
  debugGold(amount: number) {
    console.log(`[DEBUG] Adding ${amount} gold`);
    this.gameState.gold += amount;
  }
  
  getEffectsManager(): EffectsManager {
    return this.effectsManager;
  }
  
  // Override GameCore event handlers to trigger visual effects
  protected onEnemyKilled(data: EnemyKilledEvent, goldEarned: number): void {
    super.onEnemyKilled(data, goldEarned);
    
    const enemy = data.enemy;
    this.effectsManager.onEnemyDeath(enemy.x, enemy.y, 0xff0000, enemy.type === 'strong' || enemy.type === 'fast');
  }
  
  protected onEnemySpawned(enemy: Enemy): void {
    const definition = enemyDefinitions.get(enemy.type);
    const color = definition?.visual.color || 0xff0000;
    this.effectsManager.onEnemySpawn(enemy.x, enemy.y, color);
  }
  
  protected onTowerDamaged(data: TowerDamagedEvent): void {
    super.onTowerDamaged(data);
    
    // Screen shake when tower takes damage
    this.effectsManager.createScreenShake(10, 0.3);
  }
  
  protected onDamageDealt(damage: number, enemy: Enemy): void {
    super.onDamageDealt(damage, enemy);
    
    // Show damage numbers and hit effects
    const definition = enemyDefinitions.get(enemy.type);
    const color = definition?.visual.color || 0xff0000;
    this.effectsManager.onEnemyHit(enemy.x, enemy.y, damage, color, damage > 50);
  }
  
  // Override tower shoot to add muzzle flash
  protected onTowerShoot(x: number, y: number, angle: number): void {
    this.effectsManager.onTowerShoot(x, y, angle, false);
  }
  
  // Override upgrade purchase to add visual feedback
  purchaseUpgrade(type: 'damage' | 'fireRate' | 'maxHealth' | 'healthRegen' | 'range' | 'goldPerRound' | 'interest'): boolean {
    const success = super.purchaseUpgrade(type);
    if (success) {
      this.effectsManager.onTowerUpgrade(this.getTower().x, this.getTower().y);
    }
    return success;
  }
  
  protected gameOver(): void {
    super.gameOver();
    this.effectsManager.onGameOver();
  }
  
  destroy() {
    if (!this.isInitialized) return;
    
    try {
      // Stop the ticker first
      if (this.app && this.app.ticker) {
        this.app.ticker.stop();
        if (this.boundUpdate) {
          this.app.ticker.remove(this.boundUpdate);
        }
      }
      
      // Clean up parent class
      super.destroy();
      
      // Remove resize listener
      if (this.boundHandleResize) {
        window.removeEventListener('resize', this.boundHandleResize);
      }
      
      // Remove event listeners
      if (this.towerShootHandler) {
        gameEvents.off(GameEvents.TowerShoot, this.towerShootHandler);
      }
      if (this.enemySpawnedHandler) {
        gameEvents.off(GameEvents.EnemySpawned, this.enemySpawnedHandler);
      }
      
      this.isInitialized = false;
      
      // Clean up renderers
      if (this.towerRenderer) {
        this.towerRenderer.destroy();
      }
      
      if (this.enemyRenderer) {
        this.enemyRenderer.clear();
      }
      
      if (this.projectileRenderer) {
        this.projectileRenderer.clear();
      }
      
      if (this.effectsManager) {
        this.effectsManager.destroy();
      }
      
      // Destroy PIXI app
      if (this.app && this.app.renderer) {
        this.app.destroy(false, {
          children: true,
          texture: true
        });
      }
    } catch {
      // Silently handle errors during cleanup
    }
  }
}