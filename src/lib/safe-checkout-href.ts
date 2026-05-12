/**
 * Resolves a cart checkout URL for in-app navigation. Rejects cross-origin
 * targets to avoid open redirects from API-supplied strings.
 */
export function safeCheckoutHref(checkoutUrl: string | null | undefined): string {
  const fallback = "/checkout";
  const raw = checkoutUrl?.trim();
  if (!raw) return fallback;
  try {
    const base =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "http://localhost";
    const u = new URL(raw, base);
    if (u.protocol !== "http:" && u.protocol !== "https:") return fallback;
    if (typeof window !== "undefined" && u.origin !== window.location.origin) {
      return fallback;
    }
    return `${u.pathname}${u.search}${u.hash}` || fallback;
  } catch {
    return fallback;
  }
}
