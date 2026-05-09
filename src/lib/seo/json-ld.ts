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
  const storeId = `${base}/#store`;

  const sameAs = Array.from(
    new Set([
      "https://instagram.com/sshub.store",
      ...orgSameAs(),
    ]),
  );

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: SITE_NAME,
        url: base,
        logo: { "@type": "ImageObject", url: logo },
        sameAs,
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
      {
        "@type": ["Store", "LocalBusiness"],
        "@id": storeId,
        name: "SSHUB",
        url: "https://www.sshub.store",
        telephone: "+92-302-9453605",
        email: "hasnainmirani1122@gmail.com",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Jahaz Chok, Chobara Road",
          addressLocality: "Layyah",
          addressRegion: "Punjab",
          addressCountry: "PK",
          postalCode: "31200",
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "09:00",
          closes: "22:00",
        },
        currenciesAccepted: "PKR",
        priceRange: "Rs 500 - Rs 15,000",
        areaServed: "PK",
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

  const availability = product.availableForSale
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  const offers: Record<string, unknown> = {
    "@type": "Offer",
    url,
    priceCurrency: currency,
    price: amount,
    availability,
    seller: { "@type": "Organization", name: SITE_NAME },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        value: "0",
        currency: "PKR",
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: {
          "@type": "QuantitativeValue",
          minValue: 1,
          maxValue: 2,
          unitCode: "DAY",
        },
        transitTime: {
          "@type": "QuantitativeValue",
          minValue: 2,
          maxValue: 5,
          unitCode: "DAY",
        },
      },
    },
  };

  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: cleanName,
    image: images.length ? images : undefined,
    description,
    brand: { "@type": "Brand", name: SITE_NAME },
    sku: product.id,
    offers,
  };

  const apiReviews = product.reviews;
  if (apiReviews && apiReviews.count > 0) {
    node.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: String(apiReviews.rating),
      reviewCount: String(apiReviews.count),
    };
  } else {
    const reviewCount = process.env.NEXT_PUBLIC_SEO_REVIEW_COUNT?.trim();
    const ratingVal = process.env.NEXT_PUBLIC_SEO_AGGREGATE_RATING?.trim();
    if (reviewCount && ratingVal) {
      node.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: ratingVal,
        reviewCount,
      };
    }
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
