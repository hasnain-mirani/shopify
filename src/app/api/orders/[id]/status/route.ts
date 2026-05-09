import { NextResponse } from "next/server";
import { execute, queryOne } from "@/lib/db";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const { financial_status, fulfillment_status } = body as {
      financial_status?: string;
      fulfillment_status?: string;
    };

    const order = await queryOne("SELECT id FROM orders WHERE id = ?", [id]);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (financial_status) {
      await execute("UPDATE orders SET financial_status = ? WHERE id = ?", [financial_status, id]);
    }

    if (fulfillment_status) {
      await execute("UPDATE orders SET fulfillment_status = ? WHERE id = ?", [fulfillment_status, id]);
    }

    const updated = await queryOne("SELECT * FROM orders WHERE id = ?", [id]);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update order status" },
      { status: 500 },
    );
  }
}
