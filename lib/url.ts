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
