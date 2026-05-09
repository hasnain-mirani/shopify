/**
 * Canonical site origin for sitemaps, robots, metadata, and server-side absolute URLs.
 *
 * Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://www.sshub.store`) in production.
 * On Vercel, falls back to `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL` so
 * robots/sitemap are not stuck on localhost when the env var is missing.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionHost) {
    const host = productionHost.replace(/^https?:\/\//i, "");
    return `https://${host}`;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    const host = vercelUrl.replace(/^https?:\/\//i, "");
    return `https://${host}`;
  }

  return "http://localhost:3000";
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}
