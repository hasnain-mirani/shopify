import type { Metadata } from "next";
import Link from "next/link";
import { AdminPage } from "@/components/admin/AdminShell";
import { NewProductForm } from "./NewProductForm";

export const metadata: Metadata = {
  title: "New product",
  robots: { index: false, follow: false },
};

export default function NewProductPage() {
  return (
    <AdminPage
      title="New product"
      description="Create a product in Shopify. Title, price, and an optional image are enough to start."
      actions={
        <Link
          href="/admin/products"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Back to products
        </Link>
      }
    >
      <NewProductForm />
    </AdminPage>
  );
}
