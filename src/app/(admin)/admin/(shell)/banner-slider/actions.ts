"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  BANNER_SLIDER_TAG,
  DEFAULT_BANNER_SLIDER_CONFIG,
  saveBannerSliderConfig,
  type BannerSliderConfig,
  type BannerSlide,
} from "@/lib/banner-slider-config";

export interface BannerSliderFormState {
  ok?: boolean;
  error?: string;
  saved?: BannerSliderConfig;
}

export async function saveBannerSliderAction(
  _prev: BannerSliderFormState,
  formData: FormData,
): Promise<BannerSliderFormState> {
  const enabled = formData.get("enabled") === "on";
  const autoPlayMsRaw = Number(formData.get("autoPlayMs") ?? 4500);
  const autoPlayMs = Number.isFinite(autoPlayMsRaw) ? autoPlayMsRaw : 4500;

  const slides: BannerSlide[] = [0, 1, 2].map((i) => ({
    id: i + 1,
    headline: String(formData.get(`headline_${i}`) ?? "").trim(),
    sub: String(formData.get(`sub_${i}`) ?? "").trim(),
    cta: String(formData.get(`cta_${i}`) ?? "").trim(),
    href: String(formData.get(`href_${i}`) ?? "").trim(),
    bg: String(formData.get(`bg_${i}`) ?? "").trim(),
    badge: String(formData.get(`badge_${i}`) ?? "").trim(),
  }));

  const validSlides = slides.filter((s) => s.headline && s.cta && s.href && s.bg);
  if (enabled && validSlides.length === 0) {
    return { ok: false, error: "At least one complete slide is required when enabled." };
  }

  try {
    const saved = await saveBannerSliderConfig({
      enabled,
      autoPlayMs,
      slides: validSlides.length > 0 ? validSlides : DEFAULT_BANNER_SLIDER_CONFIG.slides,
    });

    revalidateTag(BANNER_SLIDER_TAG, {});
    revalidatePath("/");
    revalidatePath("/admin/banner-slider");
    return { ok: true, saved };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save slider config." };
  }
}
