import { TowerStats } from '../types';

/**
 * Pure tower entity with game logic only, no rendering
 */
export class Tower {
  public x: number;
  public y: number;
  public stats: TowerStats;
  
  private radius: number = 30;
  
  constructor(x: number, y: number, stats: TowerStats) {
    this.x = x;
    this.y = y;
    this.stats = { ...stats };
  }
  
  getRadius(): number {
    return this.radius;
  }
  
  updateStats(stats: Partial<TowerStats>): void {
    Object.assign(this.stats, stats);
  }
  
  /**
   * Find the nearest valid target within range.
   */
  findNearestTarget(targets: Array<{ x: number; y: number; isDead: boolean; isActive: boolean }>): { x: number; y: number; isDead: boolean; isActive: boolean } | null {
    let nearestTarget: { x: number; y: number; isDead: boolean; isActive: boolean } | null = null;
    let nearestDistance = Infinity;
    
    for (const target of targets) {
      if (target.isDead || !target.isActive) continue;
      
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= this.stats.range && distance < nearestDistance) {
        nearestDistance = distance;
        nearestTarget = target;
      }
    }
    
    return nearestTarget;
  }
  
}