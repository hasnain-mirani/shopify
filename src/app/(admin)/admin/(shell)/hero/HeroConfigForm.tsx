"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { ExternalLink, LayoutGrid, Megaphone, Star } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  HERO_PILL_ICONS,
  type HeroConfig,
  type HeroPillIcon,
} from "@/lib/hero-config-types";
import {
  saveHeroConfigAction,
  type HeroConfigFormState,
} from "./actions";

interface Props {
  initial: HeroConfig;
}

const initialState: HeroConfigFormState = {};

const ICON_LABELS: Record<HeroPillIcon, string> = {
  star: "Star",
  leaf: "Leaf",
  sparkle: "Sparkle",
  heart: "Heart",
  package: "Package",
};

export function HeroConfigForm({ initial }: Props) {
  const [state, formAction, pending] = useActionState(
    saveHeroConfigAction,
    initialState,
  );

  useEffect(() => {
    if (state.ok) toast.success("Hero saved");
    else if (state.error) toast.error(state.error);
  }, [state.ok, state.error]);

  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-3">
      {/* ─────────── LEFT / main columns ─────────── */}
      <div className="space-y-6 xl:col-span-2">
        {/* Copy card */}
        <AdminCard className="p-6 space-y-5">
          <SectionLabel icon={<Megaphone size={12} />} title="Hero copy" />

          <Input
            name="eyebrow"
            label="Eyebrow"
            defaultValue={initial.eyebrow}
            placeholder="The Glow Drop · '26"
            required
            variant="outline"
            error={fe.eyebrow}
          />

          <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <Input
              name="headlinePrefix"
              label="Headline (start)"
              defaultValue={initial.headlinePrefix}
              placeholder="Aesthetics that"
              required
              variant="outline"
              error={fe.headlinePrefix}
            />
            <Input
              name="headlineEm"
              label="Italic word"
              defaultValue={initial.headlineEm}
              placeholder="glow"
              required
              variant="outline"
              error={fe.headlineEm}
              hint="Rendered italic w/ peach underline"
            />
            <Input
              name="headlineSuffix"
              label="Headline (end)"
              defaultValue={initial.headlineSuffix}
              placeholder=", not shout."
              variant="outline"
              error={fe.headlineSuffix}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="hero-subcopy"
              className="text-xs font-medium uppercase tracking-wider text-brand-600"
            >
              Subcopy
            </label>
            <textarea
              id="hero-subcopy"
              name="subcopy"
              rows={3}
              defaultValue={initial.subcopy}
              placeholder="Phone accessories and home pieces…"
              className="rounded-xl border border-brand-300 focus:border-brand-900 bg-white px-4 py-3 text-sm outline-none transition-colors dark:bg-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-100"
            />
            {fe.subcopy && <p className="text-xs text-red-600">{fe.subcopy}</p>}
          </div>
        </AdminCard>

        {/* CTAs card */}
        <AdminCard className="p-6 space-y-5">
          <SectionLabel title="Call-to-action buttons" />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="primaryCtaLabel"
              label="Primary CTA label"
              defaultValue={initial.primaryCtaLabel}
              placeholder="Shop the Glow Drop"
              required
              variant="outline"
              error={fe.primaryCtaLabel}
            />
            <Input
              name="primaryCtaHref"
              label="Primary CTA link"
              defaultValue={initial.primaryCtaHref}
              placeholder="/shop"
              required
              variant="outline"
              error={fe.primaryCtaHref}
            />
            <Input
              name="secondaryCtaLabel"
              label="Secondary CTA label"
              defaultValue={initial.secondaryCtaLabel}
              placeholder="Browse bundles"
              required
              variant="outline"
              error={fe.secondaryCtaLabel}
            />
            <Input
              name="secondaryCtaHref"
              label="Secondary CTA link"
              defaultValue={initial.secondaryCtaHref}
              placeholder="/collections"
              required
              variant="outline"
              error={fe.secondaryCtaHref}
            />
          </div>
        </AdminCard>

        {/* Trust pills card */}
        <AdminCard className="p-6 space-y-5">
          <SectionLabel icon={<Star size={12} />} title="Trust pills" />
          <p className="text-xs text-zinc-500 -mt-3">
            Leave a pill&rsquo;s label blank to remove it. Up to three show on
            the hero.
          </p>
          {[0, 1, 2].map((i) => {
            const pill = initial.pills[i];
            return (
              <div
                key={i}
                className="grid gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 sm:grid-cols-[140px_1fr_1fr]"
              >
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor={`pillIcon_${i}`}
                    className="text-xs font-medium uppercase tracking-wider text-brand-600"
                  >
                    Icon
                  </label>
                  <select
                    id={`pillIcon_${i}`}
                    name={`pillIcon_${i}`}
                    defaultValue={pill?.icon ?? "star"}
                    className="h-11 rounded-xl border border-brand-300 bg-white px-3 text-sm outline-none focus:border-brand-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100"
                  >
                    {HERO_PILL_ICONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ICON_LABELS[ic]}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  name={`pillLabel_${i}`}
                  label={`Pill ${i + 1} label`}
                  defaultValue={pill?.label ?? ""}
                  placeholder={i === 0 ? "4.9 / 5" : i === 1 ? "Bundle & save" : "Free shipping"}
                  variant="outline"
                />
                <Input
                  name={`pillSub_${i}`}
                  label="Sub-text"
                  defaultValue={pill?.sub ?? ""}
                  placeholder={i === 0 ? "12k reviews" : i === 1 ? "up to 20% off" : "worldwide over $60"}
                  variant="outline"
                />
              </div>
            );
          })}
          {fe.pills && <p className="text-xs text-red-600">{fe.pills}</p>}
        </AdminCard>

        {/* Bento card */}
        <AdminCard className="p-6 space-y-5">
          <SectionLabel icon={<LayoutGrid size={12} />} title="Bento tiles" />

          <div className="grid gap-4 sm:grid-cols-4">
            <Input
              name="bentoNumber"
              label="Big number"
              defaultValue={initial.bentoNumber}
              placeholder="01"
              required
              variant="outline"
              error={fe.bentoNumber}
              hint="Ghosted numeral on the deep-plum slab"
            />
            <Input
              name="bentoStatLabel"
              label="Stat label"
              defaultValue={initial.bentoStatLabel}
              placeholder="Delivered"
              required
              variant="outline"
              error={fe.bentoStatLabel}
            />
            <Input
              name="bentoStatHighlight"
              label="Stat highlight"
              defaultValue={initial.bentoStatHighlight}
              placeholder="48k+"
              required
              variant="outline"
              error={fe.bentoStatHighlight}
              hint="Rendered in peach"
            />
            <Input
              name="bentoStatSuffix"
              label="Stat suffix"
              defaultValue={initial.bentoStatSuffix}
              placeholder="orders"
              required
              variant="outline"
              error={fe.bentoStatSuffix}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                Phone tile (peach)
              </p>
              <Input
                name="bentoPhoneEyebrow"
                label="Eyebrow"
                defaultValue={initial.bentoPhoneEyebrow}
                placeholder="Phone"
                required
                variant="outline"
                error={fe.bentoPhoneEyebrow}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  name="bentoPhoneTitleLine1"
                  label="Title line 1"
                  defaultValue={initial.bentoPhoneTitleLine1}
                  placeholder="Cases &"
                  required
                  variant="outline"
                  error={fe.bentoPhoneTitleLine1}
                />
                <Input
                  name="bentoPhoneTitleLine2"
                  label="Title line 2"
                  defaultValue={initial.bentoPhoneTitleLine2}
                  placeholder="chargers"
                  variant="outline"
                />
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                Home tile (pink → plum)
              </p>
              <Input
                name="bentoHomeEyebrow"
                label="Eyebrow"
                defaultValue={initial.bentoHomeEyebrow}
                placeholder="Home"
                required
                variant="outline"
                error={fe.bentoHomeEyebrow}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  name="bentoHomeTitleLine1"
                  label="Title line 1"
                  defaultValue={initial.bentoHomeTitleLine1}
                  placeholder="Candles &"
                  required
                  variant="outline"
                  error={fe.bentoHomeTitleLine1}
                />
                <Input
                  name="bentoHomeTitleLine2"
                  label="Title line 2"
                  defaultValue={initial.bentoHomeTitleLine2}
                  placeholder="lighting"
                  variant="outline"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              name="lovedByHighlight"
              label="Loved-by highlight"
              defaultValue={initial.lovedByHighlight}
              placeholder="48k+"
              required
              variant="outline"
              error={fe.lovedByHighlight}
            />
            <Input
              name="lovedBySub"
              label="Loved-by sub-label"
              defaultValue={initial.lovedBySub}
              placeholder="Aesthetic shoppers"
              required
              variant="outline"
              error={fe.lovedBySub}
            />
            <Input
              name="badgeText"
              label="Circular badge text"
              defaultValue={initial.badgeText}
              placeholder="BUNDLE · SAVE 15% · GLOW DROP ·"
              required
              variant="outline"
              error={fe.badgeText}
              hint="Trailing · keeps the loop smooth"
            />
          </div>
        </AdminCard>
      </div>

      {/* ─────────── RIGHT / sticky save rail ─────────── */}
      <div className="space-y-6">
        <AdminCard className="p-6 space-y-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Quick preview
          </p>
          <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-brand-50 via-white to-brand-100 p-5 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800">
            <p className="font-ui text-[10px] uppercase tracking-[0.24em] text-brand-700">
              {initial.eyebrow}
            </p>
            <p className="mt-3 font-display text-2xl leading-tight text-brand-900 dark:text-zinc-50">
              {initial.headlinePrefix}{" "}
              <em className="italic text-brand-700">{initial.headlineEm}</em>
              {initial.headlineSuffix}
            </p>
            <p className="mt-3 line-clamp-3 text-xs text-brand-600 dark:text-zinc-400">
              {initial.subcopy}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-brand-900 px-3 py-1.5 text-[11px] font-semibold text-white">
                {initial.primaryCtaLabel}
              </span>
              <span className="rounded-full border border-brand-900 px-3 py-1.5 text-[11px] font-semibold text-brand-900 dark:border-zinc-100 dark:text-zinc-100">
                {initial.secondaryCtaLabel}
              </span>
            </div>
            <p className="mt-4 text-[10px] text-zinc-500">
              Preview uses the last-saved values — save to see live changes
              here and on the storefront.
            </p>
          </div>
        </AdminCard>

        <AdminCard className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Last saved</span>
            <span>
              {initial.updatedAt && initial.updatedAt !== new Date(0).toISOString()
                ? new Date(initial.updatedAt).toLocaleString()
                : "Never"}
            </span>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={pending}
            className="w-full"
          >
            {pending ? "Saving…" : "Save hero"}
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

function SectionLabel({
  icon,
  title,
}: {
  icon?: React.ReactNode;
  title: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
      {icon}
      {title}
    </div>
  );
}

export default HeroConfigForm;
