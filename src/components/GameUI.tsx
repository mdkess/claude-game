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
      {/* HUD - Redesigned for mobile */}
      <div className="absolute top-0 left-0 right-0 p-2 pointer-events-none">
        {/* Top bar - core stats */}
        <div className="flex justify-between items-start gap-2 mb-2">
          {/* Left: Health */}
          <HealthBar
            health={gameState.health}
            maxHealth={gameState.maxHealth}
            healthRegen={gameState.healthRegen}
          />

          {/* Center: Wave & Time */}
          <WaveInfo
            wave={gameState.wave}
            survivalTime={gameState.survivalTime}
            waveState={gameState.waveState}
          />

          {/* Right: Resources, Score & Speed */}
          <ResourcePanel
            gold={gameState.gold}
            totalEssence={totalEssence}
            score={gameState.score}
            speedMultiplier={gameState.speedMultiplier}
            onToggleSpeed={onToggleSpeed}
          />
        </div>

        {/* Economic bonuses - shown as a second row when active */}
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

      {/* Upgrade Panels */}
      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 pointer-events-auto">
        <div className="flex justify-center items-end gap-2 sm:gap-3 scale-90 sm:scale-100 origin-bottom">
          <UpgradePanel
            gameState={gameState}
            upgradeCosts={upgradeCosts}
            onUpgrade={onUpgrade}
          />

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