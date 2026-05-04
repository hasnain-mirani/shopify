import type { Metadata } from "next";
import { AdminPage, AdminEmpty } from "@/components/admin/AdminShell";
import { getAdminProducts } from "@/lib/admin-data";
import { getLandingProducts } from "@/lib/landing-products";
import { LandingProductsForm } from "./LandingProductsForm";

export const metadata: Metadata = {
  title: "Landing Page Products",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLandingProductsPage() {
  const [config, productsResult] = await Promise.all([
    getLandingProducts(),
    getAdminProducts(100)
      .then((list) => ({ ok: true as const, list }))
      .catch((e: unknown) => ({
        ok: false as const,
        error: e instanceof Error ? e.message : "Failed to load products.",
      })),
  ]);

  return (
    <AdminPage
      title="Landing Page Products"
      description="Choose which products appear in the 'Featured Products' grid on your store's home page. Select up to 8 products."
    >
      {!productsResult.ok ? (
        <AdminEmpty
          title="Could not load products"
          description={productsResult.error}
        />
      ) : (
        <LandingProductsForm
          initial={config}
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
