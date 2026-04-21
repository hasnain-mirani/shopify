import type { MetadataRoute } from "next";
import { getCollections, getProducts } from "@/lib/shopify";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static, hand-maintained routes.
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/collections`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Dynamic Shopify entries. Wrap in try/catch so a Shopify outage doesn't
  // break the whole sitemap response.
  let productEntries: MetadataRoute.Sitemap = [];
  let collectionEntries: MetadataRoute.Sitemap = [];

  try {
    const [products, collections] = await Promise.all([
      getProducts({ limit: 250 }),
      getCollections(),
    ]);

    productEntries = products.map((p) => ({
      url: `${SITE_URL}/products/${p.handle}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    collectionEntries = collections.map((c) => ({
      url: `${SITE_URL}/collections/${c.handle}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    // Swallow — static entries still return.
  }

  return [...staticEntries, ...collectionEntries, ...productEntries];
}
