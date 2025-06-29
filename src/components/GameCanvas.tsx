"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Game } from "../game/Game";
import { GameState, PermanentUpgrades } from "../game/types";
import { GameUI } from "./GameUI";

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [upgradeCosts, setUpgradeCosts] = useState<Record<string, number>>({});
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [earnedEssence, setEarnedEssence] = useState(0);
  const [totalEssence, setTotalEssence] = useState(0);
  const [permanentUpgrades, setPermanentUpgrades] = useState<PermanentUpgrades>(
    {
      startingDamage: 0,
      startingFireRate: 0,
      startingHealth: 0,
      goldMultiplier: 1,
      essenceGain: 1,
      multiShot: 0,
      bounce: 0,
    }
  );
  const [canvasKey, setCanvasKey] = useState(0); // Force canvas recreation
  const [debugMode, setDebugMode] = useState(false);
  const [upgradesLoaded, setUpgradesLoaded] = useState(false);
  const [initialUpgrades, setInitialUpgrades] =
    useState<PermanentUpgrades | null>(null);

  // Check for debug mode on mount and prevent scrolling
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setDebugMode(params.get("debug") === "true");

      // Only prevent default touch behavior on the canvas itself, not UI elements
      const canvas = canvasRef.current;
      if (canvas) {
        const preventCanvasScroll = (e: TouchEvent) => {
          if (e.target === canvas) {
            e.preventDefault();
          }
        };

        canvas.addEventListener("touchmove", preventCanvasScroll, {
          passive: false,
        });

        return () => {
          canvas.removeEventListener("touchmove", preventCanvasScroll);
        };
      }
    }
  }, []);

  // Game state update interval
  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (gameRef.current) {
        setGameState(gameRef.current.getState());
        setUpgradeCosts({
          damage: gameRef.current.getUpgradeCost("damage"),
          fireRate: gameRef.current.getUpgradeCost("fireRate"),
          maxHealth: gameRef.current.getUpgradeCost("maxHealth"),
          healthRegen: gameRef.current.getUpgradeCost("healthRegen"),
          range: gameRef.current.getUpgradeCost("range"),
        });
      }
    }, 100);

    return () => clearInterval(updateInterval);
  }, []);

  const handleUpgrade = useCallback(
    (
      type:
        | "damage"
        | "fireRate"
        | "maxHealth"
        | "healthRegen"
        | "range"
        | "goldPerRound"
        | "interest"
    ) => {
      if (gameRef.current) {
        gameRef.current.purchaseUpgrade(type);
      }
    },
    []
  );

  const handleToggleSpeed = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.toggleSpeed();
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameRef.current || isGameOver) return;

      switch (e.key) {
        case "1":
          handleUpgrade("damage");
          break;
        case "2":
          handleUpgrade("fireRate");
          break;
        case "3":
          handleUpgrade("maxHealth");
          break;
        case "4":
          handleUpgrade("healthRegen");
          break;
        case "5":
          handleUpgrade("range");
          break;
        case "6":
          handleUpgrade("goldPerRound");
          break;
        case "7":
          handleUpgrade("interest");
          break;
        case " ":
          e.preventDefault(); // Prevent page scroll
          handleToggleSpeed();
          break;
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [isGameOver, handleUpgrade, handleToggleSpeed]);

  const handleRestart = async () => {
    // First destroy the old game
    if (gameRef.current) {
      gameRef.current.destroy();
      gameRef.current = null;
    }

    // Wait a bit for cleanup
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Reset state
    setIsGameOver(false);
    setFinalScore(0);
    setEarnedEssence(0);

    // Force canvas recreation by changing key
    setCanvasKey((prev) => prev + 1);
  };

  const handleDebugDamage = () => {
    if (gameRef.current) {
      gameRef.current.debugDamage(100);
    }
  };

  const handleDebugGold = () => {
    if (gameRef.current) {
      gameRef.current.debugGold(1000);
    }
  };

  const handleDebugEssence = () => {
    const newTotal = totalEssence + 100;
    setTotalEssence(newTotal);
    localStorage.setItem("totalEssence", newTotal.toString());
  };

  const handlePurchasePermanentUpgrade = (type: keyof PermanentUpgrades) => {
    // Calculate cost
    const upgradeInfo: Record<
      keyof PermanentUpgrades,
      { baseCost: number; scaling: number; max: number }
    > = {
      startingDamage: { baseCost: 10, scaling: 1.5, max: 10 },
      startingFireRate: { baseCost: 10, scaling: 1.5, max: 10 },
      startingHealth: { baseCost: 8, scaling: 1.5, max: 10 },
      goldMultiplier: { baseCost: 20, scaling: 2, max: 5 },
      essenceGain: { baseCost: 30, scaling: 2, max: 5 },
      multiShot: { baseCost: 15, scaling: 1.7, max: 10 },
      bounce: { baseCost: 15, scaling: 1.7, max: 10 },
    };

    const info = upgradeInfo[type];
    const currentLevel =
      type === "goldMultiplier" || type === "essenceGain"
        ? permanentUpgrades[type] - 1
        : permanentUpgrades[type];

    if (currentLevel >= info.max) return; // Max level

    const cost = Math.floor(
      info.baseCost * Math.pow(info.scaling, currentLevel)
    );

    if (totalEssence < cost) return; // Can't afford

    // Deduct cost and upgrade
    const newTotal = totalEssence - cost;
    setTotalEssence(newTotal);
    localStorage.setItem("totalEssence", newTotal.toString());

    const newUpgrades = { ...permanentUpgrades };
    if (type === "goldMultiplier" || type === "essenceGain") {
      newUpgrades[type] = Math.round((newUpgrades[type] + 0.1) * 10) / 10; // Add 10%, round to 1 decimal
    } else {
      newUpgrades[type] += 1;
    }
    setPermanentUpgrades(newUpgrades);
    localStorage.setItem("permanentUpgrades", JSON.stringify(newUpgrades));
  };

  // Load saved data on mount
  useEffect(() => {
    const savedEssence = localStorage.getItem("totalEssence");
    if (savedEssence) {
      setTotalEssence(parseInt(savedEssence) || 0);
    }

    const savedUpgrades = localStorage.getItem("permanentUpgrades");
    if (savedUpgrades) {
      const parsed = JSON.parse(savedUpgrades);
      // Ensure new properties exist for backwards compatibility
      const upgrades = {
        startingDamage: parsed.startingDamage || 0,
        startingFireRate: parsed.startingFireRate || 0,
        startingHealth: parsed.startingHealth || 0,
        goldMultiplier: parsed.goldMultiplier || 1,
        essenceGain: parsed.essenceGain || 1,
        multiShot: parsed.multiShot || 0,
        bounce: parsed.bounce || 0,
      };
      setPermanentUpgrades(upgrades);
      setInitialUpgrades(upgrades);
    } else {
      // Set default upgrades as initial
      setInitialUpgrades({
        startingDamage: 0,
        startingFireRate: 0,
        startingHealth: 0,
        goldMultiplier: 1,
        essenceGain: 1,
        multiShot: 0,
        bounce: 0,
      });
    }
    setUpgradesLoaded(true);
  }, []);

  // Initialize game when canvas changes and upgrades are loaded
  useEffect(() => {
    if (!canvasRef.current || !upgradesLoaded) return;

    let mounted = true;
    let gameInstance: Game | null = null;

    const initGame = async () => {
      // Use initial upgrades when creating game (not current ones that may have changed)
      const game = new Game(initialUpgrades || permanentUpgrades);
      gameInstance = game;

      if (!mounted) {
        return;
      }

      try {
        await game.init(canvasRef.current!);

        if (!mounted) {
          game.destroy();
          return;
        }

        gameRef.current = game;

        game.onGameOver = (score, essence) => {
          setIsGameOver(true);
          setFinalScore(score);
          setEarnedEssence(essence);

          // Add earned essence to total
          setTotalEssence((prev) => {
            const newTotal = prev + essence;
            localStorage.setItem("totalEssence", newTotal.toString());
            return newTotal;
          });
        };
      } catch {
        if (gameInstance) {
          gameInstance.destroy();
        }
      }
    };

    initGame();

    return () => {
      mounted = false;
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasKey, upgradesLoaded]); // Only reinitialize when canvas key changes or upgrades first load

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <canvas
        key={canvasKey} // This forces React to create a new canvas element
        ref={canvasRef}
        className="absolute inset-0 w-full h-full p-4"
        style={{ touchAction: "none" }}
      />
      {gameState && (
        <GameUI
          gameState={gameState}
          upgradeCosts={upgradeCosts}
          onUpgrade={handleUpgrade}
          isGameOver={isGameOver}
          finalScore={finalScore}
          earnedEssence={earnedEssence}
          totalEssence={totalEssence}
          permanentUpgrades={permanentUpgrades}
          onRestart={handleRestart}
          onPurchasePermanentUpgrade={handlePurchasePermanentUpgrade}
          onDebugDamage={debugMode ? handleDebugDamage : undefined}
          onDebugGold={debugMode ? handleDebugGold : undefined}
          onDebugEssence={debugMode ? handleDebugEssence : undefined}
          onToggleSpeed={handleToggleSpeed}
        />
      )}
    </div>
  );
}
