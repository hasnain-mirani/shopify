"use client";

import dynamic from "next/dynamic";
import type { ProductFormProps } from "@/components/admin/ProductForm";

const ProductFormLazy = dynamic(() => import("@/components/admin/ProductForm").then((m) => m.ProductForm), {
  ssr: false,
  loading: () => (
    <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading product form…</p>
  ),
});

/** Server pages cannot use `dynamic(..., { ssr: false })`; this client wrapper is allowed. */
export function ProductFormNoSsr(props: ProductFormProps) {
  return <ProductFormLazy {...props} />;
}
