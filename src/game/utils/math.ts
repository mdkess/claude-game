// Mathematical utility functions

export function normalizeVector(dx: number, dy: number): { x: number; y: number } {
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance === 0) return { x: 0, y: 0 };
  return { x: dx / distance, y: dy / distance };
}