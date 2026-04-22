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
  const h = await headers();
  const xff = h.get("x-forwarded-for") ?? "";
  const ip =
    xff.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
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
