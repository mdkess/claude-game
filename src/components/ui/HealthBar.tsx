interface HealthBarProps {
  health: number;
  maxHealth: number;
  healthRegen?: number;
}

export function HealthBar({ health, maxHealth, healthRegen }: HealthBarProps) {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700/50 flex-1 max-w-[200px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-white text-xs font-bold">Health</span>
        {healthRegen && healthRegen > 0 && (
          <span className="text-green-400 text-xs">+{healthRegen.toFixed(1)}/s</span>
        )}
      </div>
      <div className="w-full h-2 bg-gray-700 rounded-full">
        <div
          className="h-full bg-green-500 rounded-full transition-all"
          style={{ width: `${(health / maxHealth) * 100}%` }}
        />
      </div>
      <div className="text-white text-xs mt-0.5 text-center">
        {Math.ceil(health)} / {maxHealth}
      </div>
    </div>
  );
}