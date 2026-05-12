import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAdminOrder, mapRawOrderToDashboard } from "@/lib/admin-data";
import { fetchOrderWithItems } from "@/lib/orders-server";
import { AdminPage, AdminCard } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatPrice } from "@/lib/utils";
import { ChevronLeft, Mail, Phone, MapPin, User, Package } from "lucide-react";
import { StatusControls } from "./StatusControls";

interface Props {
  params: { id: string };
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  let rawOrder: Record<string, unknown> & { items?: unknown[] } | null = null;
  try {
    rawOrder = await fetchOrderWithItems(id);
  } catch (e) {
    console.error("Failed to fetch raw order", e);
  }

  if (!rawOrder) {
    notFound();
  }

  let dashboardOrder = await getAdminOrder(id);
  if (!dashboardOrder) {
    dashboardOrder = mapRawOrderToDashboard(rawOrder);
  }

  const cName = String(rawOrder.customer_name ?? rawOrder.customerName ?? "");
  const cEmail = String(rawOrder.customer_email ?? rawOrder.customerEmail ?? "");
  const cPhone = String(rawOrder.customer_phone ?? rawOrder.customerPhone ?? "");
  const createdRaw = rawOrder.created_at ?? rawOrder.createdAt ?? Date.now();
  const createdForDate: string | number =
    typeof createdRaw === "string" || typeof createdRaw === "number"
      ? createdRaw
      : Date.now();

  const addr = String(rawOrder.address ?? "");
  const city = String(rawOrder.city ?? "");
  const postal = String(rawOrder.postal_code ?? rawOrder.postalCode ?? "");
  const country = String(rawOrder.country ?? "");

  const orderDate = new Date(dashboardOrder.createdAt).toLocaleString();

  return (
    <AdminPage
      title={dashboardOrder.name}
      description={`Placed on ${orderDate}`}
      actions={
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Orders
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Items */}
        <div className="lg:col-span-2 space-y-6">
          <AdminCard title="Items" className="overflow-hidden" contentClassName="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">Product</th>
                    <th className="px-5 py-3 text-right font-medium">Price</th>
                    <th className="px-5 py-3 text-right font-medium">Qty</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {rawOrder.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {item.image_url && (
                            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
                              <Image
                                src={item.image_url}
                                alt={item.product_title || "Product"}
                                fill
                                className="object-cover"
                                sizes="48px"
                                loading="lazy"
                                unoptimized
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{item.product_title}</div>
                            {item.variant_title && (
                              <div className="text-xs text-zinc-500">{item.variant_title}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {formatPrice(item.price, "PKR")}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-5 py-4 text-right font-medium">
                        {formatPrice(item.price * item.quantity, "PKR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="space-y-2 ml-auto max-w-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(String(Number(rawOrder.subtotal) || 0), "PKR")}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Shipping</span>
                  <span>{formatPrice(0, "PKR")}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                  <span>Total</span>
                  <span>{formatPrice(String(Number(rawOrder.total) || 0), "PKR")}</span>
                </div>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Payment & Fulfillment">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                <div className="space-y-3">
                  <div className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Financial Status</div>
                  <div className="flex items-center gap-3">
                    <StatusBadge kind="financial" value={dashboardOrder.displayFinancialStatus} />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Payment method: Cash on Delivery
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Fulfillment Status</div>
                  <div className="flex items-center gap-3">
                    <StatusBadge kind="fulfillment" value={dashboardOrder.displayFulfillmentStatus} />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {dashboardOrder.displayFulfillmentStatus === "fulfilled" 
                        ? "Order has been shipped" 
                        : "Order is ready for processing"}
                    </span>
                  </div>
                </div>
             </div>
             
             <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10">
                <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Actions</div>
                <StatusControls 
                  orderId={id} 
                  financialStatus={dashboardOrder.displayFinancialStatus} 
                  fulfillmentStatus={dashboardOrder.displayFulfillmentStatus} 
                />
             </div>
          </AdminCard>
        </div>

        {/* Sidebar: Customer Info */}
        <div className="space-y-6">
          <AdminCard title="Customer">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <User className="w-4 h-4 text-zinc-500" />
                </div>
                <div>
                  <div className="font-medium">{cName || "Guest Customer"}</div>
                  <div className="text-xs text-zinc-500">Order placed {new Date(createdForDate).toLocaleDateString()}</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-zinc-400" />
                  <span className="truncate">{cEmail || "No email"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-zinc-400" />
                  <span>{cPhone || "No phone"}</span>
                </div>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Shipping Address">
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                <MapPin className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{cName || "—"}</div>
                <div>{addr || "—"}</div>
                <div>{[city, postal].filter(Boolean).join(", ") || "—"}</div>
                <div>{country || "—"}</div>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Internal Notes">
            <p className="text-sm text-zinc-500 italic">
              No notes for this order.
            </p>
          </AdminCard>
        </div>
      </div>
    </AdminPage>
  );
}
