import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-api-auth";
import { listRecentOrders } from "@/lib/orders-server";

export async function GET(req: Request) {
  try {
    const admin = await isAdminAuthenticated();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
    const orders = await listRecentOrders(Number.isFinite(limit) ? limit : 20);
    return NextResponse.json({ orders });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch orders";
    return NextResponse.json({ error: message, orders: [] }, { status: 500 });
  }
}
