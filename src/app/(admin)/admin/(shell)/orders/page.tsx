import type { Metadata } from "next";
import { getRecentOrders } from "@/lib/admin-data";
import { AdminPage, AdminCard, AdminEmpty } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatPrice, truncate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage() {
  let orders: Awaited<ReturnType<typeof getRecentOrders>> = [];
  let error: string | null = null;
  try {
    orders = await getRecentOrders(50);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load orders.";
  }

  return (
    <AdminPage
      title="Orders"
      description="The 50 most recent orders, newest first. Revalidated on every visit."
    >
      {error ? (
        <AdminEmpty
          title="Could not load orders"
          description={error}
        />
      ) : orders.length === 0 ? (
        <AdminEmpty
          title="No orders yet"
          description="Orders will appear here as soon as your first customer checks out."
        />
      ) : (
        <AdminCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Order</th>
                  <th className="px-5 py-3 text-left font-medium">Customer</th>
                  <th className="px-5 py-3 text-left font-medium">Items</th>
                  <th className="px-5 py-3 text-left font-medium">Payment</th>
                  <th className="px-5 py-3 text-left font-medium">Fulfillment</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {orders.map((o) => {
                  const itemCount = o.lineItems.reduce(
                    (s, li) => s + li.quantity,
                    0,
                  );
                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                      <td className="px-5 py-3">
                        <div className="font-medium">{o.name}</div>
                        <div className="text-xs text-zinc-500">
                          {new Date(o.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {o.customer ? (
                          <>
                            <div>{truncate(o.customer.displayName ?? "—", 30)}</div>
                            <div className="text-xs text-zinc-500">
                              {o.customer.email ?? ""}
                            </div>
                          </>
                        ) : (
                          <span className="text-zinc-400">Guest</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        {itemCount} item{itemCount === 1 ? "" : "s"}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge
                          kind="financial"
                          value={o.displayFinancialStatus}
                        />
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge
                          kind="fulfillment"
                          value={o.displayFulfillmentStatus}
                        />
                      </td>
                      <td className="px-5 py-3 text-right font-medium">
                        {formatPrice(
                          o.currentTotalPriceSet.shopMoney.amount,
                          o.currentTotalPriceSet.shopMoney.currencyCode,
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}
    </AdminPage>
  );
}
