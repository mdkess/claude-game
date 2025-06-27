
export interface UpgradeInfo {
  name: string;
  description: string;
  effect: string;
  maxLevel: number;
  baseCost: number;
  costScaling: number;
}

interface EssenceUpgradeCardProps {
  info: UpgradeInfo;
  currentLevel: number;
  cost: number;
  canAfford: boolean;
  isMaxLevel: boolean;
  onPurchase: () => void;
}

export function EssenceUpgradeCard({
  info,
  currentLevel,
  cost,
  canAfford,
  isMaxLevel,
  onPurchase
}: EssenceUpgradeCardProps) {
  return (
    <div
      className={`p-3 rounded-lg border ${
        isMaxLevel 
          ? 'bg-gray-700/50 border-gray-600' 
          : canAfford 
            ? 'bg-gray-700 border-purple-500 hover:border-purple-400' 
            : 'bg-gray-700/50 border-gray-600'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-white font-semibold text-sm">{info.name}</h4>
            <span className="text-xs text-purple-400">
              Lv.{currentLevel}/{info.maxLevel}
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-1">{info.description}</p>
          <p className="text-green-400 text-xs">{info.effect}</p>
        </div>
        
        <button
          onClick={onPurchase}
          disabled={!canAfford || isMaxLevel}
          className={`ml-4 px-3 py-1.5 rounded text-sm font-bold transition-colors ${
            isMaxLevel
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : canAfford
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isMaxLevel ? 'MAX' : `${cost}`}
        </button>
      </div>
    </div>
  );
}