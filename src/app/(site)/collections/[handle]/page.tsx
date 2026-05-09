import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getCollectionProducts, getCollections } from "@/lib/catalog";
import { buildCollectionMetadata } from "@/lib/metadata";
import { buildBreadcrumbJsonLd } from "@/lib/seo/json-ld";
import { getCollectionSeoParagraph } from "@/lib/seo/collection-copy";
import { isSafeStaticSegment } from "@/lib/safe-static-segment";
import { isExcludedNavCategory } from "@/lib/nav-categories";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ handle: string }>;
}

export async function generateStaticParams() {
  try {
    const collections = await getCollections();
    return collections
      .map((c) => ({ handle: c.handle }))
      .filter((p) => isSafeStaticSegment(p.handle));
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
  const [collection, allCollections] = await Promise.all([
    getCollectionProducts(handle),
    getCollections().catch(() => []),
  ]);
  if (!collection) notFound();

  const related = allCollections
    .filter((c) => c.handle !== handle && !isExcludedNavCategory(c.title, `/collections/${c.handle}`))
    .slice(0, 4);

  const bannerAlt =
    collection.image?.altText?.trim() ||
    `${collection.title} collection banner - SSHUB`;

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: collection.title, path: `/collections/${handle}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbLd} />
      {/* Hero */}
      <section className="relative">
        {collection.image ? (
          <div className="relative h-[45vh] min-h-[280px] max-h-[460px] w-full overflow-hidden">
            <Image
              src={collection.image.url}
              alt={bannerAlt}
              fill
              priority
              fetchPriority="high"
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
            <div className="mb-4">
              <Breadcrumbs
                items={[
                  { name: "Home", href: "/" },
                  { name: collection.title },
                ]}
              />
            </div>
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
        {collection.image ? (
          <div className="mb-6">
            <Breadcrumbs
              items={[
                { name: "Home", href: "/" },
                { name: collection.title },
              ]}
            />
          </div>
        ) : null}
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

        {related.length > 0 ? (
          <section
            className="mt-14 border-t border-brand-200/80 pt-10 dark:border-white/10"
            aria-labelledby="related-collections-heading"
          >
            <h2
              id="related-collections-heading"
              className="font-display text-xl font-semibold text-brand-900 dark:text-white"
            >
              You might also like
            </h2>
            <p className="mt-1 text-sm text-brand-600 dark:text-brand-300">
              Explore related categories at SSHUB.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/collections/${c.handle}`}
                    className="block rounded-xl border border-brand-200/80 bg-white/60 px-4 py-3 text-sm font-semibold text-brand-900 transition hover:border-accent hover:text-accent dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section
          className="mt-12 border-t border-brand-200/80 pt-10 dark:border-white/10"
          aria-labelledby="collection-seo-copy"
        >
          <h2 id="collection-seo-copy" className="sr-only">
            About {collection.title}
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-brand-700 dark:text-brand-200">
            {getCollectionSeoParagraph(handle, collection.title)}
          </p>
        </section>
      </div>
    </>
  );
}
