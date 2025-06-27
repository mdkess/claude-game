#!/bin/bash

echo "Tower Defense Game Simulator"
echo "============================"
echo ""
echo "Usage: ./test-simulator.sh [strategy] [time] [log_level] [damage] [fireRate] [health] [multiShot] [bounce] [goldMult] [essenceMult]"
echo ""
echo "Strategies: cheapest, damage, balanced, tank, adaptive, greedy"
echo "Log levels: none, summary, detailed"
echo ""

# Default values
STRATEGY=${1:-balanced}
TIME=${2:-100}
LOG_LEVEL=${3:-summary}
DAMAGE=${4:-0}
FIRE_RATE=${5:-0}
HEALTH=${6:-0}
MULTI_SHOT=${7:-0}
BOUNCE=${8:-0}
GOLD_MULT=${9:-0}
ESSENCE_MULT=${10:-0}

echo "Running simulation with:"
echo "  Strategy: $STRATEGY"
echo "  Time: ${TIME}s"
echo "  Log Level: $LOG_LEVEL"
echo "  Permanent Upgrades: damage=$DAMAGE, fireRate=$FIRE_RATE, health=$HEALTH, multiShot=$MULTI_SHOT, bounce=$BOUNCE"
echo "  Multipliers: gold=$GOLD_MULT, essence=$ESSENCE_MULT"
echo ""

# Run the simulator
npx tsx src/simulator/run-simulator.ts $STRATEGY $TIME $LOG_LEVEL $DAMAGE $FIRE_RATE $HEALTH $MULTI_SHOT $BOUNCE $GOLD_MULT $ESSENCE_MULT