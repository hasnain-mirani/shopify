import { NextResponse } from "next/server";
import { queryAll, queryOne } from "@/lib/db";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const order = await queryOne("SELECT * FROM orders WHERE id = ?", [id]);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const items = await queryAll("SELECT * FROM order_items WHERE order_id = ?", [id]);

    return NextResponse.json({ ...order, items });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to fetch order" }, { status: 500 });
  }
}
