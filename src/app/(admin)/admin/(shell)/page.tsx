import type { Metadata } from "next";
import Link from "next/link";
import { getOrderKPIs, getRecentOrders } from "@/lib/admin-data";
import { AdminPage, AdminCard, AdminStat, AdminEmpty } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatPrice, truncate } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const [kpis, recentOrders] = await Promise.all([
    getOrderKPIs().catch(() => null),
    getRecentOrders(10).catch(() => [] as Awaited<ReturnType<typeof getRecentOrders>>),
  ]);

  return (
    <AdminPage
      title="Dashboard"
      description="Today's performance and the most recent activity in your store."
    >
      <section className="grid gap-4 sm:grid-cols-3 mb-8">
        <AdminStat
          label="Orders today"
          value={kpis ? kpis.ordersToday.toString() : "—"}
          sub={kpis ? undefined : "Admin API not configured"}
        />
        <AdminStat
          label="Revenue today"
          value={
            kpis
              ? formatPrice(kpis.revenueToday.amount, kpis.revenueToday.currencyCode)
              : "—"
          }
        />
        <AdminStat
          label="Average order"
          value={
            kpis
              ? formatPrice(
                  kpis.averageOrderValue.amount,
                  kpis.averageOrderValue.currencyCode,
                )
              : "—"
          }
        />
      </section>

      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-lg font-semibold tracking-tight">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            View all <ArrowUpRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <AdminEmpty
            title="No orders yet"
            description="Once customers check out, their orders will show up here in real time."
          />
        ) : (
          <AdminCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">Order</th>
                    <th className="px-5 py-3 text-left font-medium">Customer</th>
                    <th className="px-5 py-3 text-left font-medium">Payment</th>
                    <th className="px-5 py-3 text-left font-medium">Fulfillment</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {recentOrders.map((o) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        )}
      </section>
    </AdminPage>
  );
}
