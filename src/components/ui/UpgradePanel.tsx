import { useState } from 'react';
import { GameState } from '../../game/types';

interface UpgradePanelProps {
  gameState: GameState;
  upgradeCosts: Record<string, number>;
  onUpgrade: (
    type: "damage" | "fireRate" | "maxHealth" | "healthRegen" | "range" | "goldPerRound" | "interest"
  ) => void;
}

interface UpgradeButtonProps {
  label: string;
  hotkey: string;
  cost: number;
  canAfford: boolean;
  level: number;
  onClick: () => void;
  color?: 'red' | 'blue' | 'yellow';
}

function UpgradeButton({
  label,
  hotkey,
  cost,
  canAfford,
  level,
  onClick,
  color = 'blue',
}: UpgradeButtonProps) {
  const colorClasses = {
    red: canAfford
      ? "bg-red-600/80 hover:bg-red-600 text-white border border-red-500/50"
      : "bg-gray-800/80 text-gray-500 cursor-not-allowed border border-gray-700",
    blue: canAfford
      ? "bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/50"
      : "bg-gray-800/80 text-gray-500 cursor-not-allowed border border-gray-700",
    yellow: canAfford
      ? "bg-yellow-600/80 hover:bg-yellow-600 text-white border border-yellow-500/50"
      : "bg-gray-800/80 text-gray-500 cursor-not-allowed border border-gray-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={!canAfford}
      className={`
        relative px-3 py-2 rounded-md transition-all min-w-[80px] transform hover:scale-105
        ${colorClasses[color]}
      `}
    >
      <div className="text-xs absolute top-0.5 left-0.5 opacity-50">[{hotkey}]</div>
      <div className="text-xs absolute top-0.5 right-0.5 opacity-70">
        Lv.{level}
      </div>
      <div className="font-bold mt-3 text-sm">{label}</div>
      <div className="text-xs">{cost}g</div>
    </button>
  );
}

export function UpgradePanel({ gameState, upgradeCosts, onUpgrade }: UpgradePanelProps) {
  const [activeTab, setActiveTab] = useState<'offensive' | 'defensive' | 'economic'>('offensive');

  return (
    <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('offensive')}
          className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'offensive'
              ? 'text-red-400 border-red-500 bg-red-900/20'
              : 'text-gray-400 border-transparent hover:text-red-300'
          }`}
        >
          ⚔️ Offensive
        </button>
        <button
          onClick={() => setActiveTab('defensive')}
          className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'defensive'
              ? 'text-blue-400 border-blue-500 bg-blue-900/20'
              : 'text-gray-400 border-transparent hover:text-blue-300'
          }`}
        >
          🛡️ Defensive
        </button>
        <button
          onClick={() => setActiveTab('economic')}
          className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'economic'
              ? 'text-yellow-400 border-yellow-500 bg-yellow-900/20'
              : 'text-gray-400 border-transparent hover:text-yellow-300'
          }`}
        >
          💰 Economic
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-3">
        {activeTab === 'offensive' && (
          <div className="flex gap-2">
            <UpgradeButton
              label="Damage"
              hotkey="1"
              cost={upgradeCosts.damage || 50}
              canAfford={gameState.gold >= (upgradeCosts.damage || 50)}
              level={gameState.upgradeLevels?.damage || 0}
              onClick={() => onUpgrade("damage")}
              color="red"
            />
            <UpgradeButton
              label="Fire Rate"
              hotkey="2"
              cost={upgradeCosts.fireRate || 100}
              canAfford={gameState.gold >= (upgradeCosts.fireRate || 100)}
              level={gameState.upgradeLevels?.fireRate || 0}
              onClick={() => onUpgrade("fireRate")}
              color="red"
            />
            <UpgradeButton
              label="Range"
              hotkey="3"
              cost={upgradeCosts.range || 100}
              canAfford={gameState.gold >= (upgradeCosts.range || 100)}
              level={gameState.upgradeLevels?.range || 0}
              onClick={() => onUpgrade("range")}
              color="red"
            />
          </div>
        )}
        {activeTab === 'defensive' && (
          <div className="flex gap-2">
            <UpgradeButton
              label="Max Health"
              hotkey="4"
              cost={upgradeCosts.maxHealth || 75}
              canAfford={gameState.gold >= (upgradeCosts.maxHealth || 75)}
              level={gameState.upgradeLevels?.maxHealth || 0}
              onClick={() => onUpgrade("maxHealth")}
              color="blue"
            />
            <UpgradeButton
              label="Regen"
              hotkey="5"
              cost={upgradeCosts.healthRegen || 150}
              canAfford={gameState.gold >= (upgradeCosts.healthRegen || 150)}
              level={gameState.upgradeLevels?.healthRegen || 0}
              onClick={() => onUpgrade("healthRegen")}
              color="blue"
            />
          </div>
        )}
        {activeTab === 'economic' && (
          <div className="flex gap-2">
            <UpgradeButton
              label="Gold/Round"
              hotkey="6"
              cost={upgradeCosts.goldPerRound || 50}
              canAfford={gameState.gold >= (upgradeCosts.goldPerRound || 50)}
              level={gameState.upgradeLevels?.goldPerRound || 0}
              onClick={() => onUpgrade("goldPerRound")}
              color="yellow"
            />
            <UpgradeButton
              label="Interest"
              hotkey="7"
              cost={upgradeCosts.interest || 100}
              canAfford={gameState.gold >= (upgradeCosts.interest || 100)}
              level={gameState.upgradeLevels?.interest || 0}
              onClick={() => onUpgrade("interest")}
              color="yellow"
            />
          </div>
        )}
      </div>
    </div>
  );
}