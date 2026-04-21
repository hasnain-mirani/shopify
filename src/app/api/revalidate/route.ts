import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { updateTag } from "next/cache";
import { TAGS } from "@/lib/shopify";

/**
 * Shopify webhook → on-demand cache invalidation.
 *
 * Shopify signs every webhook with a base64 HMAC-SHA256 of the *raw* body,
 * using the app's shared secret. To verify we must read the raw bytes before
 * JSON-parsing (otherwise a reformat changes the digest).
 *
 * Configure on the Shopify side:
 *   Admin → Settings → Notifications → Webhooks
 *   Topic: products/create | products/update | products/delete
 *          collections/create | collections/update | collections/delete
 *   Format: JSON
 *   URL:    https://your-domain.com/api/revalidate
 *
 * The shared secret can come from two places:
 *   - For Custom apps: the app's "API secret key"
 *   - For legacy webhooks: the `SHOPIFY_REVALIDATION_SECRET` env var
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SECRET = process.env.SHOPIFY_REVALIDATION_SECRET ?? "";

function verifyHmac(rawBody: string, headerHmac: string | null): boolean {
  if (!SECRET || !headerHmac) return false;

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(rawBody, "utf8")
    .digest("base64");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(headerHmac, "utf8");
  // `timingSafeEqual` throws on length mismatch — guard explicitly.
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function tagsForTopic(topic: string): string[] {
  if (topic.startsWith("products/")) return [TAGS.products];
  if (topic.startsWith("collections/")) return [TAGS.collections, TAGS.products];
  if (topic.startsWith("inventory")) return [TAGS.products];
  return [];
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const hmac = req.headers.get("x-shopify-hmac-sha256");
  if (!verifyHmac(rawBody, hmac)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const topic = req.headers.get("x-shopify-topic") ?? "";
  const tags = tagsForTopic(topic);

  if (tags.length === 0) {
    return NextResponse.json(
      { ok: true, topic, revalidated: [] },
      { status: 200 },
    );
  }

  for (const tag of tags) updateTag(tag);

  return NextResponse.json(
    { ok: true, topic, revalidated: tags, at: new Date().toISOString() },
    { status: 200 },
  );
}

export async function GET() {
  // Tiny health-check so you can curl the endpoint during setup.
  return NextResponse.json({ ok: true, endpoint: "shopify revalidate" });
}
