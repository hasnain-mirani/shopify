"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  HERO_CONFIG_TAG,
  HERO_PILL_ICONS,
  saveHeroConfig,
  type HeroConfig,
  type HeroPill,
  type HeroPillIcon,
} from "@/lib/hero-config";

export interface HeroConfigFormState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  saved?: HeroConfig;
}

function readHref(
  formData: FormData,
  key: string,
  errors: Record<string, string>,
  required = true,
): string {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) {
    if (required) errors[key] = "Required.";
    return "";
  }
  if (!/^(https?:\/\/|\/)/.test(raw)) {
    errors[key] = "Link must start with http(s):// or /.";
  }
  return raw;
}

function readPills(formData: FormData): HeroPill[] {
  const out: HeroPill[] = [];
  for (let i = 0; i < 3; i += 1) {
    const label = String(formData.get(`pillLabel_${i}`) ?? "").trim();
    const sub = String(formData.get(`pillSub_${i}`) ?? "").trim();
    const iconRaw = String(formData.get(`pillIcon_${i}`) ?? "star").trim();
    if (!label) continue;
    const icon: HeroPillIcon = (HERO_PILL_ICONS as string[]).includes(iconRaw)
      ? (iconRaw as HeroPillIcon)
      : "star";
    out.push({ icon, label, sub });
  }
  return out;
}

export async function saveHeroConfigAction(
  _prev: HeroConfigFormState,
  formData: FormData,
): Promise<HeroConfigFormState> {
  const errors: Record<string, string> = {};

  const req = (key: string, label = key) => {
    const v = String(formData.get(key) ?? "").trim();
    if (!v) errors[key] = `${label} is required.`;
    return v;
  };

  const eyebrow = req("eyebrow", "Eyebrow");
  const headlinePrefix = req("headlinePrefix", "Headline (start)");
  const headlineEm = req("headlineEm", "Headline (italic word)");
  const headlineSuffix = String(formData.get("headlineSuffix") ?? "").trim();
  const subcopy = req("subcopy", "Subcopy");
  const primaryCtaLabel = req("primaryCtaLabel", "Primary CTA label");
  const primaryCtaHref = readHref(formData, "primaryCtaHref", errors);
  const secondaryCtaLabel = req("secondaryCtaLabel", "Secondary CTA label");
  const secondaryCtaHref = readHref(formData, "secondaryCtaHref", errors);
  const pills = readPills(formData);
  if (pills.length === 0)
    errors.pills = "Add at least one trust pill (label required).";

  const bentoNumber = req("bentoNumber", "Big number");
  const bentoStatLabel = req("bentoStatLabel", "Stat label");
  const bentoStatHighlight = req("bentoStatHighlight", "Stat highlight");
  const bentoStatSuffix = req("bentoStatSuffix", "Stat suffix");

  const bentoPhoneEyebrow = req("bentoPhoneEyebrow", "Phone tile eyebrow");
  const bentoPhoneTitleLine1 = req(
    "bentoPhoneTitleLine1",
    "Phone tile title (line 1)",
  );
  const bentoPhoneTitleLine2 = String(
    formData.get("bentoPhoneTitleLine2") ?? "",
  ).trim();

  const bentoHomeEyebrow = req("bentoHomeEyebrow", "Home tile eyebrow");
  const bentoHomeTitleLine1 = req(
    "bentoHomeTitleLine1",
    "Home tile title (line 1)",
  );
  const bentoHomeTitleLine2 = String(
    formData.get("bentoHomeTitleLine2") ?? "",
  ).trim();

  const lovedByHighlight = req("lovedByHighlight", "Loved-by highlight");
  const lovedBySub = req("lovedBySub", "Loved-by sub-label");
  const badgeText = req("badgeText", "Badge text");

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors: errors,
    };
  }

  try {
    const saved = await saveHeroConfig({
      eyebrow,
      headlinePrefix,
      headlineEm,
      headlineSuffix,
      subcopy,
      primaryCtaLabel,
      primaryCtaHref,
      secondaryCtaLabel,
      secondaryCtaHref,
      pills,
      bentoNumber,
      bentoStatLabel,
      bentoStatHighlight,
      bentoStatSuffix,
      bentoPhoneEyebrow,
      bentoPhoneTitleLine1,
      bentoPhoneTitleLine2,
      bentoHomeEyebrow,
      bentoHomeTitleLine1,
      bentoHomeTitleLine2,
      lovedByHighlight,
      lovedBySub,
      badgeText,
    });

    revalidateTag(HERO_CONFIG_TAG);
    revalidatePath("/");
    revalidatePath("/admin/hero");

    return { ok: true, saved };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? `Failed to save: ${e.message}` : "Failed to save.",
    };
  }
}
