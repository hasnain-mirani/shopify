import { NextRequest, NextResponse } from "next/server";
import { getAdminProducts } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search") ?? "";
    const products = await getAdminProducts(100);

    const filtered = search
      ? products.filter(
          (p) =>
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.handle.toLowerCase().includes(search.toLowerCase()),
        )
      : products;

    return NextResponse.json(
      filtered.slice(0, 30).map((p) => ({
        id: p.id,
        title: p.title,
        handle: p.handle,
        featuredImage: p.featuredImage ?? null,
        status: p.status,
      })),
    );
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
