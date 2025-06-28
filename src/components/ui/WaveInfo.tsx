import { GameState } from '../../game/types';

interface WaveInfoProps {
  wave: number;
  survivalTime: number;
  waveState?: GameState['waveState'];
}

export function WaveInfo({ wave, survivalTime, waveState }: WaveInfoProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate total enemies and killed
  let totalEnemies = 0;
  let killedEnemies = 0;
  
  if (waveState && waveState.isWaveActive && waveState.composition.enemies) {
    waveState.composition.enemies.forEach(enemy => {
      const remaining = waveState.enemiesRemaining[enemy.type] || 0;
      totalEnemies += enemy.count;
      killedEnemies += enemy.count - remaining;
    });
  }

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm px-2 sm:px-4 py-1 sm:py-2 rounded-lg border border-gray-700/50">
      <div className="text-center">
        <div className="text-white font-bold text-[11px] sm:text-sm">
          Wave {wave}
          {waveState && waveState.isWaveActive && totalEnemies > 0 && (
            <span className="text-gray-400 text-[10px] sm:text-xs ml-1 sm:ml-2">
              ({killedEnemies}/{totalEnemies})
            </span>
          )}
        </div>
        <div className="text-gray-400 text-[10px] sm:text-xs">{formatTime(survivalTime)}</div>
        {waveState && !waveState.isWaveActive && (
          <div className="text-yellow-400 text-[10px] sm:text-xs animate-pulse mt-0.5 sm:mt-1">
            Next: {Math.ceil(waveState.nextWaveTimer)}s
          </div>
        )}
      </div>
    </div>
  );
}