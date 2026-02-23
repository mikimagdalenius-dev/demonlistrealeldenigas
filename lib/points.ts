export function pointsFromDemon(position: number): number {
  const clamped = Math.min(75, Math.max(1, position));

  // Curva más agresiva: concentra muchos más puntos en los primeros puestos
  // manteniendo los extremos exactos (#1 = 500, #75 = 30).
  const start = 500;
  const end = 30;
  const k = 4; // mayor k => más peso en tops altos

  const t = (clamped - 1) / 74;
  const numerator = Math.exp(-k * t) - Math.exp(-k);
  const denominator = 1 - Math.exp(-k);
  const normalized = numerator / denominator;

  return Math.round(end + (start - end) * normalized);
}
