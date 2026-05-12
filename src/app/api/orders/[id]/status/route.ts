import { NextResponse } from "next/server";
import { execute, queryOne } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-api-auth";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await isAdminAuthenticated();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update order status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
