'use client';

import { useState } from 'react';
import { PermanentUpgrades } from '../game/types';

interface EssenceMenuProps {
  isOpen: boolean;
  onClose: () => void;
  totalEssence: number;
  permanentUpgrades: PermanentUpgrades;
  onPurchaseUpgrade: (type: keyof PermanentUpgrades) => void;
}

interface UpgradeInfo {
  name: string;
  description: string;
  effect: string;
  maxLevel: number;
  baseCost: number;
  costScaling: number;
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

export function EssenceMenu({ 
  isOpen, 
  onClose, 
  totalEssence, 
  permanentUpgrades, 
  onPurchaseUpgrade 
}: EssenceMenuProps) {
  const [activeTab, setActiveTab] = useState<'offensive' | 'defensive' | 'economic'>('offensive');
  
  if (!isOpen) return null;

  const getUpgradeCost = (type: keyof PermanentUpgrades): number => {
    const info = upgradeInfo[type];
    const currentLevel = type === 'goldMultiplier' || type === 'essenceGain' 
      ? permanentUpgrades[type] - 1 
      : permanentUpgrades[type];
    
    if (currentLevel >= info.maxLevel) return -1; // Max level reached
    
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
      // Round to avoid floating point display issues
      return Math.round((permanentUpgrades[type] - 1) * 10) / 10;
    }
    return permanentUpgrades[type];
  };

  const renderUpgrade = (type: keyof PermanentUpgrades) => {
    const info = upgradeInfo[type];
    const currentLevel = getCurrentLevel(type);
    const cost = getUpgradeCost(type);
    const canBuy = canAfford(type);
    const maxed = isMaxLevel(type);

    return (
      <div
        key={type}
        className={`p-3 rounded-lg border ${
          maxed 
            ? 'bg-gray-700/50 border-gray-600' 
            : canBuy 
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
            onClick={() => onPurchaseUpgrade(type)}
            disabled={!canBuy || maxed}
            className={`ml-4 px-3 py-1.5 rounded text-sm font-bold transition-colors ${
              maxed
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : canBuy
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {maxed ? 'MAX' : `${cost}`}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center pointer-events-auto z-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl max-w-3xl w-full mx-4 max-h-[85vh] flex flex-col shadow-2xl border border-gray-700">
        <div className="p-6 pb-4 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Essence Upgrades</h2>
              <div className="text-purple-400 text-lg font-bold mt-1">
                <span className="text-sm text-gray-400">Available:</span> {totalEssence} Essence
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-3xl leading-none p-2"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('offensive')}
            className={`px-6 py-3 text-sm font-bold transition-all border-b-2 flex-1 ${
              activeTab === 'offensive'
                ? 'text-red-400 border-red-500 bg-red-900/20'
                : 'text-gray-400 border-transparent hover:text-red-300'
            }`}
          >
            ⚔️ Offensive
          </button>
          <button
            onClick={() => setActiveTab('defensive')}
            className={`px-6 py-3 text-sm font-bold transition-all border-b-2 flex-1 ${
              activeTab === 'defensive'
                ? 'text-blue-400 border-blue-500 bg-blue-900/20'
                : 'text-gray-400 border-transparent hover:text-blue-300'
            }`}
          >
            🛡️ Defensive
          </button>
          <button
            onClick={() => setActiveTab('economic')}
            className={`px-6 py-3 text-sm font-bold transition-all border-b-2 flex-1 ${
              activeTab === 'economic'
                ? 'text-yellow-400 border-yellow-500 bg-yellow-900/20'
                : 'text-gray-400 border-transparent hover:text-yellow-300'
            }`}
          >
            💰 Economic
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto p-6">
          {activeTab === 'offensive' && (
            <div className="space-y-3">
              {(['startingDamage', 'startingFireRate', 'multiShot', 'bounce'] as Array<keyof PermanentUpgrades>).map(type => renderUpgrade(type))}
            </div>
          )}
          {activeTab === 'defensive' && (
            <div className="space-y-3">
              {(['startingHealth'] as Array<keyof PermanentUpgrades>).map(type => renderUpgrade(type))}
            </div>
          )}
          {activeTab === 'economic' && (
            <div className="space-y-3">
              {(['goldMultiplier', 'essenceGain'] as Array<keyof PermanentUpgrades>).map(type => renderUpgrade(type))}
            </div>
          )}

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