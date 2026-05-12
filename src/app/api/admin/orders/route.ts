import { NextResponse } from "next/server";
import { getBackendApiBase } from "@/lib/backend-url";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "20";
    const base = getBackendApiBase();

    const res = await fetch(
      `${base}/orders?limit=${encodeURIComponent(limit)}`,
      { cache: "no-store" },
    );

    const text = await res.text();
    let data: any = [];
    try {
      data = text ? JSON.parse(text) : [];
    } catch {
      data = [];
    }

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch orders", orders: [] }, { status: res.status });
    }

    const orders = Array.isArray(data) ? data : data?.orders || [];
    return NextResponse.json({ orders });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to fetch orders", orders: [] }, { status: 500 });
  }
}
