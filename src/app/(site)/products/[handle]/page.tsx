import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ProductGrid,
  ProductImageGallery,
  ProductPurchasePanel,
} from "@/components/product";
import {
  getProductByHandle,
  getProductRecommendations,
  getProducts,
} from "@/lib/shopify";
import { buildProductMetadata } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ handle: string }>;
}

/**
 * Pre-render popular products at build time. New products rendered on demand.
 * `dynamicParams` defaults to true so any unlisted handle still works.
 */
export async function generateStaticParams() {
  try {
    const products = await getProducts({ limit: 50 });
    return products.map((p) => ({ handle: p.handle }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle).catch(() => null);
  if (!product) return { title: "Product not found" };
  return buildProductMetadata(product);
}

export default async function ProductPage({ params }: PageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();

  const recommendations = await getProductRecommendations(product.id).catch(
    () => [],
  );

  return (
    <>
      <div className="container-shop pt-10 pb-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-brand-500">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-brand-900 transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/shop" className="hover:text-brand-900 transition-colors">
                Shop
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-brand-900 truncate max-w-[40ch]">{product.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <ProductImageGallery
            images={product.images}
            productTitle={product.title}
          />

          <div className="flex flex-col gap-8 lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col gap-3">
              {product.vendor && (
                <span className="text-xs uppercase tracking-widest text-brand-500">
                  {product.vendor}
                </span>
              )}
              <h1 className="heading-display text-3xl md:text-4xl">
                {product.title}
              </h1>
            </div>

            <ProductPurchasePanel product={product} />

            {product.descriptionHtml && (
              <div className="pt-6 border-t border-brand-200">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">
                  Details
                </h2>
                <div
                  className="prose prose-sm max-w-none text-brand-700 leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <section className="container-shop pb-20">
          <ProductGrid
            products={recommendations.slice(0, 4)}
            heading="You may also like"
          />
        </section>
      )}
    </>
  );
}
