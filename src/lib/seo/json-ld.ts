import { getSiteUrl } from "@/lib/site-url";
import type { Product } from "@/types";
import {
  plainTextFromHtml,
  stripEmojisForSeo,
  truncateMetaDescription,
} from "./text";

const SITE_NAME = "SSHUB";

function orgSameAs(): string[] {
  const raw = process.env.NEXT_PUBLIC_ORG_SAME_AS?.trim();
  if (raw) {
    return raw.split(/[,|]/).map((s) => s.trim()).filter(Boolean);
  }
  return [
    "https://www.instagram.com/sshub.store",
    "https://twitter.com/sshub",
  ];
}

export function buildHomeJsonLd() {
  const base = getSiteUrl();
  const logo = `${base}/brand/sshub-mark.svg`;
  const orgId = `${base}/#organization`;
  const webId = `${base}/#website`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: SITE_NAME,
        url: base,
        logo: { "@type": "ImageObject", url: logo },
        sameAs: orgSameAs(),
      },
      {
        "@type": "WebSite",
        "@id": webId,
        url: base,
        name: SITE_NAME,
        publisher: { "@id": orgId },
        potentialAction: {
          "@type": "SearchAction",
          target: `${base}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export function buildProductJsonLd(product: Product) {
  const base = getSiteUrl();
  const cleanName = stripEmojisForSeo(product.title);
  const url = `${base}/products/${product.handle}`;
  const descHtml = product.descriptionHtml ?? "";
  const description = truncateMetaDescription(
    plainTextFromHtml(descHtml || product.description || cleanName),
    5000,
  );

  const images = (product.images?.length ? product.images : product.featuredImage
    ? [product.featuredImage]
    : []
  )
    .map((i) => i.url)
    .filter(Boolean);

  const amount = product.priceRange.minVariantPrice.amount;
  const currency = product.priceRange.minVariantPrice.currencyCode || "PKR";
  const sku =
    product.variants?.find((v) => v.sku)?.sku ??
    product.variants?.[0]?.id ??
    product.id;

  const availability = product.availableForSale
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: cleanName,
    image: images.length ? images : undefined,
    description,
    brand: { "@type": "Brand", name: SITE_NAME },
    sku,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price: amount,
      availability,
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };

  const reviewCount = process.env.NEXT_PUBLIC_SEO_REVIEW_COUNT?.trim();
  const ratingVal = process.env.NEXT_PUBLIC_SEO_AGGREGATE_RATING?.trim();
  if (reviewCount && ratingVal) {
    node.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: ratingVal,
      reviewCount,
    };
  }

  return node;
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${base}${it.path.startsWith("/") ? it.path : `/${it.path}`}`,
    })),
  };
}
