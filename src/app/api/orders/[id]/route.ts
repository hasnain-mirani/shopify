import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-api-auth";
import { fetchOrderWithItems } from "@/lib/orders-server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await isAdminAuthenticated();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const order = await fetchOrderWithItems(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
