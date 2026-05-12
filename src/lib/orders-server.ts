import "server-only";
import { queryAll, queryOne } from "@/lib/db";

/** Raw order row + line items for admin and internal use (not exposed anonymously). */
export async function fetchOrderWithItems(orderId: string): Promise<Record<string, unknown> & { items: unknown[] } | null> {
  const order = await queryOne("SELECT * FROM orders WHERE id = ?", [orderId]);
  if (!order) return null;
  const items = await queryAll("SELECT * FROM order_items WHERE order_id = ?", [orderId]);
  return { ...order, items };
}

export async function listRecentOrders(limit: number): Promise<Array<Record<string, unknown> & { items: unknown[] }>> {
  const cap = Math.min(Math.max(limit, 1), 200);
  const orders = await queryAll("SELECT * FROM orders ORDER BY created_at DESC LIMIT ?", [cap]);
  return Promise.all(
    orders.map(async (o) => {
      const items = await queryAll("SELECT * FROM order_items WHERE order_id = ?", [o.id]);
      return { ...o, items };
    }),
  );
}
