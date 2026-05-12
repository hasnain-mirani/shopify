import { NextResponse } from "next/server";
import { verifyOrderReceiptToken } from "@/lib/order-receipt";
import { fetchOrderWithItems } from "@/lib/orders-server";

/**
 * Public read-only order lookup using a short-lived signed receipt token
 * (returned from POST /api/orders). Avoids exposing order UUIDs in URLs.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const orderId = await verifyOrderReceiptToken(token);
    if (!orderId) {
      return NextResponse.json({ error: "Invalid or expired receipt link." }, { status: 401 });
    }
    const order = await fetchOrderWithItems(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
