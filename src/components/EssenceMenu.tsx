'use client';

import { PermanentUpgrades } from '../game/types';
import { permanentUpgradeSystem, PermanentUpgradeType } from '../game/systems/PermanentUpgradeSystem';
import { EssenceUpgradeCard } from './ui/EssenceUpgradeCard';
import { EssenceMenuHeader } from './ui/EssenceMenuHeader';

interface EssenceMenuProps {
  isOpen: boolean;
  onClose: () => void;
  totalEssence: number;
  permanentUpgrades: PermanentUpgrades;
  onPurchaseUpgrade: (type: keyof PermanentUpgrades) => void;
}


export function EssenceMenu({ 
  isOpen, 
  onClose, 
  totalEssence, 
  permanentUpgrades, 
  onPurchaseUpgrade 
}: EssenceMenuProps) {
  if (!isOpen) return null;

  const getUpgradeCost = (type: PermanentUpgradeType): number => {
    return permanentUpgradeSystem.getUpgradeCost(type, permanentUpgrades[type]);
  };

  const canAfford = (type: PermanentUpgradeType): boolean => {
    const cost = getUpgradeCost(type);
    return cost > 0 && totalEssence >= cost;
  };

  const isMaxLevel = (type: PermanentUpgradeType): boolean => {
    return permanentUpgradeSystem.isMaxLevel(type, permanentUpgrades);
  };

  const getCurrentLevel = (type: PermanentUpgradeType): number => {
    return permanentUpgradeSystem.getCurrentLevel(type, permanentUpgrades);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center pointer-events-auto z-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl max-w-3xl w-full mx-4 max-h-[85vh] flex flex-col shadow-2xl border border-gray-700">
        <EssenceMenuHeader 
          totalEssence={totalEssence}
          onClose={onClose}
        />

        <div className="overflow-y-auto p-4 space-y-4 scrollbar-custom">
          {/* Offensive Upgrades */}
          <div>
            <h3 className="text-red-400 font-bold text-sm flex items-center gap-2 sticky top-0 bg-gray-800 py-2 -mt-2 z-10">
              ⚔️ Offensive Upgrades
            </h3>
            <div className="space-y-2 mt-2">
              {permanentUpgradeSystem.getUpgradesByCategory('offensive').map(type => (
                <EssenceUpgradeCard
                  key={type}
                  info={permanentUpgradeSystem.getUpgradeInfo(type)}
                  currentLevel={getCurrentLevel(type)}
                  cost={getUpgradeCost(type)}
                  canAfford={canAfford(type)}
                  isMaxLevel={isMaxLevel(type)}
                  onPurchase={() => onPurchaseUpgrade(type)}
                />
              ))}
            </div>
          </div>

          {/* Defensive Upgrades */}
          <div>
            <h3 className="text-blue-400 font-bold text-sm flex items-center gap-2 sticky top-0 bg-gray-800 py-2 z-10">
              🛡️ Defensive Upgrades
            </h3>
            <div className="space-y-2 mt-2">
              {permanentUpgradeSystem.getUpgradesByCategory('defensive').map(type => (
                <EssenceUpgradeCard
                  key={type}
                  info={permanentUpgradeSystem.getUpgradeInfo(type)}
                  currentLevel={getCurrentLevel(type)}
                  cost={getUpgradeCost(type)}
                  canAfford={canAfford(type)}
                  isMaxLevel={isMaxLevel(type)}
                  onPurchase={() => onPurchaseUpgrade(type)}
                />
              ))}
            </div>
          </div>

          {/* Economic Upgrades */}
          <div>
            <h3 className="text-yellow-400 font-bold text-sm flex items-center gap-2 sticky top-0 bg-gray-800 py-2 z-10">
              💰 Economic Upgrades
            </h3>
            <div className="space-y-2 mt-2">
              {permanentUpgradeSystem.getUpgradesByCategory('economic').map(type => (
                <EssenceUpgradeCard
                  key={type}
                  info={permanentUpgradeSystem.getUpgradeInfo(type)}
                  currentLevel={getCurrentLevel(type)}
                  cost={getUpgradeCost(type)}
                  canAfford={canAfford(type)}
                  isMaxLevel={isMaxLevel(type)}
                  onPurchase={() => onPurchaseUpgrade(type)}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              Permanent upgrades persist between runs and make you stronger from the start!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}