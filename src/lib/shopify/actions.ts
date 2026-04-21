"use server";

import { shopifyFetch } from "./client";
import {
  COLLECTIONS_QUERY,
  COLLECTION_PRODUCTS_QUERY,
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCT_RECOMMENDATIONS_QUERY,
  SEARCH_QUERY,
} from "./queries";
import {
  TAGS,
  normalizeCollection,
  normalizeProduct,
  normalizeProducts,
  type RawCollection,
  type RawProduct,
} from "./normalizers";
import type {
  ShopifyCollection,
  ShopifyConnection,
  ShopifyProduct,
} from "@/types/shopify";

/**
 * Default revalidation window (seconds) for catalog reads.
 * Mutations call `revalidateTag` to invalidate these on demand.
 */
const CATALOG_REVALIDATE = 60 * 15;

export interface GetProductsParams {
  sortKey?: string;
  reverse?: boolean;
  limit?: number;
  query?: string;
  after?: string;
}

export async function getProducts(
  params: GetProductsParams = {},
): Promise<ShopifyProduct[]> {
  const { sortKey = "BEST_SELLING", reverse = false, limit = 24, query, after } = params;

  const { data } = await shopifyFetch<{
    products: ShopifyConnection<RawProduct>;
  }>({
    query: PRODUCTS_QUERY,
    variables: { first: limit, sortKey, reverse, query, after },
    tags: [TAGS.products],
    revalidate: CATALOG_REVALIDATE,
  });

  const nodes = (data.products?.edges ?? []).map((e) => e.node);
  return normalizeProducts(nodes);
}

export async function getProductByHandle(
  handle: string,
): Promise<ShopifyProduct | null> {
  if (!handle) return null;

  const { data } = await shopifyFetch<{
    product: RawProduct | null;
  }>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    tags: [TAGS.products, `${TAGS.products}:${handle}`],
    revalidate: CATALOG_REVALIDATE,
  });

  return normalizeProduct(data.product);
}

export async function getProductRecommendations(
  productId: string,
): Promise<ShopifyProduct[]> {
  if (!productId) return [];

  const { data } = await shopifyFetch<{
    productRecommendations: RawProduct[] | null;
  }>({
    query: PRODUCT_RECOMMENDATIONS_QUERY,
    variables: { productId },
    tags: [TAGS.products, `${TAGS.products}:recommendations:${productId}`],
    revalidate: CATALOG_REVALIDATE,
  });

  return normalizeProducts(data.productRecommendations ?? []).slice(0, 8);
}

export async function getCollections(): Promise<
  Array<Pick<ShopifyCollection, "id" | "handle" | "title" | "description" | "image">>
> {
  const { data } = await shopifyFetch<{
    collections: ShopifyConnection<
      Pick<ShopifyCollection, "id" | "handle" | "title" | "description" | "image"> & {
        updatedAt?: string;
      }
    >;
  }>({
    query: COLLECTIONS_QUERY,
    variables: { first: 12 },
    tags: [TAGS.collections],
    revalidate: CATALOG_REVALIDATE,
  });

  return (data.collections?.edges ?? []).map((e) => e.node);
}

export async function getCollectionProducts(
  handle: string,
): Promise<ShopifyCollection | null> {
  if (!handle) return null;

  const { data } = await shopifyFetch<{
    collection: RawCollection | null;
  }>({
    query: COLLECTION_PRODUCTS_QUERY,
    variables: { handle, first: 24 },
    tags: [
      TAGS.collections,
      TAGS.products,
      `${TAGS.collections}:${handle}`,
    ],
    revalidate: CATALOG_REVALIDATE,
  });

  return normalizeCollection(data.collection);
}

export async function searchProducts(query: string): Promise<ShopifyProduct[]> {
  const trimmed = query?.trim();
  if (!trimmed) return [];

  const { data } = await shopifyFetch<{
    products: ShopifyConnection<RawProduct>;
  }>({
    query: SEARCH_QUERY,
    variables: { query: trimmed, first: 24 },
    tags: [TAGS.search, TAGS.products],
    // Search is highly dynamic; keep it short.
    revalidate: 30,
  });

  const nodes = (data.products?.edges ?? []).map((e) => e.node);
  return normalizeProducts(nodes);
}
