"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  DEFAULT_PROMO_BANNER,
  PROMO_BANNER_TAG,
  savePromoBanner,
  type PromoBannerConfig,
} from "@/lib/promo-banner";

export interface PromoBannerFormState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  /** Echoed back so the form can display the latest saved value. */
  saved?: PromoBannerConfig;
}

function collectHandles(formData: FormData): string[] {
  const raw = formData.getAll("productHandles");
  const seen = new Set<string>();
  for (const v of raw) {
    if (typeof v === "string" && v.trim()) seen.add(v.trim());
  }
  return Array.from(seen).slice(0, 12);
}

export async function savePromoBannerAction(
  _prev: PromoBannerFormState,
  formData: FormData,
): Promise<PromoBannerFormState> {
  const errors: Record<string, string> = {};

  const enabled = formData.get("enabled") === "on";
  const headline = String(formData.get("headline") ?? "").trim();
  const subheadline = String(formData.get("subheadline") ?? "").trim();
  const ctaLabel = String(formData.get("ctaLabel") ?? "").trim();
  const ctaHref = String(formData.get("ctaHref") ?? "").trim();
  const productHandles = collectHandles(formData);

  if (!headline) errors.headline = "Headline is required.";
  if (headline.length > 120)
    errors.headline = "Keep the headline under 120 characters.";
  if (subheadline.length > 240)
    errors.subheadline = "Keep the subheadline under 240 characters.";
  if (!ctaLabel) errors.ctaLabel = "CTA label is required.";
  if (!ctaHref) {
    errors.ctaHref = "CTA link is required.";
  } else if (!/^(https?:\/\/|\/)/.test(ctaHref)) {
    errors.ctaHref = "Link must start with http(s):// or /.";
  }
  if (enabled && productHandles.length === 0) {
    errors.productHandles =
      "Pick at least one product to show, or disable the banner.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: errors,
    };
  }

  try {
    const saved = await savePromoBanner({
      enabled,
      headline: headline || DEFAULT_PROMO_BANNER.headline,
      subheadline,
      ctaLabel: ctaLabel || DEFAULT_PROMO_BANNER.ctaLabel,
      ctaHref: ctaHref || DEFAULT_PROMO_BANNER.ctaHref,
      productHandles,
    });

    revalidateTag(PROMO_BANNER_TAG);
    revalidatePath("/");
    revalidatePath("/admin/promo-banner");

    return { ok: true, saved };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? `Failed to save: ${e.message}`
          : "Failed to save the banner.",
    };
  }
}
