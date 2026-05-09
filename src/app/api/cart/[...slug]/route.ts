import { NextResponse } from "next/server";
import { execute, queryAll } from "@/lib/db";
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL;
const SHOULD_PROXY = Boolean(RAW_API_URL && /^https?:\/\//.test(RAW_API_URL));
const BACKEND_URL =
  SHOULD_PROXY
    ? (RAW_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api")
    : "http://localhost:4000/api";

type CartItemRow = {
  id: string;
  cart_id: string;
  variant_id: string;
  product_title: string;
  variant_title: string;
  price: number;
  quantity: number;
  image_url: string;
};

async function ensureCartTables() {
  await execute(`
    CREATE TABLE IF NOT EXISTS carts (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await execute(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      cart_id TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
      variant_id TEXT NOT NULL,
      product_title TEXT NOT NULL,
      variant_title TEXT NOT NULL DEFAULT '',
      price NUMERIC NOT NULL DEFAULT 0,
      quantity INTEGER NOT NULL DEFAULT 1,
      image_url TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function toCartPayload(cartId: string, items: CartItemRow[]) {
  const totalQuantity = items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
  const subtotal = items.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0), 0);
  return {
    id: cartId,
    totalQuantity,
    items,
    cost: {
      subtotalAmount: { amount: String(subtotal), currencyCode: "PKR" },
      totalAmount: { amount: String(subtotal), currencyCode: "PKR" },
    },
  };
}

async function forward(
  method: "GET" | "POST" | "PUT" | "DELETE",
  slug: string[],
  body?: unknown,
) {
  if (!SHOULD_PROXY) {
    await ensureCartTables();

    const [cartId, segment, itemId] = slug;
    if (!cartId) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

    if (method === "GET" && !segment) {
      const cartRows = await queryAll("SELECT id FROM carts WHERE id = ?", [cartId]);
      if (!cartRows[0]) return NextResponse.json({ error: "Cart not found" }, { status: 404 });
      const items = (await queryAll("SELECT * FROM cart_items WHERE cart_id = ? ORDER BY created_at ASC", [cartId])) as CartItemRow[];
      return NextResponse.json(toCartPayload(cartId, items));
    }

    if (method === "POST" && segment === "items") {
      const cartRows = await queryAll("SELECT id FROM carts WHERE id = ?", [cartId]);
      if (!cartRows[0]) return NextResponse.json({ error: "Cart not found" }, { status: 404 });
      const input = (body ?? {}) as {
        variantId?: string;
        productTitle?: string;
        variantTitle?: string;
        price?: number;
        quantity?: number;
        imageUrl?: string;
      };
      if (!input.variantId || !input.productTitle) {
        return NextResponse.json({ error: "Missing variantId or productTitle" }, { status: 400 });
      }
      await execute(
        "INSERT INTO cart_items (id, cart_id, variant_id, product_title, variant_title, price, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          crypto.randomUUID(),
          cartId,
          input.variantId,
          input.productTitle,
          input.variantTitle ?? "",
          Number(input.price ?? 0),
          Math.max(1, Number(input.quantity ?? 1)),
          input.imageUrl ?? "",
        ],
      );
      const items = (await queryAll("SELECT * FROM cart_items WHERE cart_id = ? ORDER BY created_at ASC", [cartId])) as CartItemRow[];
      return NextResponse.json(toCartPayload(cartId, items));
    }

    if (method === "PUT" && segment === "items" && itemId) {
      const input = (body ?? {}) as { quantity?: number };
      const qty = Math.max(1, Number(input.quantity ?? 1));
      await execute("UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?", [qty, itemId, cartId]);
      const items = (await queryAll("SELECT * FROM cart_items WHERE cart_id = ? ORDER BY created_at ASC", [cartId])) as CartItemRow[];
      return NextResponse.json(toCartPayload(cartId, items));
    }

    if (method === "DELETE" && segment === "items" && itemId) {
      await execute("DELETE FROM cart_items WHERE id = ? AND cart_id = ?", [itemId, cartId]);
      const items = (await queryAll("SELECT * FROM cart_items WHERE cart_id = ? ORDER BY created_at ASC", [cartId])) as CartItemRow[];
      return NextResponse.json(toCartPayload(cartId, items));
    }

    return NextResponse.json({ error: "Invalid cart route" }, { status: 400 });
  }

  const res = await fetch(`${BACKEND_URL}/cart/${slug.join("/")}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok && method === "GET") {
    return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  }
  return NextResponse.json(data ?? { error: "Cart API error" }, { status: res.status });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string[] }> },
) {
  try {
    const { slug } = await context.params;
    return await forward("GET", slug ?? []);
  } catch (err) {
    return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string[] }> },
) {
  try {
    const { slug } = await context.params;
    const body = await request.json().catch(() => undefined);
    return await forward("POST", slug ?? [], body);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reach cart backend";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ slug: string[] }> },
) {
  try {
    const { slug } = await context.params;
    const body = await request.json().catch(() => undefined);
    return await forward("PUT", slug ?? [], body);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reach cart backend";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string[] }> },
) {
  try {
    const { slug } = await context.params;
    return await forward("DELETE", slug ?? []);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reach cart backend";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
