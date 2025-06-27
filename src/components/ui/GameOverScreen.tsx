interface GameOverScreenProps {
  finalScore: number;
  earnedEssence: number;
  onShowEssenceMenu: () => void;
  onRestart: () => void;
}

export function GameOverScreen({ 
  finalScore, 
  earnedEssence, 
  onShowEssenceMenu, 
  onRestart 
}: GameOverScreenProps) {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
      <div className="bg-gray-800 p-8 rounded-xl text-center border border-gray-700 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-4">Game Over</h2>
        <div className="text-white mb-2">
          Final Score:{" "}
          <span className="text-yellow-400 font-bold">{finalScore}</span>
        </div>
        <div className="text-white mb-6">
          Essence Earned:{" "}
          <span className="text-purple-400 font-bold">{earnedEssence}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onShowEssenceMenu}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded"
          >
            Spend Essence
          </button>
          <button
            onClick={onRestart}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}