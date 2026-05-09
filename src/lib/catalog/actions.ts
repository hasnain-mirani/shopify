import { cache } from "react";
import { api } from "@/lib/api-client";
import type { Product } from "@/types";

export const TAGS = {
  products: "products",
  collections: "collections",
  search: "search",
} as const;

export interface GetProductsParams {
  sortKey?: string;
  reverse?: boolean;
  limit?: number;
  query?: string;
  after?: string;
}

/** Parse storefront-style `query` (e.g. tag:"X" AND available_for_sale:true). */
function parseStorefrontQuery(query: string | undefined): {
  tags: string[];
  inStockOnly: boolean;
  freeText: string;
} {
  if (!query?.trim()) return { tags: [], inStockOnly: false, freeText: "" };
  let rest = query;
  const tags: string[] = [];
  const re = /tag:\s*"([^"]+)"/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(query)) !== null) tags.push(m[1]);
  rest = rest.replace(/tag:\s*"[^"]+"\s*(AND\s*)?/gi, "");
  const inStockOnly = /available_for_sale:\s*true/i.test(rest);
  rest = rest.replace(/available_for_sale:\s*true\s*(AND\s*)?/gi, "");
  return { tags, inStockOnly, freeText: rest.replace(/\s+AND\s*$/i, "").trim() };
}

function isNewArrivalsLabel(tag: string): boolean {
  const t = tag.trim().toLowerCase();
  return t === "new arrivals" || t === "new arrival" || t === "new-arrivals";
}

function mapSortToApi(sortKey: string | undefined, reverse: boolean): string {
  switch (sortKey) {
    case "CREATED_AT":
      return reverse ? "created_desc" : "created_asc";
    case "PRICE":
      return reverse ? "price_desc" : "price_asc";
    case "TITLE":
      return "title_asc";
    case "BEST_SELLING":
    default:
      return "updated_desc";
  }
}

export async function getProducts(params: GetProductsParams = {}): Promise<Product[]> {
  const { limit = 24, query, after, sortKey = "BEST_SELLING", reverse = false } = params;
  const offset = after ? Number.parseInt(after, 10) : 0;
  const safeOffset = Number.isFinite(offset) && offset > 0 ? offset : 0;

  const parsed = parseStorefrontQuery(query);
  const primaryTag = parsed.tags[0];
  const newArrivalsNav = primaryTag ? isNewArrivalsLabel(primaryTag) : false;

  const sort =
    newArrivalsNav && sortKey === "BEST_SELLING"
      ? "created_desc"
      : mapSortToApi(sortKey, reverse);

  return api.products.list({
    limit,
    offset: safeOffset,
    search: parsed.freeText || undefined,
    tag: newArrivalsNav || !primaryTag ? undefined : primaryTag,
    newArrivals: newArrivalsNav,
    inStock: parsed.inStockOnly,
    sort,
  });
}

export const getProductByHandle = cache(async (handle: string): Promise<Product | null> => {
  if (!handle) return null;
  try {
    return await api.products.getByHandle(handle);
  } catch {
    return null;
  }
});

export async function getProductRecommendations(_productId: string): Promise<Product[]> {
  try {
    const all = await api.products.list({ limit: 8 });
    return all.sort(() => Math.random() - 0.5).slice(0, 4);
  } catch { return []; }
}

export async function getCollections(): Promise<Array<{
  id: string; handle: string; title: string; description: string;
  image: import("@/types").Image | null;
}>> {
  try {
    const products = await api.products.list({ limit: 120 });
    const bucketMap = new Map<string, { title: string; products: Product[] }>();

    const ensureBucket = (handle: string, title: string) => {
      if (!handle) return;
      if (!bucketMap.has(handle)) {
        bucketMap.set(handle, { title, products: [] });
      }
    };

    for (const p of products) {
      const typeHandle = slugify(p.productType || "");
      if (typeHandle) {
        ensureBucket(typeHandle, humanizeHandle(typeHandle));
        bucketMap.get(typeHandle)!.products.push(p);
      }

      for (const tag of p.tags || []) {
        const tagHandle = slugify(tag);
        if (!tagHandle) continue;
        ensureBucket(tagHandle, humanizeHandle(tagHandle));
        bucketMap.get(tagHandle)!.products.push(p);
      }
    }

    return Array.from(bucketMap.entries())
      .filter(([, bucket]) => bucket.products.length > 0)
      .slice(0, 24)
      .map(([handle, bucket]) => ({
        id: handle,
        handle,
        title: bucket.title,
        description: `${bucket.products.length} products`,
        image: bucket.products[0]?.featuredImage || null,
      }));
  } catch { return []; }
}

export async function getCollectionProducts(handle: string): Promise<{
  id: string; handle: string; title: string; description: string; descriptionHtml: string;
  image: import("@/types").Image | null;
  products: Product[];
} | null> {
  if (!handle) return null;
  try {
    const normalizedHandle = slugify(handle);
    const allProducts = await api.products.list({ limit: 250 });
    const matched = allProducts.filter((p) => matchesCollectionHandle(p, normalizedHandle));
    return {
      id: normalizedHandle,
      handle: normalizedHandle,
      title: humanizeHandle(normalizedHandle),
      description: "",
      descriptionHtml: "",
      image: matched[0]?.featuredImage || null,
      products: matched,
    };
  } catch { return null; }
}

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function humanizeHandle(handle: string): string {
  return handle
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function matchesCollectionHandle(product: Product, handle: string): boolean {
  const typeHandle = slugify(product.productType || "");
  if (typeHandle === handle) return true;
  const tagHandles = (product.tags || []).map((t) => slugify(t));
  return tagHandles.includes(handle);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const trimmed = query?.trim();
  if (!trimmed) return [];
  return api.products.list({ search: trimmed, limit: 24 });
}
