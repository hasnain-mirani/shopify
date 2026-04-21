/**
 * Admin API data fetchers. All server-only.
 */
import "server-only";

import { shopifyAdminFetch, connectionToArray } from "@/lib/shopify-admin";
import {
  ADMIN_SHOP_INFO_QUERY,
  ADMIN_ORDER_KPIS_QUERY,
  ADMIN_RECENT_ORDERS_QUERY,
  ADMIN_PRODUCTS_LIST_QUERY,
} from "@/lib/shopify/admin-queries";

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface AdminMoney {
  amount: string;
  currencyCode: string;
}

export interface AdminShopInfo {
  id: string;
  name: string;
  email: string;
  myshopifyDomain: string;
  currencyCode: string;
}

export interface AdminOrder {
  id: string;
  name: string;
  createdAt: string;
  processedAt: string | null;
  displayFinancialStatus: string | null;
  displayFulfillmentStatus: string | null;
  customer: {
    id: string;
    displayName: string | null;
    email: string | null;
  } | null;
  totalPriceSet: { shopMoney: AdminMoney };
  subtotalPriceSet: { shopMoney: AdminMoney };
  currentTotalPriceSet: { shopMoney: AdminMoney };
  lineItems: Array<{ id: string; title: string; quantity: number }>;
}

export interface AdminProductListItem {
  id: string;
  title: string;
  handle: string;
  status: "ACTIVE" | "ARCHIVED" | "DRAFT";
  totalInventory: number | null;
  vendor: string | null;
  productType: string | null;
  updatedAt: string;
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: {
    min: AdminMoney;
    max: AdminMoney;
  };
}

export interface OrderKPIs {
  ordersToday: number;
  revenueToday: AdminMoney;
  averageOrderValue: AdminMoney;
}

/* ─── Fetchers ───────────────────────────────────────────────────────── */

export const ADMIN_ORDER_TAG = "admin-orders";
export const ADMIN_PRODUCT_TAG = "admin-products";
export const ADMIN_SHOP_TAG = "admin-shop";

interface RawConnection<T> {
  nodes?: T[] | null;
  edges?: Array<{ node: T }> | null;
  pageInfo?: { hasNextPage: boolean; endCursor: string | null };
}

export async function getShopInfo(): Promise<AdminShopInfo> {
  const { data } = await shopifyAdminFetch<{ shop: AdminShopInfo }>({
    query: ADMIN_SHOP_INFO_QUERY,
    tags: [ADMIN_SHOP_TAG],
    revalidate: 3600,
  });
  return data.shop;
}

type RawOrder = Omit<AdminOrder, "lineItems" | "customer"> & {
  customer: AdminOrder["customer"];
  lineItems: RawConnection<AdminOrder["lineItems"][number]>;
};

export async function getRecentOrders(first = 10): Promise<AdminOrder[]> {
  const { data } = await shopifyAdminFetch<{
    orders: RawConnection<RawOrder>;
  }>({
    query: ADMIN_RECENT_ORDERS_QUERY,
    variables: { first, query: null },
    tags: [ADMIN_ORDER_TAG],
    revalidate: 0,
  });

  return connectionToArray(data.orders).map((o) => ({
    ...o,
    lineItems: connectionToArray(o.lineItems),
  }));
}

/**
 * Compute today's KPIs (orders count, revenue, AOV) from the Admin API.
 * Uses Shopify's query syntax to pull orders created today.
 */
export async function getOrderKPIs(): Promise<OrderKPIs> {
  const today = new Date();
  const iso = today.toISOString().slice(0, 10); // YYYY-MM-DD
  const query = `created_at:>=${iso}`;

  const { data } = await shopifyAdminFetch<{
    orders: RawConnection<{
      id: string;
      createdAt: string;
      currentTotalPriceSet: { shopMoney: AdminMoney };
    }>;
  }>({
    query: ADMIN_ORDER_KPIS_QUERY,
    variables: { query },
    tags: [ADMIN_ORDER_TAG],
    revalidate: 0,
  });

  const orders = connectionToArray(data.orders);

  const currency = orders[0]?.currentTotalPriceSet.shopMoney.currencyCode ?? "USD";
  let sum = 0;
  for (const o of orders) {
    const n = Number.parseFloat(o.currentTotalPriceSet.shopMoney.amount);
    if (Number.isFinite(n)) sum += n;
  }
  const aov = orders.length > 0 ? sum / orders.length : 0;

  return {
    ordersToday: orders.length,
    revenueToday: { amount: sum.toFixed(2), currencyCode: currency },
    averageOrderValue: { amount: aov.toFixed(2), currencyCode: currency },
  };
}

type RawAdminProduct = {
  id: string;
  title: string;
  handle: string;
  status: AdminProductListItem["status"];
  totalInventory: number | null;
  vendor: string | null;
  productType: string | null;
  updatedAt: string;
  featuredMedia: {
    preview?: { image?: { url: string; altText: string | null } | null } | null;
  } | null;
  priceRangeV2: {
    minVariantPrice: AdminMoney;
    maxVariantPrice: AdminMoney;
  };
};

export async function getAdminProducts(first = 50): Promise<AdminProductListItem[]> {
  const { data } = await shopifyAdminFetch<{
    products: RawConnection<RawAdminProduct>;
  }>({
    query: ADMIN_PRODUCTS_LIST_QUERY,
    variables: { first, query: null },
    tags: [ADMIN_PRODUCT_TAG],
    revalidate: 0,
  });

  return connectionToArray(data.products).map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    status: p.status,
    totalInventory: p.totalInventory,
    vendor: p.vendor,
    productType: p.productType,
    updatedAt: p.updatedAt,
    featuredImage: p.featuredMedia?.preview?.image ?? null,
    priceRange: {
      min: p.priceRangeV2.minVariantPrice,
      max: p.priceRangeV2.maxVariantPrice,
    },
  }));
}
