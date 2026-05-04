import type { Metadata } from "next";
import type { ShopifyCollection, ShopifyProduct } from "@/types";
import { formatPrice, truncate } from "./utils";

const SITE_NAME = "Glow Store PK";
const DEFAULT_DESCRIPTION =
  "Phone accessories, home decor, and cosy bundle deals — hand-picked for the aesthetically curious.";

function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}

function firstImage(images: Array<{ url: string; altText?: string | null }> | undefined) {
  const first = images?.[0];
  if (!first) return null;
  return { url: first.url, alt: first.altText ?? "" };
}

/**
 * Build Next.js `Metadata` for a product detail page.
 *
 * Uses:
 *   - Product's SEO overrides from Shopify when present, else falls back to
 *     title/description.
 *   - First product image for OG / Twitter cards.
 *   - Price prefix in description so it surfaces in SERP snippets.
 */
export function buildProductMetadata(product: ShopifyProduct): Metadata {
  const title = product.seo?.title ?? product.title;
  const descSource =
    product.seo?.description?.trim() || product.description?.trim() || "";

  const price = formatPrice(
    product.priceRange.minVariantPrice.amount,
    product.priceRange.minVariantPrice.currencyCode,
  );

  const description =
    truncate(descSource, 150) || `${product.title} — from ${price}.`;

  const image = firstImage(product.images) ?? (product.featuredImage
    ? { url: product.featuredImage.url, alt: product.featuredImage.altText ?? "" }
    : null);

  const url = absoluteUrl(`/products/${product.handle}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: image ? [{ url: image.url, alt: image.alt || title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image.url] : undefined,
    },
    robots: product.availableForSale
      ? undefined
      : { index: false, follow: true },
  };
}

/**
 * Build `Metadata` for a collection page.
 */
export function buildCollectionMetadata(collection: ShopifyCollection): Metadata {
  const title = collection.seo?.title ?? collection.title;
  const descSource =
    collection.seo?.description?.trim() ||
    collection.description?.trim() ||
    DEFAULT_DESCRIPTION;

  const description = truncate(descSource, 160);
  const url = absoluteUrl(`/collections/${collection.handle}`);
  const image = collection.image
    ? { url: collection.image.url, alt: collection.image.altText ?? title }
    : null;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: image ? [{ url: image.url, alt: image.alt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image.url] : undefined,
    },
  };
}

/**
 * Generic page metadata builder for static routes (about, contact, etc.)
 * and programmatic pages (search results, category landing).
 */
export function buildPageMetadata(
  title: string,
  description?: string,
  path?: string,
): Metadata {
  const desc = truncate(description ?? DEFAULT_DESCRIPTION, 160);
  const url = path ? absoluteUrl(path) : undefined;
  return {
    title,
    description: desc,
    alternates: url ? { canonical: url } : undefined,
    openGraph: {
      type: "website",
      title,
      description: desc,
      url,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
    },
  };
}
