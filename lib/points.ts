export function pointsFromDemon(position: number): number {
  const clamped = Math.min(75, Math.max(1, position));

  // Curva ultra-agresiva: mucho peso al top alto
  // manteniendo extremos exactos (#1 = 500, #75 = 10).
  const start = 500;
  const end = 10;
  const k = 6; // mayor k => más peso en tops altos

  const t = (clamped - 1) / 74;
  const numerator = Math.exp(-k * t) - Math.exp(-k);
  const denominator = 1 - Math.exp(-k);
  const normalized = numerator / denominator;

  return Math.round(end + (start - end) * normalized);
}
