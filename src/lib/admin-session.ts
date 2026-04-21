/**
 * Admin panel session cookie helpers.
 *
 * Uses `jose` (Web-Crypto based) so the same helpers work in Node runtime
 * AND the Edge middleware runtime.
 *
 * The cookie carries a short-lived signed JWT. We don't store anything on the
 * server — verifying the signature with ADMIN_SESSION_SECRET is enough.
 */
import "server-only";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const ADMIN_SESSION_COOKIE = "admin_session";
const ADMIN_SESSION_AUDIENCE = "admin-panel";
const ADMIN_SESSION_ISSUER = "shopify-store";

/** Session lives 8 hours. Refresh on activity if you want longer. */
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

export interface AdminSessionPayload extends JWTPayload {
  /** Stable user id — for now just "admin" since we have a single password. */
  uid: string;
  /** Issued-at epoch seconds. */
  iat: number;
  /** Expiry epoch seconds. */
  exp: number;
}

function getSecret(): Uint8Array {
  const raw = process.env.ADMIN_SESSION_SECRET;
  if (!raw || raw.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be set and at least 32 characters. " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"",
    );
  }
  return new TextEncoder().encode(raw);
}

/** Create a signed session token for the given uid. */
export async function signAdminSession(uid: string): Promise<string> {
  const secret = getSecret();
  return await new SignJWT({ uid })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_TTL_SECONDS}s`)
    .setAudience(ADMIN_SESSION_AUDIENCE)
    .setIssuer(ADMIN_SESSION_ISSUER)
    .sign(secret);
}

/**
 * Verify a session token and return the decoded payload, or `null` when the
 * token is missing, malformed, expired, or tampered with.
 *
 * Safe to call from Edge middleware.
 */
export async function verifyAdminSession(
  token: string | undefined | null,
): Promise<AdminSessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      audience: ADMIN_SESSION_AUDIENCE,
      issuer: ADMIN_SESSION_ISSUER,
    });
    if (typeof payload.uid !== "string") return null;
    return payload as AdminSessionPayload;
  } catch {
    return null;
  }
}

/** Constant-time password comparison to avoid timing attacks. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Validate the admin login password against the configured env secret. */
export function checkAdminPassword(attempt: string): boolean {
  const expected = process.env.ADMIN_PANEL_PASSWORD;
  if (!expected || expected.length < 4) {
    throw new Error(
      "ADMIN_PANEL_PASSWORD is not set. Add a strong password to .env.local.",
    );
  }
  return safeEqual(attempt, expected);
}
