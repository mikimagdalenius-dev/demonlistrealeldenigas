import { cookies } from "next/headers";

const COOKIE_NAME = "admin_token";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 horas

// Fail-closed: en producción, si falta la env var lanzamos en vez de caer en
// un valor por defecto conocido. En dev dejamos el fallback para que `npm
// run dev` siga funcionando sin .env.local.
function requireEnv(key: string, devFallback: string): string {
  const value = process.env[key];
  if (value) return value;
  if (process.env.NODE_ENV !== "production") return devFallback;
  throw new Error(`Missing required env: ${key}`);
}

function secret(): string {
  return requireEnv("ADMIN_SECRET", "dev-secret-change-me");
}

function password(): string {
  return requireEnv("ADMIN_PASSWORD", "Flow");
}

export function checkAdminPassword(input: string): boolean {
  return input === password();
}

export async function isAdminAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === secret();
}

export async function setAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, secret(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
