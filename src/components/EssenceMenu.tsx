'use client';

import { useState } from 'react';
import { PermanentUpgrades } from '../game/types';
import { EssenceUpgradeCard, UpgradeInfo } from './ui/EssenceUpgradeCard';
import { TabNavigation } from './ui/TabNavigation';
import { EssenceMenuHeader } from './ui/EssenceMenuHeader';

interface EssenceMenuProps {
  isOpen: boolean;
  onClose: () => void;
  totalEssence: number;
  permanentUpgrades: PermanentUpgrades;
  onPurchaseUpgrade: (type: keyof PermanentUpgrades) => void;
}

const upgradeInfo: Record<keyof PermanentUpgrades, UpgradeInfo> = {
  startingDamage: {
    name: 'Starting Damage',
    description: 'Increase tower starting damage',
    effect: '+2 damage per level',
    maxLevel: 10,
    baseCost: 10,
    costScaling: 1.5
  },
  startingFireRate: {
    name: 'Starting Fire Rate',
    description: 'Increase tower starting fire rate',
    effect: '+0.2 shots/s per level',
    maxLevel: 10,
    baseCost: 10,
    costScaling: 1.5
  },
  startingHealth: {
    name: 'Starting Health',
    description: 'Increase starting health',
    effect: '+10 HP per level',
    maxLevel: 10,
    baseCost: 8,
    costScaling: 1.5
  },
  goldMultiplier: {
    name: 'Gold Multiplier',
    description: 'Increase gold earned from enemies',
    effect: '+10% gold per level',
    maxLevel: 5,
    baseCost: 20,
    costScaling: 2
  },
  essenceGain: {
    name: 'Essence Gain',
    description: 'Increase essence earned on game over',
    effect: '+10% essence per level',
    maxLevel: 5,
    baseCost: 30,
    costScaling: 2
  },
  multiShot: {
    name: 'Multi-shot',
    description: 'Chance to fire multiple projectiles',
    effect: '+5% chance per level',
    maxLevel: 10,
    baseCost: 15,
    costScaling: 1.7
  },
  bounce: {
    name: 'Bounce',
    description: 'Chance for projectiles to bounce to nearby enemies',
    effect: '+5% chance per level',
    maxLevel: 10,
    baseCost: 15,
    costScaling: 1.7
  }
};

const tabs = [
  { id: 'offensive', label: 'Offensive', icon: '⚔️', color: 'red' },
  { id: 'defensive', label: 'Defensive', icon: '🛡️', color: 'blue' },
  { id: 'economic', label: 'Economic', icon: '💰', color: 'yellow' }
];

const upgradesByTab: Record<string, Array<keyof PermanentUpgrades>> = {
  offensive: ['startingDamage', 'startingFireRate', 'multiShot', 'bounce'],
  defensive: ['startingHealth'],
  economic: ['goldMultiplier', 'essenceGain']
};

export function EssenceMenu({ 
  isOpen, 
  onClose, 
  totalEssence, 
  permanentUpgrades, 
  onPurchaseUpgrade 
}: EssenceMenuProps) {
  const [activeTab, setActiveTab] = useState('offensive');
  
  if (!isOpen) return null;

  const getUpgradeCost = (type: keyof PermanentUpgrades): number => {
    const info = upgradeInfo[type];
    const currentLevel = type === 'goldMultiplier' || type === 'essenceGain' 
      ? permanentUpgrades[type] - 1 
      : permanentUpgrades[type];
    
    if (currentLevel >= info.maxLevel) return -1;
    
    return Math.floor(info.baseCost * Math.pow(info.costScaling, currentLevel));
  };

  const canAfford = (type: keyof PermanentUpgrades): boolean => {
    const cost = getUpgradeCost(type);
    return cost > 0 && totalEssence >= cost;
  };

  const isMaxLevel = (type: keyof PermanentUpgrades): boolean => {
    const info = upgradeInfo[type];
    const currentLevel = type === 'goldMultiplier' || type === 'essenceGain' 
      ? permanentUpgrades[type] - 1 
      : permanentUpgrades[type];
    return currentLevel >= info.maxLevel;
  };

  const getCurrentLevel = (type: keyof PermanentUpgrades): number => {
    if (type === 'goldMultiplier' || type === 'essenceGain') {
      return Math.round((permanentUpgrades[type] - 1) * 10) / 10;
    }
    return permanentUpgrades[type];
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
            {upgradesByTab[activeTab].map(type => (
              <EssenceUpgradeCard
                key={type}
                info={upgradeInfo[type]}
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