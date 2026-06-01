/**
 * Ensure catalog API base ends with `/api` (avoids Vercel 404 on `/products/:id`).
 */
export function normalizeCatalogApiBase(base: string): string {
  const trimmed = base.trim().replace(/\/$/, "");
  if (!trimmed) return "http://127.0.0.1:4000/api";
  if (/\/api$/i.test(trimmed)) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return `${trimmed}/api`;
  return trimmed;
}

/**
 * Absolute base URL for the Express catalog API (server-side fetches from Next).
 * Prefer BACKEND_API_URL in .env.local for admin + server routes.
 * NEXT_PUBLIC_API_URL is only used when it is already an absolute http(s) URL.
 */
export function getBackendApiBase(): string {
  const dedicated = process.env.BACKEND_API_URL?.trim();
  if (dedicated) return normalizeCatalogApiBase(dedicated);

  const pub = process.env.NEXT_PUBLIC_API_URL?.trim() || "";
  if (/^https?:\/\//i.test(pub)) return normalizeCatalogApiBase(pub);

  return "http://127.0.0.1:4000/api";
}

export function isNextRunningOnVercel(): boolean {
  return Boolean(process.env.VERCEL);
}

/** Host:port (or host) the proxy will call — safe to show in error JSON. */
export function getBackendApiHostHint(): string {
  const base = getBackendApiBase();
  try {
    const normalized = /^https?:\/\//i.test(base) ? base : `http://${base}`;
    return new URL(normalized).host;
  } catch {
    return base.slice(0, 120);
  }
}

/**
 * When NEXT runs on Vercel with NEXT_PUBLIC_API_URL=/api, server fetches must use
 * BACKEND_API_URL. If it is unset, we fall back to localhost and every proxy returns "fetch failed".
 */
export function getBackendProxyMisconfigMessage(): string | null {
  if (!isNextRunningOnVercel()) return null;
  const base = getBackendApiBase();
  if (/^https?:\/\/(127\.0\.0\.1|localhost)/i.test(base)) {
    return "BACKEND_API_URL is not set on this Vercel project (Next is trying 127.0.0.1). In Vercel → Next.js project → Environment Variables, set BACKEND_API_URL to your Express base URL including /api (e.g. https://shopify-np2m.vercel.app/api), then redeploy.";
  }
  return null;
}
