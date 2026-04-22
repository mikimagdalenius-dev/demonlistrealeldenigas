/**
 * Devuelve la URL si usa http/https, o "#" si no es segura.
 * Usado en los href del cliente para prevenir javascript: URLs.
 */
export function safeHref(url: string): string {
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:" ? url : "#";
  } catch {
    return "#";
  }
}

/**
 * Trimea, añade https:// si falta protocolo y valida http/https.
 * Empty string in → empty string out (no lanza). Throws "URL inválida"
 * si el valor no está vacío pero no se puede normalizar.
 */
export function normalizeUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return value;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const { protocol } = new URL(withProtocol);
    if (protocol !== "http:" && protocol !== "https:") throw new Error();
    return withProtocol;
  } catch {
    throw new Error("URL inválida");
  }
}

/**
 * Versión "safe" de normalizeUrl: devuelve null si el input está vacío o
 * no se puede normalizar. Pensada para campos opcionales.
 */
export function tryNormalizeUrl(raw: string): string | null {
  try {
    const normalized = normalizeUrl(raw);
    return normalized === "" ? null : normalized;
  } catch {
    return null;
  }
}
