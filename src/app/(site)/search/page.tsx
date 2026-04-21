import type { Metadata } from "next";
import { SearchView } from "@/components/product/SearchView";
import { searchProducts } from "@/lib/shopify";
import { buildPageMetadata } from "@/lib/metadata";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q ? `Search: ${q}` : "Search";
  return buildPageMetadata(
    title,
    "Search our catalog for products, collections, and more.",
    "/search",
  );
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;

  // Pre-fetch once on the server so the initial paint shows results for
  // users coming in via a URL like /search?q=jacket or when JS is off.
  const initialResults = q.trim()
    ? await searchProducts(q).catch(() => [])
    : [];

  return <SearchView initialQuery={q} initialResults={initialResults} />;
}
