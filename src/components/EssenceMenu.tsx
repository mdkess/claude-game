'use client';

import { useState } from 'react';
import { PermanentUpgrades } from '../game/types';
import { permanentUpgradeSystem, PermanentUpgradeType } from '../game/systems/PermanentUpgradeSystem';
import { EssenceUpgradeCard } from './ui/EssenceUpgradeCard';
import { TabNavigation } from './ui/TabNavigation';
import { EssenceMenuHeader } from './ui/EssenceMenuHeader';

interface EssenceMenuProps {
  isOpen: boolean;
  onClose: () => void;
  totalEssence: number;
  permanentUpgrades: PermanentUpgrades;
  onPurchaseUpgrade: (type: keyof PermanentUpgrades) => void;
}

const tabs = [
  { id: 'offensive', label: 'Offensive', icon: '⚔️', color: 'red' },
  { id: 'defensive', label: 'Defensive', icon: '🛡️', color: 'blue' },
  { id: 'economic', label: 'Economic', icon: '💰', color: 'yellow' }
];

export function EssenceMenu({ 
  isOpen, 
  onClose, 
  totalEssence, 
  permanentUpgrades, 
  onPurchaseUpgrade 
}: EssenceMenuProps) {
  const [activeTab, setActiveTab] = useState('offensive');
  
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

        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <div className="overflow-y-auto p-6">
          <div className="space-y-3">
            {permanentUpgradeSystem.getUpgradesByCategory(activeTab).map(type => (
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