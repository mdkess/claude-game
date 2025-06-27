#!/bin/bash

echo "Tower Defense Strategy Comparison"
echo "================================="
echo ""
echo "Testing all strategies for 60 seconds with moderate permanent upgrades"
echo "Permanent Upgrades: damage=2, fireRate=1, health=3, multiShot=2, bounce=2"
echo ""

STRATEGIES=("cheapest" "damage" "balanced" "tank" "adaptive" "greedy")
TIME=60
LOG_LEVEL="none"
DAMAGE=2
FIRE_RATE=1
HEALTH=3
MULTI_SHOT=2
BOUNCE=2

for strategy in "${STRATEGIES[@]}"; do
  echo "Testing $strategy strategy..."
  ./test-simulator.sh $strategy $TIME $LOG_LEVEL $DAMAGE $FIRE_RATE $HEALTH $MULTI_SHOT $BOUNCE | grep -E "(Survived:|Final Wave:|Enemies Killed:|Gold Efficiency:|Total Upgrades:)"
  echo ""
done