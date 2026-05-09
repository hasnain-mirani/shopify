import type { MetadataRoute } from "next";
import { getCollections, getProducts } from "@/lib/catalog";
import { getAllPosts } from "@/lib/journal";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE_URL = getSiteUrl();
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
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/journal`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${SITE_URL}/wishlist`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const journalEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_URL}/journal/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.55,
  }));

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

  return [
    ...staticEntries,
    ...journalEntries,
    ...collectionEntries,
    ...productEntries,
  ];
}
