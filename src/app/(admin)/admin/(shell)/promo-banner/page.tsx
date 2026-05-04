import type { Metadata } from "next";
import { AdminPage, AdminEmpty } from "@/components/admin/AdminShell";
import { getAdminProducts } from "@/lib/admin-data";
import { getPromoBanner } from "@/lib/promo-banner";
import { PromoBannerForm } from "./PromoBannerForm";

export const metadata: Metadata = {
  title: "Promo banner",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPromoBannerPage() {
  const [banner, productsResult] = await Promise.all([
    getPromoBanner(),
    getAdminProducts(100)
      .then((list) => ({ ok: true as const, list }))
      .catch((e: unknown) => ({
        ok: false as const,
        error: e instanceof Error ? e.message : "Failed to load products.",
      })),
  ]);

  return (
    <AdminPage
      title="Promo banner"
      description="Configure the promotional banner that appears on your storefront and pick which products it features."
    >
      {!productsResult.ok ? (
        <AdminEmpty
          title="Could not load products"
          description={productsResult.error}
        />
      ) : (
        <PromoBannerForm
          initial={banner}
          products={productsResult.list.map((p) => ({
            id: p.id,
            title: p.title,
            handle: p.handle,
            status: p.status,
            vendor: p.vendor,
            image: p.featuredImage
              ? {
                  url: p.featuredImage.url,
                  alt: p.featuredImage.altText ?? p.title,
                }
              : null,
            price: {
              amount: p.priceRange.min.amount,
              currency: p.priceRange.min.currencyCode,
            },
          }))}
        />
      )}
    </AdminPage>
  );
}
