interface EssenceMenuHeaderProps {
  totalEssence: number;
  onClose: () => void;
}

export function EssenceMenuHeader({ totalEssence, onClose }: EssenceMenuHeaderProps) {
  return (
    <div className="p-6 pb-4 border-b border-gray-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Essence Upgrades</h2>
          <div className="text-purple-400 text-lg font-bold mt-1">
            <span className="text-sm text-gray-400">Available:</span> {totalEssence} Essence
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-3xl leading-none p-2"
        >
          ×
        </button>
      </div>
    </div>
  );
}