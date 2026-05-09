"use client";

import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ExternalLink, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { AdminCard } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProductPickerField } from "@/components/admin/ProductPickerField";
import { saveBannerSliderAction, type BannerSliderFormState } from "./actions";
import type { BannerSliderConfig } from "@/lib/banner-slider-config";

const initialState: BannerSliderFormState = {};

export function BannerSliderForm({ initial }: { initial: BannerSliderConfig }) {
  const [state, formAction, pending] = useActionState(saveBannerSliderAction, initialState);

  // Track each slide's href so the ProductPickerField can update it and
  // the hidden input stays in sync with the form submission.
  const [hrefs, setHrefs] = useState<[string, string, string]>([
    initial.slides[0]?.href ?? "/shop",
    initial.slides[1]?.href ?? "/shop",
    initial.slides[2]?.href ?? "/shop",
  ]);

  const setHref = (i: 0 | 1 | 2, val: string) =>
    setHrefs((prev) => {
      const next = [...prev] as [string, string, string];
      next[i] = val;
      return next;
    });

  useEffect(() => {
    if (state.ok) toast.success("Main banner slider saved");
    else if (state.error) toast.error(state.error);
  }, [state.ok, state.error]);

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <AdminCard className="p-6 space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <SlidersHorizontal size={12} />
            Main hero slider settings
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="inline-flex cursor-pointer items-center gap-3 select-none">
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={initial.enabled}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="relative h-6 w-11 rounded-full bg-zinc-300 transition-colors peer-checked:bg-brand-900 dark:bg-zinc-700 dark:peer-checked:bg-zinc-100"
              >
                <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </span>
              <span className="text-sm font-medium">Enable slider on homepage</span>
            </label>

            <Input
              name="autoPlayMs"
              type="number"
              min={1500}
              max={12000}
              step={100}
              defaultValue={initial.autoPlayMs}
              label="Autoplay interval (ms)"
              variant="outline"
              hint="Recommended: 4500"
            />
          </div>
        </AdminCard>

        {([0, 1, 2] as const).map((i) => {
          const s = initial.slides[i];
          return (
            <AdminCard key={i} className="p-6 space-y-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                Slide {i + 1}
              </p>
              <Input name={`headline_${i}`} label="Headline" defaultValue={s?.headline ?? ""} required variant="outline" />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-brand-600">Sub text</label>
                <textarea
                  name={`sub_${i}`}
                  rows={2}
                  defaultValue={s?.sub ?? ""}
                  className="rounded-xl border border-brand-300 focus:border-brand-900 bg-white px-4 py-3 text-sm outline-none transition-colors dark:bg-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-100"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name={`cta_${i}`} label="CTA label" defaultValue={s?.cta ?? ""} required variant="outline" />
                <Input name={`badge_${i}`} label="Badge text" defaultValue={s?.badge ?? ""} variant="outline" />
              </div>

              {/* ── Product link section ── */}
              <div className="space-y-3 rounded-xl border border-dashed border-brand-300/60 dark:border-zinc-700 p-4 bg-zinc-50/50 dark:bg-zinc-900/40">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  CTA Destination
                </p>

                {/* Product picker */}
                <ProductPickerField
                  slideIndex={i}
                  value={hrefs[i]}
                  onChange={(val) => setHref(i, val)}
                />

                {/* Hidden input keeps the href in form data */}
                <input type="hidden" name={`href_${i}`} value={hrefs[i]} />

                {/* Manual override input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Or type a custom URL
                  </label>
                  <input
                    type="text"
                    placeholder="/shop or https://..."
                    value={hrefs[i]}
                    onChange={(e) => setHref(i, e.target.value)}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-900 dark:focus:border-zinc-400 placeholder-zinc-400"
                  />
                </div>
              </div>

              <Input
                name={`bg_${i}`}
                label="Background CSS"
                defaultValue={s?.bg ?? ""}
                required
                variant="outline"
              />
            </AdminCard>
          );
        })}
      </div>

      <div className="space-y-6">
        <AdminCard className="p-6 space-y-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Save</p>
          <Button type="submit" variant="primary" size="md" isLoading={pending} className="w-full">
            {pending ? "Saving…" : "Save slider"}
          </Button>
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            View storefront
            <ExternalLink size={12} />
          </Link>
        </AdminCard>
      </div>
    </form>
  );
}

export default BannerSliderForm;
