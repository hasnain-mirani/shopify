import { removeEdgesAndNodes } from "./client";
import type {
  ShopifyCart,
  ShopifyCartLine,
  ShopifyCollection,
  ShopifyImage,
  ShopifyProduct,
  ShopifyVariant,
  Cart,
} from "@/types/shopify";

/**
 * Raw Shopify responses use `{ edges: [{ node }] }` for images/variants/lines.
 * These normalizers flatten them into the plain arrays that `@/types/shopify`
 * expects, so downstream code never has to know about edges.
 */

export type Connection<T> =
  | { edges?: Array<{ node: T }> | null; nodes?: T[] | null }
  | null
  | undefined;

export interface RawProduct extends Omit<ShopifyProduct, "images" | "variants"> {
  images: Connection<ShopifyImage>;
  variants: Connection<ShopifyVariant>;
}

export interface RawCartLine extends Omit<ShopifyCartLine, "merchandise"> {
  merchandise: ShopifyCartLine["merchandise"] & {
    product: ShopifyCartLine["merchandise"]["product"] & {
      images?: Connection<ShopifyImage>;
    };
  };
}

export interface RawCart extends Omit<ShopifyCart, "lines"> {
  lines: Connection<RawCartLine>;
}

export interface RawCollection
  extends Omit<ShopifyCollection, "products"> {
  products?: Connection<RawProduct>;
}

export function normalizeProduct(raw: RawProduct | null | undefined): ShopifyProduct | null {
  if (!raw) return null;
  return {
    ...raw,
    images: removeEdgesAndNodes(raw.images),
    variants: removeEdgesAndNodes(raw.variants),
  };
}

export function normalizeProducts(raw: Array<RawProduct | null | undefined>): ShopifyProduct[] {
  return raw
    .map((p) => normalizeProduct(p))
    .filter((p): p is ShopifyProduct => p !== null);
}

export function normalizeCollection(
  raw: RawCollection | null | undefined,
): ShopifyCollection | null {
  if (!raw) return null;
  const productEdges = removeEdgesAndNodes(raw.products);
  return {
    ...raw,
    products: normalizeProducts(productEdges),
  };
}

export function normalizeCart(raw: RawCart | null | undefined): Cart | null {
  if (!raw) return null;
  const lines = removeEdgesAndNodes(raw.lines);
  return {
    ...raw,
    items: lines.map((line) => {
      const product = line.merchandise.product;
      const featuredImage =
        product.featuredImage ?? removeEdgesAndNodes(product.images)[0] ?? null;
      return {
        id: line.id,
        quantity: line.quantity,
        variant_id: line.merchandise.id,
        product_title: product.title,
        variant_title: line.merchandise.title,
        price: 0, // TODO: Extract from line.merchandise.price
        image_url: featuredImage?.url ?? "",
      };
    }),
  };
}

/**
 * Cache tags used with Next.js `fetch({ next: { tags } })` and `revalidateTag`.
 * Centralised so mutations can invalidate exactly what reads depend on.
 */
export const TAGS = {
  products: "products",
  collections: "collections",
  cart: "cart",
  search: "search",
} as const;
