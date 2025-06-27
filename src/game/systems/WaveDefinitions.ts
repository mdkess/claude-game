import { EnemyType } from '../types';

export interface EnemyCount {
  type: EnemyType;
  count: number;
  displayName: string;
  icon: string; // For UI display
}

export interface WaveComposition {
  waveNumber: number;
  enemies: EnemyCount[];
  spawnDelay: number; // Time between spawns in seconds
  bonusGold?: number; // Bonus gold for completing the wave
}

// Define icons for enemy types
export const ENEMY_ICONS: Record<EnemyType, { icon: string; name: string; color: string }> = {
  [EnemyType.Basic]: { icon: '●', name: 'Basic', color: '#00ff88' },
  [EnemyType.Swarm]: { icon: '▪', name: 'Swarm', color: '#ffaa00' },
  [EnemyType.Tank]: { icon: '■', name: 'Tank', color: '#ff4444' },
  [EnemyType.Splitter]: { icon: '◆', name: 'Splitter', color: '#aa44ff' }
};

// Predefined wave compositions
export const WAVE_COMPOSITIONS: WaveComposition[] = [
  // Wave 1: Tutorial wave - easier start
  {
    waveNumber: 1,
    enemies: [
      { type: EnemyType.Basic, count: 3, displayName: 'Basic', icon: ENEMY_ICONS[EnemyType.Basic].icon }
    ],
    spawnDelay: 2.0,
    bonusGold: 10
  },
  // Wave 2: Introduction to choices
  {
    waveNumber: 2,
    enemies: [
      { type: EnemyType.Basic, count: 6, displayName: 'Basic', icon: ENEMY_ICONS[EnemyType.Basic].icon }
    ],
    spawnDelay: 1.5,
    bonusGold: 15
  },
  // Wave 3: First challenge with mixed enemies
  {
    waveNumber: 3,
    enemies: [
      { type: EnemyType.Basic, count: 4, displayName: 'Basic', icon: ENEMY_ICONS[EnemyType.Basic].icon },
      { type: EnemyType.Swarm, count: 3, displayName: 'Swarm', icon: ENEMY_ICONS[EnemyType.Swarm].icon }
    ],
    spawnDelay: 1.2,
    bonusGold: 20
  },
  // Wave 4: Mixed basics and swarm
  {
    waveNumber: 4,
    enemies: [
      { type: EnemyType.Basic, count: 8, displayName: 'Basic', icon: ENEMY_ICONS[EnemyType.Basic].icon },
      { type: EnemyType.Swarm, count: 8, displayName: 'Swarm', icon: ENEMY_ICONS[EnemyType.Swarm].icon }
    ],
    spawnDelay: 0.8
  },
  // Wave 5: Introduce tank
  {
    waveNumber: 5,
    enemies: [
      { type: EnemyType.Basic, count: 6, displayName: 'Basic', icon: ENEMY_ICONS[EnemyType.Basic].icon },
      { type: EnemyType.Tank, count: 2, displayName: 'Tank', icon: ENEMY_ICONS[EnemyType.Tank].icon }
    ],
    spawnDelay: 1.0,
    bonusGold: 50
  },
  // Wave 6: Swarm wave
  {
    waveNumber: 6,
    enemies: [
      { type: EnemyType.Swarm, count: 20, displayName: 'Swarm', icon: ENEMY_ICONS[EnemyType.Swarm].icon }
    ],
    spawnDelay: 0.5
  },
  // Wave 7: Mixed with splitters
  {
    waveNumber: 7,
    enemies: [
      { type: EnemyType.Basic, count: 5, displayName: 'Basic', icon: ENEMY_ICONS[EnemyType.Basic].icon },
      { type: EnemyType.Splitter, count: 3, displayName: 'Splitter', icon: ENEMY_ICONS[EnemyType.Splitter].icon },
      { type: EnemyType.Swarm, count: 4, displayName: 'Swarm', icon: ENEMY_ICONS[EnemyType.Swarm].icon }
    ],
    spawnDelay: 0.8
  },
  // Wave 8: Tank rush
  {
    waveNumber: 8,
    enemies: [
      { type: EnemyType.Tank, count: 4, displayName: 'Tank', icon: ENEMY_ICONS[EnemyType.Tank].icon },
      { type: EnemyType.Basic, count: 8, displayName: 'Basic', icon: ENEMY_ICONS[EnemyType.Basic].icon }
    ],
    spawnDelay: 0.7
  },
  // Wave 9: Complex mix
  {
    waveNumber: 9,
    enemies: [
      { type: EnemyType.Basic, count: 8, displayName: 'Basic', icon: ENEMY_ICONS[EnemyType.Basic].icon },
      { type: EnemyType.Swarm, count: 10, displayName: 'Swarm', icon: ENEMY_ICONS[EnemyType.Swarm].icon },
      { type: EnemyType.Tank, count: 2, displayName: 'Tank', icon: ENEMY_ICONS[EnemyType.Tank].icon },
      { type: EnemyType.Splitter, count: 2, displayName: 'Splitter', icon: ENEMY_ICONS[EnemyType.Splitter].icon }
    ],
    spawnDelay: 0.6
  },
  // Wave 10: Boss wave
  {
    waveNumber: 10,
    enemies: [
      { type: EnemyType.Tank, count: 6, displayName: 'Tank', icon: ENEMY_ICONS[EnemyType.Tank].icon },
      { type: EnemyType.Splitter, count: 4, displayName: 'Splitter', icon: ENEMY_ICONS[EnemyType.Splitter].icon }
    ],
    spawnDelay: 0.8,
    bonusGold: 100
  }
];

// Generate waves beyond the predefined ones
export function generateWaveComposition(waveNumber: number): WaveComposition {
  if (waveNumber <= WAVE_COMPOSITIONS.length) {
    return WAVE_COMPOSITIONS[waveNumber - 1];
  }
  
  // Procedural generation for waves beyond 10
  const difficultyMultiplier = 1 + (waveNumber - 10) * 0.1;
  const enemies: EnemyCount[] = [];
  
  // Base enemy counts
  const basicCount = Math.floor(5 * difficultyMultiplier);
  const swarmCount = Math.floor(4 * difficultyMultiplier);
  const tankCount = Math.floor(1 + (waveNumber - 10) / 5);
  const splitterCount = Math.floor(1 + (waveNumber - 10) / 6);
  
  if (basicCount > 0) {
    enemies.push({ 
      type: EnemyType.Basic, 
      count: basicCount, 
      displayName: 'Basic', 
      icon: ENEMY_ICONS[EnemyType.Basic].icon 
    });
  }
  
  if (swarmCount > 0) {
    enemies.push({ 
      type: EnemyType.Swarm, 
      count: swarmCount, 
      displayName: 'Swarm', 
      icon: ENEMY_ICONS[EnemyType.Swarm].icon 
    });
  }
  
  if (tankCount > 0) {
    enemies.push({ 
      type: EnemyType.Tank, 
      count: tankCount, 
      displayName: 'Tank', 
      icon: ENEMY_ICONS[EnemyType.Tank].icon 
    });
  }
  
  if (splitterCount > 0) {
    enemies.push({ 
      type: EnemyType.Splitter, 
      count: splitterCount, 
      displayName: 'Splitter', 
      icon: ENEMY_ICONS[EnemyType.Splitter].icon 
    });
  }
  
  // Bonus gold every 5 waves
  const bonusGold = waveNumber % 5 === 0 ? 50 * Math.floor(waveNumber / 5) : undefined;
  
  return {
    waveNumber,
    enemies,
    spawnDelay: Math.max(0.3, 0.8 - (waveNumber - 10) * 0.02),
    bonusGold
  };
}