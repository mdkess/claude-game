interface DebugPanelProps {
  onDebugDamage?: () => void;
  onDebugGold?: () => void;
  onDebugEssence?: () => void;
}

export function DebugPanel({ onDebugDamage, onDebugGold, onDebugEssence }: DebugPanelProps) {
  if (!onDebugDamage && !onDebugGold && !onDebugEssence) {
    return null;
  }

  return (
    <div className="absolute bottom-48 sm:bottom-20 right-2 sm:right-4 pointer-events-auto flex flex-col gap-1 sm:gap-2 scale-90 sm:scale-100 origin-bottom-right z-50">
      {onDebugDamage && (
        <button
          onClick={onDebugDamage}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
        >
          DEBUG: -100 HP
        </button>
      )}
      {onDebugGold && (
        <button
          onClick={onDebugGold}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm"
        >
          DEBUG: +1000 Gold
        </button>
      )}
      {onDebugEssence && (
        <button
          onClick={onDebugEssence}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-sm"
        >
          DEBUG: +100 Essence
        </button>
      )}
    </div>
  );
}