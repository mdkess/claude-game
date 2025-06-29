interface ResourcePanelProps {
  gold: number;
  totalEssence: number;
  score: number;
  interestRate?: number;
  speedMultiplier?: number;
  onToggleSpeed?: () => void;
}

export function ResourcePanel({ 
  gold, 
  totalEssence, 
  score, 
  interestRate,
  speedMultiplier, 
  onToggleSpeed 
}: ResourcePanelProps) {
  const interestAmount = interestRate ? Math.floor(gold * interestRate) : 0;
  return (
    <div className="flex items-start gap-1 sm:gap-2">
      <div className="bg-gray-900/80 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-700/50">
        <div className="flex flex-row sm:flex-col gap-3 sm:gap-1">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-yellow-400 text-xs sm:text-sm">💰</span>
            <span className="text-white font-bold text-xs sm:text-sm tabular-nums">{gold}</span>
            {interestAmount > 0 && (
              <span className="text-green-400 text-[10px] sm:text-xs">
                (+{interestAmount}/rd)
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-purple-400 text-xs sm:text-sm">✨</span>
            <span className="text-white font-bold text-xs sm:text-sm tabular-nums">{totalEssence}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-[10px] sm:text-xs">
            <span className="hidden sm:inline">Score:</span>
            <span className="sm:hidden">📊</span>
            <span>{score}</span>
          </div>
        </div>
      </div>
      {onToggleSpeed && (
        <button
          onClick={onToggleSpeed}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded text-xs sm:text-sm font-bold transition-colors pointer-events-auto flex items-center justify-center ${
            speedMultiplier === 2 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
          title="Press SPACE to toggle speed"
        >
          {speedMultiplier === 2 ? '2x' : '1x'}
        </button>
      )}
    </div>
  );
}