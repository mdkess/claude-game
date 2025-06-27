interface ResourcePanelProps {
  gold: number;
  totalEssence: number;
  score: number;
  speedMultiplier?: number;
  onToggleSpeed?: () => void;
}

export function ResourcePanel({ 
  gold, 
  totalEssence, 
  score, 
  speedMultiplier, 
  onToggleSpeed 
}: ResourcePanelProps) {
  return (
    <div className="flex items-start gap-2">
      <div className="bg-gray-900/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700/50">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-sm">💰</span>
            <span className="text-white font-bold text-sm tabular-nums">{gold}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400 text-sm">✨</span>
            <span className="text-white font-bold text-sm tabular-nums">{totalEssence}</span>
          </div>
          <div className="text-gray-400 text-xs mt-1">
            Score: {score}
          </div>
        </div>
      </div>
      {onToggleSpeed && (
        <button
          onClick={onToggleSpeed}
          className={`w-8 h-8 rounded text-sm font-bold transition-colors pointer-events-auto flex items-center justify-center ${
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