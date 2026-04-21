"use client";

import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { createProductAction, type ProductFormState } from "./actions";
import { AdminCard } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: ProductFormState = {};

export function NewProductForm() {
  const [state, formAction, pending] = useActionState(
    createProductAction,
    initialState,
  );

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-3">
      <AdminCard className="p-6 space-y-5 lg:col-span-2">
        <Input
          name="title"
          label="Title"
          placeholder="Organic cotton tee"
          required
          variant="outline"
          error={fe.title}
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="description"
            className="text-xs font-medium uppercase tracking-wider text-brand-600"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            className="rounded-xl border border-brand-300 focus:border-brand-900 bg-white px-4 py-3 text-sm outline-none transition-colors dark:bg-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-100"
            placeholder="Tell the story of this product — materials, fit, why it exists."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="price"
            label="Price"
            placeholder="29.00"
            inputMode="decimal"
            required
            variant="outline"
            error={fe.price}
          />
          <Input
            name="sku"
            label="SKU"
            placeholder="TEE-OC-001"
            variant="outline"
            error={fe.sku}
          />
        </div>

        <Input
          name="imageUrl"
          label="Image URL"
          placeholder="https://cdn.shopify.com/…"
          hint="Paste a publicly reachable image URL. Shopify will copy it into its CDN."
          variant="outline"
          error={fe.imageUrl}
        />
      </AdminCard>

      <div className="space-y-6">
        <AdminCard className="p-6 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-brand-600 mb-2 font-medium">
              Status
            </p>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 rounded-lg border border-brand-300 px-3 py-2 text-sm cursor-pointer has-[:checked]:border-brand-900 has-[:checked]:bg-brand-900 has-[:checked]:text-white dark:border-zinc-700 dark:has-[:checked]:bg-zinc-100 dark:has-[:checked]:text-zinc-900">
                <input
                  type="radio"
                  name="status"
                  value="DRAFT"
                  defaultChecked
                  className="sr-only"
                />
                Draft
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-brand-300 px-3 py-2 text-sm cursor-pointer has-[:checked]:border-brand-900 has-[:checked]:bg-brand-900 has-[:checked]:text-white dark:border-zinc-700 dark:has-[:checked]:bg-zinc-100 dark:has-[:checked]:text-zinc-900">
                <input
                  type="radio"
                  name="status"
                  value="ACTIVE"
                  className="sr-only"
                />
                Active
              </label>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Draft products are hidden from the storefront until you activate them.
            </p>
          </div>

          <Input
            name="vendor"
            label="Vendor"
            placeholder="Your brand"
            variant="outline"
          />
        </AdminCard>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={pending}
            className="w-full"
          >
            {pending ? "Creating…" : "Create product"}
          </Button>
        </div>
      </div>
    </form>
  );
}
