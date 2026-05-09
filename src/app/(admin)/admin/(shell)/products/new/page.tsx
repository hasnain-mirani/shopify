import type { Metadata } from "next";
import Link from "next/link";
import { AdminPage } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProductAction } from "./actions";

export const metadata: Metadata = {
  title: "New product",
  robots: { index: false, follow: false },
};

const FORM_SECTIONS = [
  { id: "admin-product-basic", label: "Basics" },
  { id: "admin-product-media", label: "Media" },
  { id: "admin-product-pricing", label: "Pricing" },
  { id: "admin-product-inventory", label: "Inventory" },
  { id: "admin-product-shipping", label: "Shipping" },
  { id: "admin-product-options", label: "Options" },
  { id: "admin-product-status", label: "Status" },
  { id: "admin-product-seo", label: "SEO" },
] as const;

export default function NewProductPage() {
  return (
    <AdminPage
      title="Create product"
      description="Structured steps: details, media, commercial fields, then visibility."
      actions={
        <Link
          href="/admin/products"
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          ← All products
        </Link>
      }
    >
      <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-500/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"
        />

        <div className="relative mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            Fields autosave on submit. Use the shortcuts below to jump around the form on long pages.
          </p>
          <nav
            className="no-scrollbar flex max-w-full gap-1.5 overflow-x-auto pb-1 sm:max-w-[50%] sm:justify-end"
            aria-label="Form sections"
          >
            {FORM_SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-600 transition hover:border-amber-400/50 hover:bg-amber-500/10 hover:text-amber-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-amber-200"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>

        <ProductForm
          onSubmit={createProductAction}
          submitLabel="Create product"
          isPending={false}
        />
      </section>
    </AdminPage>
  );
}
