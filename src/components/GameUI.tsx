"use client";

import { useState } from "react";
import { GameState, PermanentUpgrades } from "../game/types";
import { EssenceMenu } from "./EssenceMenu";
import { HealthBar } from "./ui/HealthBar";
import { WaveInfo } from "./ui/WaveInfo";
import { ResourcePanel } from "./ui/ResourcePanel";
import { EconomicBonuses } from "./ui/EconomicBonuses";
import { UpgradePanel } from "./ui/UpgradePanel";
import { GameOverScreen } from "./ui/GameOverScreen";
import { DebugPanel } from "./ui/DebugPanel";

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

  return (
    <>
      {/* HUD - Redesigned for mobile with 3-row layout */}
      <div className="absolute top-0 left-0 right-0 p-1 sm:p-2 pointer-events-none">
        {/* Mobile: 3-row layout, Desktop: single row */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
          {/* Row 1 on mobile: Health & Wave */}
          <div className="flex justify-between items-start gap-1 sm:contents">
            <HealthBar
              health={gameState.health}
              maxHealth={gameState.maxHealth}
              healthRegen={gameState.healthRegen}
            />
            <WaveInfo
              wave={gameState.wave}
              survivalTime={gameState.survivalTime}
              waveState={gameState.waveState}
            />
          </div>

          {/* Row 2 on mobile: Resources */}
          <div className="flex justify-center sm:contents">
            <ResourcePanel
              gold={gameState.gold}
              totalEssence={totalEssence}
              score={gameState.score}
              speedMultiplier={gameState.speedMultiplier}
              onToggleSpeed={onToggleSpeed}
            />
          </div>
        </div>

        {/* Economic bonuses - shown as needed */}
        <EconomicBonuses
          goldPerRound={gameState.goldPerRound}
          interestRate={gameState.interestRate}
        />
      </div>

      {/* Debug Buttons */}
      <DebugPanel
        onDebugDamage={onDebugDamage}
        onDebugGold={onDebugGold}
        onDebugEssence={onDebugEssence}
      />

      {/* Row 3 on mobile: Upgrade Panels */}
      <div className="absolute bottom-0 left-0 right-0 p-1 sm:p-4 pointer-events-auto">
        <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-end gap-1 sm:gap-3">
          <div className="flex-1 sm:flex-initial">
            <UpgradePanel
              gameState={gameState}
              upgradeCosts={upgradeCosts}
              onUpgrade={onUpgrade}
            />
          </div>

          {/* Essence Button */}
          <button
            onClick={() => setShowEssenceMenu(true)}
            className="bg-purple-900/90 hover:bg-purple-800/90 backdrop-blur-sm p-2 sm:p-3 rounded-lg border border-purple-600/50 transition-all hover:scale-105 flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-0 shadow-lg sm:min-w-[100px]"
          >
            <span className="text-purple-300 text-xs sm:text-sm font-bold">Essence</span>
            <span className="text-purple-400 text-sm sm:text-lg font-bold">{totalEssence}</span>
            <span className="text-purple-300 text-[10px] sm:text-xs sm:block">Upgrades</span>
          </button>
        </div>
      </div>

      {/* Game Over Screen */}
      {isGameOver && (
        <GameOverScreen
          finalScore={finalScore}
          earnedEssence={earnedEssence}
          onShowEssenceMenu={() => setShowEssenceMenu(true)}
          onRestart={onRestart}
        />
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