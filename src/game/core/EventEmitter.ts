// Re-export everything from TypedEventEmitter for backward compatibility
export type { GameEventMap, TypedEventHandler as EventHandler, GameEventData } from './TypedEventEmitter';
export { 
  TypedEventEmitter as EventEmitter,
  typedGameEvents as gameEvents,
  GameEvents
} from './TypedEventEmitter';