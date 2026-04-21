import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAdminProducts } from "@/lib/admin-data";
import { AdminPage, AdminCard, AdminEmpty } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { Plus } from "lucide-react";
import { DeleteProductButton } from "./DeleteProductButton";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  let products: Awaited<ReturnType<typeof getAdminProducts>> = [];
  let error: string | null = null;
  try {
    products = await getAdminProducts(50);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load products.";
  }

  return (
    <AdminPage
      title="Products"
      description="The catalog feeding your storefront. Products sync via webhooks."
      actions={
        <Link href="/admin/products/new">
          <Button size="sm" leftIcon={<Plus size={16} />}>
            New product
          </Button>
        </Link>
      }
    >
      {error ? (
        <AdminEmpty title="Could not load products" description={error} />
      ) : products.length === 0 ? (
        <AdminEmpty
          title="No products yet"
          description="Create your first product to see it on the storefront."
          action={
            <Link href="/admin/products/new">
              <Button size="sm" leftIcon={<Plus size={16} />}>
                New product
              </Button>
            </Link>
          }
        />
      ) : (
        <AdminCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Product</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Inventory</th>
                  <th className="px-5 py-3 text-left font-medium">Vendor</th>
                  <th className="px-5 py-3 text-right font-medium">Price</th>
                  <th className="px-5 py-3 text-right font-medium w-12">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {products.map((p) => {
                  const minAmt = Number.parseFloat(p.priceRange.min.amount);
                  const maxAmt = Number.parseFloat(p.priceRange.max.amount);
                  const priceLabel =
                    minAmt === maxAmt
                      ? formatPrice(p.priceRange.min.amount, p.priceRange.min.currencyCode)
                      : `${formatPrice(
                          p.priceRange.min.amount,
                          p.priceRange.min.currencyCode,
                        )} – ${formatPrice(
                          p.priceRange.max.amount,
                          p.priceRange.max.currencyCode,
                        )}`;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                            {p.featuredImage && (
                              <Image
                                src={p.featuredImage.url}
                                alt={p.featuredImage.altText ?? p.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{p.title}</div>
                            <div className="text-xs text-zinc-500">
                              /{p.handle}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge kind="productStatus" value={p.status} />
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        {p.totalInventory ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        {p.vendor ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-right font-medium">
                        {priceLabel}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <DeleteProductButton
                          productId={p.id}
                          productTitle={p.title}
                          productHandle={p.handle}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}
    </AdminPage>
  );
}
