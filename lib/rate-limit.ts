import { headers } from "next/headers";

// Rate limiter in-memory. Suficiente para una app pequeña en Vercel — cada
// lambda tiene su propio bucket, pero como el abuso real que intentamos
// frenar es flood por un único atacante, que cada instancia aplique su propio
// tope ya evita el 99% del daño.
const BUCKETS = new Map<string, number[]>();

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryInSec: number };

export async function rateLimit(
  action: string,
  limit = 5,
  windowMs = 5 * 60 * 1000,
): Promise<RateLimitResult> {
  // En Vercel, x-real-ip lo setea el edge con la IP real del cliente y NO es
  // spoofeable. x-forwarded-for sí lo es: un atacante puede inyectar
  // "X-Forwarded-For: 1.2.3.4" en su request, Vercel lo apenda detrás del
  // IP real, y el primer elemento del split es el spoofeado. Por eso
  // preferimos x-real-ip; solo caemos a XFF tomando el ÚLTIMO elemento (el
  // más cercano al edge) si x-real-ip no está disponible.
  const h = await headers();
  const real = h.get("x-real-ip");
  let ip: string;
  if (real) {
    ip = real.trim();
  } else {
    const xff = h.get("x-forwarded-for") ?? "";
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    ip = parts.length > 0 ? parts[parts.length - 1] : "unknown";
  }
  const key = `${action}:${ip}`;

  const now = Date.now();
  const bucket = BUCKETS.get(key) ?? [];
  const fresh = bucket.filter((t) => now - t < windowMs);

  if (fresh.length >= limit) {
    BUCKETS.set(key, fresh);
    const retryInSec = Math.max(
      1,
      Math.ceil((windowMs - (now - fresh[0])) / 1000),
    );
    return { ok: false, retryInSec };
  }

  fresh.push(now);
  BUCKETS.set(key, fresh);
  return { ok: true };
}
