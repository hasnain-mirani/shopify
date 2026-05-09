import { NextResponse } from "next/server";
import { execute } from "@/lib/db";

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL;
const SHOULD_PROXY = Boolean(RAW_API_URL && /^https?:\/\//.test(RAW_API_URL));
const BACKEND_URL =
  SHOULD_PROXY && RAW_API_URL
    ? RAW_API_URL.replace(/\/$/, "")
    : "http://localhost:4000/api";

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

export async function POST() {
  try {
    if (!SHOULD_PROXY) {
      await ensureCartTables();
      const id = crypto.randomUUID();
      await execute("INSERT INTO carts (id) VALUES (?)", [id]);
      return NextResponse.json(
        {
          id,
          totalQuantity: 0,
          items: [],
          cost: {
            subtotalAmount: { amount: "0", currencyCode: "PKR" },
            totalAmount: { amount: "0", currencyCode: "PKR" },
          },
        },
        { status: 201 },
      );
    }

    const res = await fetch(`${BACKEND_URL}/cart`, { method: "POST", cache: "no-store" });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(data ?? { error: "Failed to create cart" }, { status: res.status });
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    // Graceful fallback so storefront can still initialize without backend.
    return NextResponse.json(
      {
        id: crypto.randomUUID(),
        totalQuantity: 0,
        items: [],
        cost: {
          subtotalAmount: { amount: "0", currencyCode: "PKR" },
          totalAmount: { amount: "0", currencyCode: "PKR" },
        },
      },
      { status: 201 },
    );
  }
}
