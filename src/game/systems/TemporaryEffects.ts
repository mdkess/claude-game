/**
 * Manages temporary effects and their original values
 * Replaces the type assertion hacks in GameCore
 */
export class TemporaryEffects {
  private effects = new Map<string, {
    originalValue: number;
    currentValue: number;
    duration: number;
    onExpire?: () => void;
  }>();

  /**
   * Start a temporary effect
   */
  startEffect(
    key: string, 
    originalValue: number, 
    newValue: number, 
    duration: number,
    onExpire?: () => void
  ): void {
    this.effects.set(key, {
      originalValue,
      currentValue: newValue,
      duration,
      onExpire
    });
  }

  /**
   * Update all effects and handle expiration
   */
  update(deltaTime: number): void {
    const expiredEffects: string[] = [];

    for (const [key, effect] of this.effects) {
      effect.duration -= deltaTime;
      
      if (effect.duration <= 0) {
        expiredEffects.push(key);
        if (effect.onExpire) {
          effect.onExpire();
        }
      }
    }

    // Remove expired effects
    expiredEffects.forEach(key => this.effects.delete(key));
  }

  /**
   * Get the original value before the effect
   */
  getOriginalValue(key: string): number | undefined {
    return this.effects.get(key)?.originalValue;
  }

  /**
   * Get the current effect value
   */
  getCurrentValue(key: string): number | undefined {
    return this.effects.get(key)?.currentValue;
  }

  /**
   * Check if an effect is active
   */
  hasEffect(key: string): boolean {
    return this.effects.has(key);
  }

  /**
   * Get remaining duration of an effect
   */
  getRemainingDuration(key: string): number {
    const effect = this.effects.get(key);
    return effect ? Math.max(0, effect.duration) : 0;
  }

  /**
   * End an effect immediately
   */
  endEffect(key: string): void {
    const effect = this.effects.get(key);
    if (effect && effect.onExpire) {
      effect.onExpire();
    }
    this.effects.delete(key);
  }

  /**
   * Clear all effects
   */
  clear(): void {
    // Call expire callbacks
    for (const effect of this.effects.values()) {
      if (effect.onExpire) {
        effect.onExpire();
      }
    }
    this.effects.clear();
  }
}