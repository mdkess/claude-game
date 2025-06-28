import { useState, useRef, useEffect } from 'react';
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
        relative px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-md transition-all w-full sm:w-auto sm:min-w-[80px] transform hover:scale-105
        ${colorClasses[color]}
      `}
    >
      <div className="text-[10px] sm:text-xs absolute top-0.5 left-0.5 opacity-50">[{hotkey}]</div>
      <div className="text-[10px] sm:text-xs absolute top-0.5 right-0.5 opacity-70">
        Lv.{level}
      </div>
      <div className="font-bold mt-2 sm:mt-3 text-xs sm:text-sm">{label}</div>
      <div className="text-[10px] sm:text-xs">{cost}g</div>
    </button>
  );
}

export function UpgradePanel({ gameState, upgradeCosts, onUpgrade }: UpgradePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const hasScroll = scrollRef.current.scrollHeight > scrollRef.current.clientHeight;
        setShowScrollHint(hasScroll);
      }
    };
    
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  return (
    <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg relative">
      <div 
        ref={scrollRef} 
        className="p-1.5 sm:p-3 max-h-[160px] sm:max-h-[240px] overflow-y-auto space-y-1 sm:space-y-3 scrollbar-custom relative"
      >
        {/* Offensive Upgrades */}
        <div className="space-y-1 sm:space-y-2">
          <h3 className="text-red-400 font-bold text-xs sm:text-sm flex items-center gap-1 sticky top-0 bg-gray-900 py-0.5 sm:py-1 -mx-1.5 sm:-mx-3 px-1.5 sm:px-3 z-10">
            ⚔️ Offensive
          </h3>
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1 sm:gap-2 sm:pl-2">
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
        </div>

        {/* Defensive Upgrades */}
        <div className="space-y-1 sm:space-y-2">
          <h3 className="text-blue-400 font-bold text-xs sm:text-sm flex items-center gap-1 sticky top-0 bg-gray-900 py-0.5 sm:py-1 -mx-1.5 sm:-mx-3 px-1.5 sm:px-3 z-10">
            🛡️ Defensive
          </h3>
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1 sm:gap-2 sm:pl-2">
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
        </div>

        {/* Economic Upgrades */}
        <div className="space-y-1 sm:space-y-2">
          <h3 className="text-yellow-400 font-bold text-xs sm:text-sm flex items-center gap-1 sticky top-0 bg-gray-900 py-0.5 sm:py-1 -mx-1.5 sm:-mx-3 px-1.5 sm:px-3 z-10">
            💰 Economic
          </h3>
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1 sm:gap-2 sm:pl-2">
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
        </div>
      </div>
      {/* Scroll indicators */}
      {showScrollHint && (
        <>
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-900/90 to-transparent pointer-events-none rounded-t-lg" />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900/90 to-transparent pointer-events-none rounded-b-lg" />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 opacity-50 pointer-events-none animate-pulse">
            ↓ scroll
          </div>
        </>
      )}
    </div>
  );
}