interface EconomicBonusesProps {
  goldPerRound?: number;
  interestRate?: number;
}

export function EconomicBonuses({ goldPerRound, interestRate }: EconomicBonusesProps) {
  if ((!goldPerRound || goldPerRound <= 0) && (!interestRate || interestRate <= 0)) {
    return null;
  }

  return (
    <div className="flex justify-end mt-1">
      <div className="bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded border border-gray-700/50 text-xs">
        {goldPerRound && goldPerRound > 0 && (
          <span className="text-yellow-300 mr-3">+{goldPerRound}/wave</span>
        )}
        {interestRate && interestRate > 0 && (
          <span className="text-green-300">+{(interestRate * 100).toFixed(0)}%/s</span>
        )}
      </div>
    </div>
  );
}