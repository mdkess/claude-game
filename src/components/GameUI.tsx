"use client";

import { useState } from "react";
import { GameState, PermanentUpgrades } from "../game/types";
import { EssenceMenu } from "./EssenceMenu";
import { ENEMY_ICONS } from "../game/systems/WaveDefinitions";

interface GameUIProps {
  gameState: GameState;
  upgradeCosts: Record<string, number>;
  onUpgrade: (
    type: "damage" | "fireRate" | "maxHealth" | "healthRegen" | "range" | "goldPerRound" | "interest"
  ) => void;
  isGameOver: boolean;
  finalScore: number;
  earnedEssence: number;
  totalEssence: number;
  permanentUpgrades: PermanentUpgrades;
  onRestart: () => void;
  onPurchasePermanentUpgrade: (type: keyof PermanentUpgrades) => void;
  onDebugDamage?: () => void;
  onDebugGold?: () => void;
  onDebugEssence?: () => void;
  onToggleSpeed?: () => void;
}

export function GameUI({
  gameState,
  upgradeCosts,
  onUpgrade,
  isGameOver,
  finalScore,
  earnedEssence,
  totalEssence,
  permanentUpgrades,
  onRestart,
  onPurchasePermanentUpgrade,
  onDebugDamage,
  onDebugGold,
  onDebugEssence,
  onToggleSpeed,
}: GameUIProps) {
  const [showEssenceMenu, setShowEssenceMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'offensive' | 'defensive' | 'economic'>('offensive');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  return (
    <>
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-2 sm:p-4 pointer-events-none">
        <div className="flex justify-center">
          {/* Consolidated HUD Panel */}
          <div className="bg-gray-900/80 backdrop-blur-sm px-3 sm:px-6 py-2 sm:py-3 rounded-lg border border-gray-700/50 scale-75 sm:scale-100 origin-top">
            <div className="flex items-center gap-6">
              {/* Health Bar */}
              <div className="w-40">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-bold">Health</span>
                  <span className="text-green-400 text-xs min-w-[3rem] text-right">
                    {gameState.healthRegen && gameState.healthRegen > 0 ? `+${gameState.healthRegen.toFixed(1)}/s` : ''}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{
                      width: `${(gameState.health / gameState.maxHealth) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-white text-xs mt-0.5 text-center">
                  {Math.ceil(gameState.health)} / {gameState.maxHealth}
                </div>
              </div>

              <div className="h-12 w-px bg-gray-600" />

              {/* Resources */}
              <div className="flex flex-col justify-center w-20">
                <div className="text-yellow-400 font-bold tabular-nums">
                  💰 {gameState.gold.toString().padStart(4, ' ')}
                </div>
                <div className="text-purple-400 text-sm tabular-nums">
                  ✨ {totalEssence.toString().padStart(4, ' ')}
                </div>
                {(gameState.goldPerRound && gameState.goldPerRound > 0) || 
                 (gameState.interestRate && gameState.interestRate > 0) ? (
                  <div className="text-xs">
                    {gameState.goldPerRound && gameState.goldPerRound > 0 && (
                      <div className="text-yellow-300 tabular-nums">
                        +{gameState.goldPerRound}/wave
                      </div>
                    )}
                    {gameState.interestRate && gameState.interestRate > 0 && (
                      <div className="text-green-300 tabular-nums">
                        +{(gameState.interestRate * 100).toFixed(0)}%/s
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="h-12 w-px bg-gray-600" />

              {/* Wave Info */}
              <div className="flex flex-col justify-center w-16 text-center">
                <div className="text-white font-bold">
                  Wave {gameState.wave}
                </div>
                <div className="text-gray-400 text-xs tabular-nums">
                  {formatTime(gameState.survivalTime)}
                </div>
              </div>

              {gameState.waveState && (
                <>
                  <div className="h-12 w-px bg-gray-600" />
                  
                  {/* Wave Enemies (Compact) */}
                  <div className="flex items-center gap-2">
                    <div className="w-16 text-center">
                      {!gameState.waveState.isWaveActive ? (
                        <div className="text-yellow-400 text-sm animate-pulse tabular-nums">
                          {Math.ceil(gameState.waveState.nextWaveTimer)}s
                        </div>
                      ) : gameState.waveState.totalEnemiesRemaining === 0 ? (
                        <span className="text-green-400 text-xs animate-pulse">
                          Done!
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Active</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {gameState.waveState.composition.enemies.map((enemy, idx) => {
                        const enemyInfo = ENEMY_ICONS[enemy.type as keyof typeof ENEMY_ICONS];
                        const remaining = gameState.waveState?.enemiesRemaining[enemy.type] || 0;
                        const killed = enemy.count - remaining;
                        
                        return (
                          <div key={idx} className="flex items-center gap-0.5 min-w-[3rem]">
                            <span style={{ color: enemyInfo?.color || '#fff' }}>
                              {enemy.icon}
                            </span>
                            <span className={`text-xs tabular-nums ${
                              remaining > 0 ? "text-white" : "text-gray-600 line-through"
                            }`}>
                              {killed.toString().padStart(2, ' ')}/{enemy.count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <div className="h-12 w-px bg-gray-600" />

              {/* Stats & Speed */}
              <div className="flex items-center gap-3">
                <div className="text-gray-400 text-xs w-20 tabular-nums">
                  Score: {gameState.score}
                </div>
                {onToggleSpeed && (
                  <button
                    onClick={onToggleSpeed}
                    className={`w-8 h-8 rounded text-sm font-bold transition-colors pointer-events-auto flex items-center justify-center ${
                      gameState.speedMultiplier === 2 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                    title="Press SPACE to toggle speed"
                  >
                    {gameState.speedMultiplier === 2 ? '2x' : '1x'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Buttons */}
      {(onDebugDamage || onDebugGold || onDebugEssence) && (
        <div className="absolute bottom-20 right-4 pointer-events-auto flex flex-col gap-2">
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
      )}

      {/* Upgrade Panels */}
      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 pointer-events-auto">
        <div className="flex justify-center items-end gap-2 sm:gap-3 scale-90 sm:scale-100 origin-bottom">
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

          {/* Essence Button */}
          <button
            onClick={() => setShowEssenceMenu(true)}
            className="bg-purple-900/90 hover:bg-purple-800/90 backdrop-blur-sm p-3 rounded-lg border border-purple-600/50 transition-all hover:scale-105 flex flex-col items-center justify-center shadow-lg min-w-[100px]"
          >
            <span className="text-purple-300 text-sm font-bold">Essence</span>
            <span className="text-purple-400 text-lg font-bold">{totalEssence}</span>
            <span className="text-purple-300 text-xs">Upgrades</span>
          </button>
        </div>
      </div>

      {/* Game Over Screen */}
      {isGameOver && (
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
                onClick={() => setShowEssenceMenu(true)}
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
      )}

      {/* Essence Menu */}
      <EssenceMenu
        isOpen={showEssenceMenu}
        onClose={() => setShowEssenceMenu(false)}
        totalEssence={totalEssence}
        permanentUpgrades={permanentUpgrades}
        onPurchaseUpgrade={onPurchasePermanentUpgrade}
      />
    </>
  );
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
