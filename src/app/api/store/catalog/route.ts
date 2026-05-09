import { NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";

/**
 * Paginated catalog for client-side infinite scroll / SWR.
 * `offset` maps to SQL OFFSET on the products API.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(48, Math.max(1, Number(searchParams.get("limit") || 24)));
  const offset = Math.max(0, Number(searchParams.get("offset") || 0));
  const q = searchParams.get("q")?.trim() || undefined;

  try {
    const products = await getProducts({
      limit,
      query: q,
      after: offset > 0 ? String(offset) : undefined,
    });
    return NextResponse.json({ products, offset, limit });
  } catch {
    return NextResponse.json({ products: [], offset, limit });
  }
}
