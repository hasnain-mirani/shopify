"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  DEFAULT_LANDING_PRODUCTS,
  LANDING_PRODUCTS_TAG,
  saveLandingProducts,
  type LandingProductsConfig,
} from "@/lib/landing-products";

export interface LandingProductsFormState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  saved?: LandingProductsConfig;
}

function collectHandles(formData: FormData): string[] {
  const raw = formData.getAll("productHandles");
  const seen = new Set<string>();
  for (const v of raw) {
    if (typeof v === "string" && v.trim()) seen.add(v.trim());
  }
  return Array.from(seen).slice(0, 8);
}

export async function saveLandingProductsAction(
  _prev: LandingProductsFormState,
  formData: FormData,
): Promise<LandingProductsFormState> {
  const errors: Record<string, string> = {};

  const sectionHeading = String(formData.get("sectionHeading") ?? "").trim();
  const sectionSubcopy = String(formData.get("sectionSubcopy") ?? "").trim();
  const productHandles = collectHandles(formData);

  if (sectionHeading.length > 80)
    errors.sectionHeading = "Keep the heading under 80 characters.";
  if (sectionSubcopy.length > 240)
    errors.sectionSubcopy = "Keep the sub-copy under 240 characters.";

  if (Object.keys(errors).length > 0) {
    return { ok: false, error: "Please fix the errors below.", fieldErrors: errors };
  }

  try {
    const saved = await saveLandingProducts({
      productHandles,
      sectionHeading: sectionHeading || DEFAULT_LANDING_PRODUCTS.sectionHeading,
      sectionSubcopy: sectionSubcopy || DEFAULT_LANDING_PRODUCTS.sectionSubcopy,
    });

    revalidateTag(LANDING_PRODUCTS_TAG);
    revalidatePath("/");
    revalidatePath("/admin/landing-products");

    return { ok: true, saved };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? `Failed to save: ${e.message}`
          : "Failed to save landing products.",
    };
  }
}
