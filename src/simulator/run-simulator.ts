#!/usr/bin/env tsx

import { Simulator } from './Simulator';
import { strategies } from './strategies';
import { SimulatorConfig } from './types';
import { PermanentUpgrades } from '../game/types';

// Parse command line arguments
const args = process.argv.slice(2);
const strategyName = args[0] || 'balanced';
const maxTime = parseFloat(args[1]) || 100; // Default 100 seconds
const logLevel = args[2] as 'none' | 'summary' | 'detailed' || 'summary';

// Optional permanent upgrades from args
const permanentUpgrades: PermanentUpgrades = {
  startingDamage: parseInt(args[3]) || 0,
  startingFireRate: parseInt(args[4]) || 0,
  startingHealth: parseInt(args[5]) || 0,
  goldMultiplier: 1 + (parseFloat(args[8]) || 0) * 0.1, // Each level adds 10%
  essenceGain: 1 + (parseFloat(args[9]) || 0) * 0.1, // Each level adds 10%
  multiShot: parseInt(args[6]) || 0,
  bounce: parseInt(args[7]) || 0
};

// Get strategy
const strategy = strategies[strategyName as keyof typeof strategies];
if (!strategy) {
  console.error(`Unknown strategy: ${strategyName}`);
  console.error(`Available strategies: ${Object.keys(strategies).join(', ')}`);
  process.exit(1);
}

// Configure simulator
const config: SimulatorConfig = {
  maxSimulatedTime: maxTime,
  timeStep: 1/60, // 60 FPS equivalent
  strategyUpdateInterval: 1, // Update strategy every 1 second
  permanentUpgrades,
  logLevel
};

// Run simulation
const simulator = new Simulator(config, strategy);
const result = simulator.run();

// Exit with appropriate code
process.exit(result.success ? 0 : 1);