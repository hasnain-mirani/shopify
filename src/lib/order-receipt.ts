import "server-only";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const RECEIPT_AUDIENCE = "order-receipt";
const RECEIPT_ISSUER = "sshub-store";
/** Short-lived token for viewing a receipt after checkout (no PII in URL). */
const RECEIPT_TTL = "15m";

function receiptSecret(): Uint8Array {
  const raw =
    process.env.ORDER_RECEIPT_JWT_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim();
  if (!raw || raw.length < 32) {
    throw new Error(
      "Set ORDER_RECEIPT_JWT_SECRET (or ADMIN_SESSION_SECRET) to at least 32 characters for order receipts.",
    );
  }
  return new TextEncoder().encode(raw);
}

interface ReceiptPayload extends JWTPayload {
  oid: string;
}

export async function signOrderReceiptToken(orderId: string): Promise<string> {
  return await new SignJWT({ oid: orderId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(RECEIPT_TTL)
    .setAudience(RECEIPT_AUDIENCE)
    .setIssuer(RECEIPT_ISSUER)
    .sign(receiptSecret());
}

export async function verifyOrderReceiptToken(
  token: string | null | undefined,
): Promise<string | null> {
  if (!token?.trim()) return null;
  try {
    const { payload } = await jwtVerify(token.trim(), receiptSecret(), {
      audience: RECEIPT_AUDIENCE,
      issuer: RECEIPT_ISSUER,
    });
    const oid = (payload as ReceiptPayload).oid;
    return typeof oid === "string" && oid.length > 0 ? oid : null;
  } catch {
    return null;
  }
}
