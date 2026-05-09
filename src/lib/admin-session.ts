import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const ADMIN_SESSION_COOKIE = "admin_session";
const ADMIN_SESSION_AUDIENCE = "admin-panel";
const ADMIN_SESSION_ISSUER = "store";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

export interface AdminSessionPayload extends JWTPayload {
  uid: string;
  iat: number;
  exp: number;
}

function getSecret(): Uint8Array {
  const raw = process.env.ADMIN_SESSION_SECRET;
  if (!raw || raw.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be set and at least 32 characters.");
  }
  return new TextEncoder().encode(raw);
}

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

export async function verifyAdminSession(token: string | undefined | null): Promise<AdminSessionPayload | null> {
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

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function checkAdminPassword(attempt: string): boolean {
  const expected = process.env.ADMIN_PANEL_PASSWORD;
  if (!expected || expected.length < 4) {
    throw new Error("ADMIN_PANEL_PASSWORD is not set.");
  }
  return safeEqual(attempt, expected);
}
