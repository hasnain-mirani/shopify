import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminPage } from "@/components/admin/AdminShell";
import { updateProductAction } from "./actions";
import { api } from "@/lib/api-client";
import type { ProductOption, ProductVariant } from "../../new/actions";

export const metadata: Metadata = {
  title: "Edit Product",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product;
  try {
    product = await api.products.getById(id);
  } catch (e) {
    notFound();
  }

  if (!product) {
    notFound();
  }

  // Transform product data to form format
  const initialData = {
    title: product.title,
    description: product.description,
    descriptionHtml: product.descriptionHtml || "",
    vendor: product.vendor || "",
    productType: product.productType || "",
    status: (product.status as "ACTIVE" | "DRAFT" | "ARCHIVED") || "DRAFT",
    handle: product.handle,
    tags: product.tags?.join(", ") || "",
    specifications: (product as any).specifications || "",
    marketPrice: String((product as any).marketPrice ?? product.variants?.[0]?.compareAtPrice?.amount ?? ""),
    ourPrice: String((product as any).ourPrice ?? product.priceRange?.minVariantPrice?.amount ?? "0"),
    price: product.priceRange?.minVariantPrice?.amount || "0",
    compareAtPrice: product.variants?.[0]?.compareAtPrice?.amount || "",
    costPerItem: "",
    sku: product.variants?.[0]?.sku || "",
    barcode: "", // Barcode not available in custom backend variant
    trackQuantity: true,
    inventoryQuantity: product.variants?.[0]?.quantityAvailable?.toString() || "0",
    continueSellingWhenOutOfStock: true,
    requiresShipping: true,
    weight: "",
    weightUnit: "kg" as const,
    imageUrls: product.images?.map((img) => img.url) || [],
    featuredImageIndex: 0,
    options: (product.options || []) as ProductOption[],
    variants: (product.variants || []).map((v: any) => ({
      id: v.id,
      title: v.title,
      price: v.price?.amount || "0",
      compareAtPrice: v.compareAtPrice?.amount || "",
      sku: v.sku || "",
      barcode: v.barcode || "",
      inventoryQuantity: v.quantityAvailable?.toString() || "0",
      weight: v.weight?.toString() || "",
      weightUnit: v.weightUnit || "kg",
      options: v.selectedOptions?.reduce(
        (acc: Record<string, string>, opt: any) => {
          acc[opt.name] = opt.value;
          return acc;
        },
        {}
      ) || {},
      availableForSale: v.availableForSale ?? true,
    })) as ProductVariant[],
    seoTitle: "",
    seoDescription: "",
  };

  return (
    <AdminPage
      title="Edit Product"
      description="Refine content, prices, category, specs and storefront readiness."
      actions={
        <Link
          href="/admin/products"
          className="text-sm text-amber-300/80 hover:text-amber-200"
        >
          ← Back to products
        </Link>
      }
    >
      <section className="relative overflow-hidden rounded-2xl border border-amber-300/20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-4 md:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.3), transparent 70%)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(37,99,235,0.24), transparent 70%)" }}
        />

        <div className="relative mb-5 flex flex-wrap items-center gap-2">
          {["Live editing", "Price controls", "Collection mapping"].map((pill) => (
            <span
              key={pill}
              className="inline-flex rounded-full border border-amber-300/25 bg-slate-950/50 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.2em] text-amber-200"
            >
              {pill}
            </span>
          ))}
        </div>

        <ProductForm
          initialData={initialData}
          onSubmit={updateProductAction}
          submitLabel="Update Product"
          isPending={false}
          hiddenFields={{ productId: id }}
        />
      </section>
    </AdminPage>
  );
}