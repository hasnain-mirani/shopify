import { NextResponse } from "next/server";

const BACKEND_API_BASE = process.env.BACKEND_API_URL || "http://localhost:4000/api";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "20";

    const res = await fetch(
      `${BACKEND_API_BASE.replace(/\/$/, "")}/orders?limit=${encodeURIComponent(limit)}`,
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
