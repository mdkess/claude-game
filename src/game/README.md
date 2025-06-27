# Game Architecture

## Directory Structure

```
game/
├── components/         # Core game objects
│   ├── Tower.ts       # Tower entity
│   └── Projectile.ts  # Projectile entity
├── core/              # Core systems
│   ├── EventEmitter.ts # Event system
│   ├── ObjectPool.ts   # Object pooling
│   └── types.ts        # Core type definitions
├── enemies/           # Enemy system
│   ├── Enemy.ts       # Main enemy class
│   ├── EnemyFactory.ts # Enemy creation
│   ├── components/    # Enemy components
│   │   ├── HealthComponent.ts
│   │   └── MovementComponent.ts
│   ├── strategies/    # Behavior strategies
│   │   └── DeathStrategy.ts
│   └── definitions/   # Enemy configurations
│       └── EnemyDefinitions.ts
├── systems/           # Game systems
│   ├── CombatSystem.ts # Combat logic
│   ├── UpgradeSystem.ts # Upgrade logic
│   └── WaveSystem.ts   # Wave spawning
├── types/             # Type definitions
│   └── index.ts       # Game types
└── Game.ts            # Main game class
```

## Key Patterns

### Event-Driven Architecture
- Systems communicate through events
- Decoupled components
- Easy to extend

### Object Pooling
- Reuse enemy and projectile objects
- Better performance with many entities
- Automatic memory management

### Component-Based Design
- Enemies use components for health, movement
- Strategies for different behaviors
- Easy to mix and match

### Factory Pattern
- Centralized enemy creation
- Data-driven enemy definitions
- Easy to add new enemy types

## Adding New Features

### New Enemy Type
1. Add to `EnemyType` enum in `types/index.ts`
2. Create definition in `EnemyDefinitions.ts`
3. Optionally create new movement/death strategies

### New Movement Pattern
1. Create new class implementing `MovementStrategy`
2. Use in enemy definitions

### New Death Behavior
1. Create new class implementing `DeathStrategy`
2. Use in enemy definitions

### New Tower Ability
1. Create ability component
2. Add to tower system
3. Emit events for effects