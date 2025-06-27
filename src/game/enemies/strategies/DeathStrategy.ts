import { gameEvents, GameEvents } from '../../core/EventEmitter';
import { Enemy } from '../../entities/Enemy';

export interface DeathStrategy {
  onDeath(enemy: Enemy): void;
}

export class NormalDeath implements DeathStrategy {
  onDeath(enemy: Enemy): void {
    // Just emit the death event
    gameEvents.emit(GameEvents.EnemyKilled, { enemy, type: 'normal' });
  }
}

export class SplitterDeath implements DeathStrategy {
  constructor(
    private splitCount: number = 3,
    private splitType: string = 'swarm'
  ) {}

  onDeath(enemy: Enemy): void {
    gameEvents.emit(GameEvents.EnemyKilled, { 
      enemy, 
      type: 'splitter',
      splitData: {
        count: this.splitCount,
        type: this.splitType,
        x: enemy.x,
        y: enemy.y
      }
    });
  }
}