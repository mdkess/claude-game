import { GameState } from '../../game/types';

interface UnifiedTopBarProps {
  gameState: GameState;
  onToggleSpeed?: () => void;
}

export function UnifiedTopBar({ gameState, onToggleSpeed }: UnifiedTopBarProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate interest amount
  const interestAmount = gameState.interestRate ? Math.floor(gameState.gold * gameState.interestRate) : 0;

  // Calculate enemies for wave
  let totalEnemies = 0;
  let killedEnemies = 0;
  
  if (gameState.waveState?.isWaveActive && gameState.waveState.composition?.enemies) {
    gameState.waveState.composition.enemies.forEach(enemy => {
      const remaining = gameState.waveState.enemiesRemaining[enemy.type] || 0;
      totalEnemies += enemy.count;
      killedEnemies += enemy.count - remaining;
    });
  }

  const healthPercent = (gameState.health / gameState.maxHealth) * 100;

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 shadow-lg">
      <div className="px-2 sm:px-4 py-1.5 sm:py-2">
        <div className="relative flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Section: Health */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-sm sm:text-base">❤️</span>
                <div className="w-24 sm:w-32 bg-gray-700 rounded-full h-2 sm:h-2.5 relative overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300 ease-out"
                    style={{ width: `${healthPercent}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] sm:text-xs text-white font-semibold drop-shadow-md">
                      {Math.ceil(gameState.health)}/{gameState.maxHealth}
                    </span>
                  </div>
                </div>
                {gameState.healthRegen > 0 && (
                  <span className="text-green-400 text-[10px] sm:text-xs">+{gameState.healthRegen.toFixed(1)}/s</span>
                )}
              </div>
            </div>
          </div>

          {/* Wave Info - Absolutely Centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-blue-400 text-xs sm:text-sm">🌊</span>
              <span className="text-white font-bold text-xs sm:text-sm tabular-nums">
                Wave {gameState.wave}
              </span>
            </div>
            <div className="text-gray-400 text-[10px] sm:text-xs h-3.5">
              {gameState.waveState?.isWaveActive && totalEnemies > 0 ? (
                <span className="tabular-nums">({killedEnemies}/{totalEnemies})</span>
              ) : (
                <span className="tabular-nums">{formatTime(gameState.survivalTime)}</span>
              )}
            </div>
          </div>

          {/* Right Section: Gold, Speed & Score */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Gold with bonuses */}
            <div className="flex items-start gap-1">
              <span className="text-yellow-400 text-xs sm:text-sm mt-0.5">💰</span>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1">
                  <span className="text-white font-bold text-xs sm:text-sm tabular-nums min-w-[3ch]">
                    {gameState.gold}
                  </span>
                  {interestAmount > 0 && (
                    <span className="text-green-400 text-[10px] sm:text-xs tabular-nums">
                      +{interestAmount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] -mt-0.5 h-3">
                  {gameState.goldPerRound > 0 && (
                    <span className="text-yellow-300 tabular-nums">+{gameState.goldPerRound}/wave</span>
                  )}
                  {gameState.interestRate > 0 && (
                    <span className="text-green-300 tabular-nums">+{(gameState.interestRate * 100).toFixed(0)}%/rd</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right hidden sm:block min-w-[60px]">
              <div className="text-gray-400 text-[10px] sm:text-xs">Score</div>
              <div className="text-white text-xs sm:text-sm font-semibold tabular-nums">
                {gameState.score.toLocaleString()}
              </div>
            </div>
            
            {onToggleSpeed && (
              <button
                onClick={onToggleSpeed}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-bold transition-all hover:scale-105 ${
                  gameState.speedMultiplier === 2 
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/50 shadow-lg' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
                title="Press SPACE to toggle speed"
              >
                {gameState.speedMultiplier === 2 ? '2x' : '1x'}
              </button>
            )}
          </div>
        </div>

        {/* Bottom row: Wave timer - always reserve space */}
        <div className="flex items-center justify-center mt-1 h-4">
          {gameState.waveState && !gameState.waveState.isWaveActive && (
            <div className="text-yellow-400 text-[10px] sm:text-xs animate-pulse">
              Next wave: <span className="tabular-nums">{Math.ceil(gameState.waveState.nextWaveTimer)}</span>s
            </div>
          )}
        </div>
      </div>
    </div>
  );
}