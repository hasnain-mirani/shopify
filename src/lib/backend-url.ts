import { getSiteUrl } from "@/lib/site-url";

const DEFAULT_API_PATH = "/api";

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

/** Relative API path from NEXT_PUBLIC_API_URL (default `/api`). */
export function getCatalogApiPath(): string {
  const pub = process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_PATH;
  if (pub.startsWith("/")) return pub.replace(/\/$/, "") || DEFAULT_API_PATH;
  if (/^https?:\/\//i.test(pub)) {
    try {
      return new URL(pub).pathname.replace(/\/$/, "") || DEFAULT_API_PATH;
    } catch {
      return DEFAULT_API_PATH;
    }
  }
  return DEFAULT_API_PATH;
}

export function isNextRunningOnVercel(): boolean {
  return Boolean(process.env.VERCEL);
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

/**
 * This Next.js deployment's catalog API (products, orders, users, settings, cart when local).
 * Use for server actions and admin routes that have matching handlers under `src/app/api/*`.
 */
export function getNextAppApiBase(request?: Request): string {
  const apiPath = getCatalogApiPath();
  if (isNextRunningOnVercel()) {
    return `${getSiteUrl()}${apiPath}`.replace(/\/$/, "");
  }
  if (request) {
    const origin = new URL(request.url).origin;
    return `${origin}${apiPath}`.replace(/\/$/, "");
  }
  return getBackendApiBase();
}

/**
 * Express-only features (FCM, site-notifications, notify). Never same-origin (would loop).
 */
export function getProxyApiBase(): string {
  return getBackendApiBase();
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
    return "BACKEND_API_URL is not set on this Vercel project (Next is trying 127.0.0.1). In Vercel → Environment Variables, set BACKEND_API_URL to your Express base URL including /api (e.g. https://shopify-np2m.vercel.app/api), then redeploy.";
  }
  return null;
}
