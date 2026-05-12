import type { Metadata } from "next";
import type { Collection, Product } from "@/types";
import { getSiteUrl } from "@/lib/site-url";
import {
  plainTextFromHtml,
  stripEmojisForSeo,
  truncateMetaDescription,
} from "@/lib/seo/text";
import { formatPrice, truncate } from "./utils";

const SITE_NAME = "SSHUB";
const DEFAULT_DESCRIPTION =
  "Premium phone accessories, smartwatches, power banks, and mobile tech in Pakistan — SSHUB.";

function absoluteUrl(path: string): string {
  const base = getSiteUrl();
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
 * Title/description formats optimized for Pakistan e‑commerce SERPs.
 */
export function buildProductMetadata(product: Product): Metadata {
  const cleanTitle = stripEmojisForSeo(product.title);
  const absoluteTitle = `${cleanTitle} — Buy Online in Pakistan | ${SITE_NAME}`;

  const price = formatPrice(
    product.priceRange.minVariantPrice.amount,
    product.priceRange.minVariantPrice.currencyCode,
  );

  const descFromSeo =
    product.seo?.description?.trim() ||
    plainTextFromHtml(product.descriptionHtml ?? "") ||
    product.description?.trim() ||
    "";

  const featureHint = truncate(
    descFromSeo.replace(/\s+/g, " "),
    80,
  ) || `Quality ${(product.productType ?? "accessory").toLowerCase()} for daily use.`;

  const description = truncateMetaDescription(
    `Buy ${cleanTitle} at ${SITE_NAME}. ${featureHint} ${price}. Fast delivery across Pakistan. Free returns.`,
    160,
  );

  const image = firstImage(product.images) ?? (product.featuredImage
    ? { url: product.featuredImage.url, alt: product.featuredImage.altText ?? "" }
    : null);

  const url = absoluteUrl(`/products/${product.handle}`);
  const ogTitle = `${cleanTitle} | ${SITE_NAME}`;
  const ogDesc = truncateMetaDescription(
    descFromSeo || `${cleanTitle} — ${price}. Shop online at ${SITE_NAME}.`,
    200,
  );
  const priceAmount = product.priceRange.minVariantPrice.amount;
  const priceCurrency =
    product.priceRange.minVariantPrice.currencyCode || "PKR";

  return {
    title: { absolute: absoluteTitle },
    description,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      url,
      siteName: SITE_NAME,
      images: image ? [{ url: image.url, alt: image.alt || ogTitle }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDesc,
      images: image ? [image.url] : undefined,
    },
    other: {
      "og:type": "product",
      "product:price:amount": String(priceAmount),
      "product:price:currency": priceCurrency,
    },
    robots: product.availableForSale
      ? undefined
      : { index: false, follow: true },
  };
}

/**
 * Build `Metadata` for a collection page.
 */
export function buildCollectionMetadata(collection: Collection): Metadata {
  const collectionTitle = collection.seo?.title ?? collection.title;
  const absoluteTitle = `Buy ${collectionTitle} Online in Pakistan — Best Prices | ${SITE_NAME}`;
  const descSource =
    collection.seo?.description?.trim() ||
    collection.description?.trim() ||
    DEFAULT_DESCRIPTION;

  const description = truncateMetaDescription(
    `Shop ${collectionTitle} online in Pakistan at ${SITE_NAME}. ${truncate(descSource.replace(/\s+/g, " "), 100)} Best prices on mobile accessories & tech. Fast delivery.`,
    160,
  );
  const url = absoluteUrl(`/collections/${collection.handle}`);
  const image = collection.image
    ? {
        url: collection.image.url,
        alt:
          collection.image.altText ??
          `${collectionTitle} collection - ${SITE_NAME}`,
      }
    : null;

  return {
    title: { absolute: absoluteTitle },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: absoluteTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: image ? [{ url: image.url, alt: image.alt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle,
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

/** Homepage — absolute title so the root title template is not applied twice. */
export function buildHomeMetadata(): Metadata {
  const title = `${SITE_NAME} — Premium Mobile Accessories & Smart Tech`;
  const desc = truncate(
    "Premium phone accessories, smartwatches, power banks, and mobile tech in Pakistan — fast delivery, COD, and curated quality at SSHUB.",
    160,
  );
  const url = absoluteUrl("/");
  return {
    title: { absolute: title },
    description: desc,
    alternates: { canonical: url },
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
