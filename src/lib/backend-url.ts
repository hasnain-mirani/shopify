/**
 * Absolute base URL for the Express catalog API (server-side fetches from Next).
 * Prefer BACKEND_API_URL in .env.local for admin + server routes.
 * NEXT_PUBLIC_API_URL is only used when it is already an absolute http(s) URL.
 */
export function getBackendApiBase(): string {
  const dedicated = process.env.BACKEND_API_URL?.trim();
  if (dedicated) return dedicated.replace(/\/$/, "");

  const pub = process.env.NEXT_PUBLIC_API_URL?.trim() || "";
  if (/^https?:\/\//i.test(pub)) return pub.replace(/\/$/, "");

  return "http://127.0.0.1:4000/api";
}
