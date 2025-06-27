# Simple Tower Defense

This is a simple tower defense game built using PixiJS, a 2D rendering engine for the web. See GAME_DESIGN.md for the game design document.

It uses ReactJS, Typescript and NextJS for the frontend.

## Architecture Overview

The game uses a clean architecture with clear separation of concerns:

### Core Architecture
- **GameCore** (`src/game/core/GameCore.ts`) - Contains all game logic without any rendering
- **Game** (`src/game/Game.ts`) - Extends GameCore and adds PIXI rendering
- **HeadlessGame** (`src/simulator/HeadlessGame.ts`) - Extends GameCore for simulation/testing

### Key Design Principles
1. **Decoupled Graphics**: All game logic is in GameCore, rendering is separate
2. **Entity/Renderer Separation**: Entities (Enemy, Tower, Projectile) contain only logic, Renderers handle visuals
3. **Event-Driven**: Uses EventEmitter for loose coupling between systems
4. **Object Pooling**: Enemies and projectiles are pooled for performance
5. **Testable**: HeadlessGame allows full game simulation without graphics

## Development Guidelines

### Building and Testing

1. **Always build and lint before committing**:
   ```bash
   npm run build     # Build and check for TypeScript errors
   npm run lint      # Run ESLint
   npm run test      # Run tests (if available)
   ```

2. **Use the simulator to test changes**:
   ```bash
   ./test-simulator.sh balanced 60 summary   # Test 60 seconds with balanced strategy
   ./test-simulator.sh adaptive 120 detailed # Detailed 2-minute test with adaptive strategy
   ```

3. **Test all strategies when making balance changes**:
   ```bash
   for strategy in cheapest damage balanced tank adaptive greedy economic; do
     echo "Testing $strategy..."
     ./test-simulator.sh $strategy 60 summary | grep "Survived:"
   done
   ```

### Code Organization

- `/src/game/core/` - Core game logic, constants, event system
- `/src/game/entities/` - Game entities (Enemy, Tower, Projectile)
- `/src/game/systems/` - Game systems (WaveSystem, CombatSystem, UpgradeSystem)
- `/src/game/renderers/` - PIXI rendering components
- `/src/game/effects/` - Visual effects manager
- `/src/simulator/` - Headless game simulation for testing

### Adding New Features

1. **Add logic to GameCore first** - Never add game logic to renderers
2. **Use the event system** - Emit events for important game state changes
3. **Test with simulator** - Ensure the feature works in headless mode
4. **Add rendering last** - Visual representation comes after logic is working

### Common Patterns

#### Adding a New Upgrade Type
1. Add to `UpgradeLevel` interface in `types/index.ts`
2. Add base cost and scaling in `UpgradeSystem`
3. Implement effect in `GameCore.purchaseUpgrade()` if needed
4. Add to UI in `GameUI.tsx`
5. Test with simulator before adding UI

#### Adding a New Enemy Type
1. Add to `EnemyType` enum
2. Create definition in `EnemyDefinitions`
3. Add to wave compositions
4. Test spawning and balance with simulator

#### Adding a New Ability
1. Add state tracking to `GameState` interface
2. Add constants (duration, cooldown, etc.)
3. Implement logic in `GameCore`
4. Add activation method
5. Test with simulator strategies

## Game Features

### Current Features
- **Starting Gold**: Players start with 15 gold for immediate choices
- **Three Upgrade Categories**: 
  - Offensive (Damage, Fire Rate, Range)
  - Defensive (Max Health, Health Regen)
  - Economic (Gold per Round, Interest)
- **Permanent Upgrades**: Essence-based progression between runs
- **Speed Boost Ability**: Active ability with 10s cooldown
- **Perfect Wave Bonuses**: 50% bonus gold for taking no damage
- **Kill Streak System**: 5 kills in 3s gives damage boost
- **Interest System**: Earn % of current gold per second

### Core Systems
- **Wave System**: Procedurally generated waves after wave 10
- **Combat System**: Tower auto-targets nearest enemy
- **Upgrade System**: In-game and permanent upgrades
- **Economic System**: Gold generation and interest mechanics
- **Object Pooling**: Efficient enemy/projectile management
- **Event System**: Decoupled communication between systems

### Enemy Types
- **Basic**: Standard balanced enemies
- **Swarm**: Fast, weak, spawn in groups
- **Tank**: Slow, high health, high reward
- **Splitter**: Splits into swarms on death

## PixiJS Documentation

See llms.txt for an index of all the PixiJS documentation files.
See llms-medium.txt for a more detailed version

## Development Style

- Try to write small, reusable components
- Use functional components and hooks for React UI
- Use TypeScript for type safety
- Use React for the UI
- Use PixiJS for rendering
- ALWAYS use Pixi v8 - be careful not to use legacy APIs
- Test with the simulator before implementing visuals
- Keep game logic and rendering completely separate

## Important Instructions

- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary
- ALWAYS prefer editing existing files to creating new ones
- NEVER proactively create documentation files (*.md) unless explicitly requested
- Always build and check for errors before considering a task complete
- Use the simulator to verify game balance changes