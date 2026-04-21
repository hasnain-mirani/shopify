import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product";
import { getCollectionProducts, getCollections } from "@/lib/shopify";
import { buildCollectionMetadata } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateStaticParams() {
  try {
    const collections = await getCollections();
    return collections.map((c) => ({ handle: c.handle }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionProducts(handle).catch(() => null);
  if (!collection) return { title: "Collection not found" };
  return buildCollectionMetadata(collection);
}

export default async function CollectionPage({ params }: PageProps) {
  const { handle } = await params;
  const collection = await getCollectionProducts(handle);
  if (!collection) notFound();

  return (
    <>
      {/* Hero */}
      <section className="relative">
        {collection.image ? (
          <div className="relative h-[45vh] min-h-[280px] max-h-[460px] w-full overflow-hidden">
            <Image
              src={collection.image.url}
              alt={collection.image.altText ?? collection.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 container-shop py-10 text-white">
              <span className="text-xs uppercase tracking-[0.25em] opacity-90">
                Collection
              </span>
              <h1 className="heading-display text-4xl md:text-6xl mt-2 max-w-3xl">
                {collection.title}
              </h1>
              {collection.description && (
                <p className="mt-3 max-w-xl text-sm text-white/80">
                  {collection.description}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="container-shop pt-12 pb-6">
            <span className="text-xs uppercase tracking-[0.25em] text-brand-500">
              Collection
            </span>
            <h1 className="heading-display text-3xl md:text-5xl text-brand-900 mt-2">
              {collection.title}
            </h1>
            {collection.description && (
              <p className="mt-3 max-w-xl text-sm text-brand-600">
                {collection.description}
              </p>
            )}
          </div>
        )}
      </section>

      <div className="container-shop py-10 md:py-14">
        <div className="mb-8 text-sm text-brand-500">
          {collection.products.length}{" "}
          {collection.products.length === 1 ? "product" : "products"}
        </div>

        {collection.products.length === 0 ? (
          <div className="py-16 text-center text-brand-600">
            No products in this collection yet.
          </div>
        ) : (
          <ProductGrid products={collection.products} />
        )}
      </div>
    </>
  );
}
