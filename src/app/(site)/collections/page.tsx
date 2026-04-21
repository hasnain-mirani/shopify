import type { Metadata } from "next";
import { CollectionCard } from "@/components/home";
import { getCollections } from "@/lib/shopify";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 900;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(
    "Collections",
    "Explore every edit. Shop our curated collections.",
    "/collections",
  );
}

export default async function CollectionsPage() {
  const collections = await getCollections().catch(() => []);

  return (
    <div className="container-shop py-10 md:py-14">
      <header className="mb-10 text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-brand-500">
          Collections
        </span>
        <h1 className="heading-display text-3xl md:text-5xl text-brand-900 mt-2">
          Shop by edit
        </h1>
        <p className="mt-3 text-sm text-brand-600 max-w-xl mx-auto">
          Curated groupings, refreshed each season.
        </p>
      </header>

      {collections.length === 0 ? (
        <div className="py-16 text-center text-brand-600">
          No collections yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {collections.map((c, i) => (
            <CollectionCard key={c.id} collection={c} priority={i < 3} />
          ))}
        </div>
      )}
    </div>
  );
}
