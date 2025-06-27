export type EventHandler<T = unknown> = (data: T) => void;

export class EventEmitter {
  private events: Map<string, EventHandler<unknown>[]> = new Map();

  on<T = unknown>(event: string, handler: EventHandler<T>): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(handler as EventHandler<unknown>);
  }

  off<T = unknown>(event: string, handler: EventHandler<T>): void {
    const handlers = this.events.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler as EventHandler<unknown>);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit<T = unknown>(event: string, data?: T): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

// Global event bus for game-wide events
export const gameEvents = new EventEmitter();

// Event types
export enum GameEvents {
  EnemySpawned = 'enemy:spawned',
  EnemyDamaged = 'enemy:damaged',
  EnemyKilled = 'enemy:killed',
  ProjectileSpawned = 'projectile:spawned',
  ProjectileHit = 'projectile:hit',
  TowerDamaged = 'tower:damaged',
  TowerShoot = 'tower:shoot',
  WaveStarted = 'wave:started',
  WaveCompleted = 'wave:completed',
  GameOver = 'game:over',
  UpgradePurchased = 'upgrade:purchased'
}