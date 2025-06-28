import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { EnemyKilledEvent, TowerDamagedEvent, WaveStartedEvent, UpgradePurchasedEvent } from './types';

// Complete event map with all event types
export interface GameEventMap extends Record<string, unknown> {
  'enemy:spawned': Enemy;
  'enemy:damaged': { enemy: Enemy; damage: number; remainingHealth: number };
  'enemy:killed': EnemyKilledEvent;
  'projectile:spawned': Projectile;
  'projectile:hit': { projectile: Projectile; enemy: Enemy; damage: number };
  'tower:damaged': TowerDamagedEvent & { enemyType?: string };
  'tower:shoot': { x: number; y: number; angle: number; isMultiShot: boolean };
  'wave:started': WaveStartedEvent;
  'wave:completed': { wave: number; bonusGold: number };
  'game:over': { score: number; essence: number };
  'upgrade:purchased': UpgradePurchasedEvent;
}

// Type-safe event handler
export type TypedEventHandler<T> = (data: T) => void;

// Type-safe event emitter
export class TypedEventEmitter<EventMap extends Record<string, unknown>> {
  private events = new Map<keyof EventMap, Set<TypedEventHandler<unknown>>>();

  on<K extends keyof EventMap>(
    event: K,
    handler: TypedEventHandler<EventMap[K]>
  ): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    // Store with proper typing preserved
    this.events.get(event)!.add(handler as TypedEventHandler<unknown>);
  }

  off<K extends keyof EventMap>(
    event: K,
    handler: TypedEventHandler<EventMap[K]>
  ): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler as TypedEventHandler<unknown>);
    }
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const handlers = this.events.get(event);
    if (handlers) {
      // Each handler is properly typed for this specific event
      handlers.forEach(handler => {
        // Safe cast because we know the handler was registered for this event type
        (handler as TypedEventHandler<EventMap[K]>)(data);
      });
    }
  }

  removeAllListeners(event?: keyof EventMap): void {
    if (event !== undefined) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

// Create the global typed event bus
export const typedGameEvents = new TypedEventEmitter<GameEventMap>();

// Export event names as constants for consistency
export const GameEvents = {
  EnemySpawned: 'enemy:spawned',
  EnemyDamaged: 'enemy:damaged',
  EnemyKilled: 'enemy:killed',
  ProjectileSpawned: 'projectile:spawned',
  ProjectileHit: 'projectile:hit',
  TowerDamaged: 'tower:damaged',
  TowerShoot: 'tower:shoot',
  WaveStarted: 'wave:started',
  WaveCompleted: 'wave:completed',
  GameOver: 'game:over',
  UpgradePurchased: 'upgrade:purchased'
} as const;

// Type helper to get event data type
export type GameEventData<K extends keyof GameEventMap> = GameEventMap[K];