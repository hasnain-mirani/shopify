import { api } from "@/lib/api-client";
import type { AdminProductListItem, OrderKPIs, ShopInfo } from "@/types";

// Dashboard-specific order type (matches Shopify structure expected by dashboard)
interface DashboardOrder {
  id: string;
  name: string;
  createdAt: string;
  processedAt: string;
  displayFinancialStatus: string;
  displayFulfillmentStatus: string;
  customer: {
    id: string;
    displayName: string;
    email: string;
    phone?: string;
  } | null;
  totalPriceSet: {
    shopMoney: {
      amount: string;
      currencyCode: string;
    };
  };
  subtotalPriceSet: {
    shopMoney: {
      amount: string;
      currencyCode: string;
    };
  };
  currentTotalPriceSet: {
    shopMoney: {
      amount: string;
      currencyCode: string;
    };
  };
  lineItems: {
    nodes: Array<{
      id: string;
      title: string;
      quantity: number;
    }>;
  };
}

export const ADMIN_ORDER_TAG = "admin-orders";
export const ADMIN_PRODUCT_TAG = "admin-products";
export const ADMIN_SHOP_TAG = "admin-shop";

/** Normalize API/DB shapes (snake_case or camelCase) for custom order rows */
function normalizeOrderPayload(o: any) {
  if (!o) return o;
  return {
    ...o,
    customer_name: (o.customer_name ?? o.customerName ?? "").trim() || "",
    customer_email: (o.customer_email ?? o.customerEmail ?? "").trim().toLowerCase(),
    customer_phone: (o.customer_phone ?? o.customerPhone ?? "").trim() || "",
  };
}

/** Show customer column whenever we have contact or name — not only email */
function mapOrderCustomerSnapshot(o: any): DashboardOrder["customer"] {
  const name = String(o.customer_name ?? "").trim();
  const email = String(o.customer_email ?? "").trim();
  const phone = String(o.customer_phone ?? "").trim();
  if (!name && !email && !phone) return null;
  return {
    id: String(o.id),
    displayName: name || (phone ? `Phone: ${phone}` : email ? email : "Customer"),
    email: email || "",
    phone: phone || undefined,
  };
}

/** Maps a `/orders` or `/orders/:id` API row (+ items) into dashboard order shape */
export function mapRawOrderToDashboard(o: any): DashboardOrder {
  const row = normalizeOrderPayload(o);
  return {
      id: row.id,
      name: `#${String(row.id).split('-')[0].toUpperCase()}`,
      createdAt: row.created_at ?? row.createdAt,
      processedAt: row.created_at ?? row.createdAt,
      displayFinancialStatus: row.financial_status || row.financialStatus || 'pending',
      displayFulfillmentStatus: row.fulfillment_status || row.fulfillmentStatus || 'unfulfilled',
      customer: mapOrderCustomerSnapshot(row),
      totalPriceSet: {
        shopMoney: {
          amount: String(row.total ?? 0),
          currencyCode: 'PKR',
        },
      },
      subtotalPriceSet: {
        shopMoney: {
          amount: String(row.subtotal ?? row.total ?? 0),
          currencyCode: 'PKR',
        },
      },
      currentTotalPriceSet: {
        shopMoney: {
          amount: String(row.total ?? 0),
          currencyCode: 'PKR',
        },
      },
      lineItems: {
        nodes: (row.items || []).map((item: any) => ({
          id: item.id,
          title: item.product_title ?? item.productTitle ?? "",
          quantity: Number(item.quantity ?? 0),
        })),
      },
    };
}

export async function getShopInfo(): Promise<ShopInfo> {
  try {
    const settings = await api.settings.get();
    return {
      id: "local",
      name: settings.shop_name || "My Store",
      email: settings.shop_email || "",
      currencyCode: settings.currency_code || "PKR",
    };
  } catch {
    return { id: "local", name: "My Store", email: "", currencyCode: "PKR" };
  }
}

export async function getRecentOrders(first = 10): Promise<DashboardOrder[]> {
  try {
    const orders = await api.orders.list(first);
    return orders.map((o: any) => mapRawOrderToDashboard(o));
  } catch {
    return [];
  }
}

export async function getAdminOrder(id: string): Promise<DashboardOrder | null> {
  try {
    const o = await api.orders.get(id);
    if (!o) return null;
    return mapRawOrderToDashboard(o);
  } catch {
    return null;
  }
}

export async function getOrderKPIs(): Promise<OrderKPIs> {
  try {
    return await api.orders.getKPIs();
  } catch {
    return {
      ordersToday: 0,
      revenueToday: { amount: "0.00", currencyCode: "PKR" },
      averageOrderValue: { amount: "0.00", currencyCode: "PKR" },
    };
  }
}

export async function getAdminProducts(first = 50): Promise<AdminProductListItem[]> {
  try {
    const products = await api.products.list({ limit: first });
    return products.map((p: any) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      status: p.status as AdminProductListItem["status"],
      totalInventory: p.variants?.reduce((sum: number, v: any) => sum + (v.quantityAvailable || 0), 0) ?? 0,
      vendor: p.vendor || null,
      productType: p.productType || null,
      updatedAt: p.updatedAt,
      featuredImage: p.featuredImage
        ? { url: p.featuredImage.url, altText: p.featuredImage.alt_text || null }
        : null,
      priceRange: {
        min: p.priceRange?.minVariantPrice ?? { amount: "0", currencyCode: "PKR" },
        max: p.priceRange?.maxVariantPrice ?? { amount: "0", currencyCode: "PKR" },
      },
    }));
  } catch {
    return [];
  }
}
