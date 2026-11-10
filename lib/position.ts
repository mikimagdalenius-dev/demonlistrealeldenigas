// shortcut: "reciente" = último cambio en los últimos 14 días; si queréis "desde la última semana" exacta, cambiar aquí.
const RECENT_MS = 14 * 24 * 60 * 60 * 1000;

/** Posiciones ganadas (+) o perdidas (−) en el último cambio reciente; null si no hubo. */
export function recentMove(history: { position: number; changedAt: Date | string }[], now = Date.now()): number | null {
  const [last, prev] = history;
  if (!last || !prev) return null;
  if (now - new Date(last.changedAt).getTime() > RECENT_MS) return null;
  const diff = prev.position - last.position;
  return diff === 0 ? null : diff;
}
