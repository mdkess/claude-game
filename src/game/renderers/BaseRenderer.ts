import * as PIXI from 'pixi.js';

/**
 * Base renderer class that handles common sprite lifecycle management
 * for all entity renderers (Enemy, Projectile, Tower)
 */
export abstract class BaseRenderer<TEntity, TSprite extends PIXI.Container = PIXI.Container> {
  protected sprites: Map<TEntity, TSprite> = new Map();
  protected container: PIXI.Container;

  constructor(container: PIXI.Container) {
    this.container = container;
  }

  /**
   * Update or create sprite for an entity
   */
  update(entity: TEntity): void {
    let sprite = this.sprites.get(entity);
    
    if (!sprite) {
      sprite = this.createSprite(entity);
      this.sprites.set(entity, sprite);
      this.container.addChild(sprite);
    }
    
    this.updateSprite(entity, sprite);
  }

  /**
   * Remove sprite for a specific entity
   */
  remove(entity: TEntity): void {
    const sprite = this.sprites.get(entity);
    if (sprite) {
      this.container.removeChild(sprite);
      this.destroySprite(sprite);
      this.sprites.delete(entity);
    }
  }

  /**
   * Clean up sprites for inactive entities
   */
  cleanupInactive(activeEntities: TEntity[]): void {
    const activeSet = new Set(activeEntities);
    const toRemove: TEntity[] = [];
    
    for (const [entity, _] of this.sprites) {
      if (!activeSet.has(entity)) {
        toRemove.push(entity);
      }
    }
    
    toRemove.forEach(entity => this.remove(entity));
  }

  /**
   * Clear all sprites
   */
  clear(): void {
    for (const [_, sprite] of this.sprites) {
      this.container.removeChild(sprite);
      this.destroySprite(sprite);
    }
    this.sprites.clear();
  }

  /**
   * Get sprite for an entity
   */
  getSprite(entity: TEntity): TSprite | undefined {
    return this.sprites.get(entity);
  }

  /**
   * Get all sprites
   */
  getAllSprites(): Map<TEntity, TSprite> {
    return this.sprites;
  }

  /**
   * Abstract methods that subclasses must implement
   */
  protected abstract createSprite(entity: TEntity): TSprite;
  protected abstract updateSprite(entity: TEntity, sprite: TSprite): void;

  /**
   * Optional method for custom sprite destruction
   * Override if sprites need special cleanup
   */
  protected destroySprite(sprite: TSprite): void {
    sprite.destroy({ children: true });
  }
}