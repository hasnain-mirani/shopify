/**
 * Promo banner config — persisted to a small JSON file on disk.
 *
 * This is intentionally lightweight: no database, no extra infra. It works
 * for local/dev and for any hosting target with a writable filesystem. On
 * ephemeral/read-only deployments (e.g. Vercel), writes will fail silently
 * and the defaults are served — treat this as a dev/demo-grade store.
 */
import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

export const PROMO_BANNER_TAG = "promo-banner";

export interface PromoBannerConfig {
  enabled: boolean;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref: string;
  /** Storefront product handles to feature (max 4 shown on the home banner). */
  productHandles: string[];
  updatedAt: string;
}

export const DEFAULT_PROMO_BANNER: PromoBannerConfig = {
  enabled: false,
  headline: "Bundle & glow",
  subheadline:
    "Pick a phone case and a home piece — save 15% on any set. Ends Sunday.",
  ctaLabel: "Shop the bundle",
  ctaHref: "/collections/bundle-deals",
  productHandles: [],
  updatedAt: new Date(0).toISOString(),
};

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE_PATH = path.join(DATA_DIR, "promo-banner.json");

function sanitize(raw: unknown): PromoBannerConfig {
  if (!raw || typeof raw !== "object") return DEFAULT_PROMO_BANNER;
  const r = raw as Partial<PromoBannerConfig>;
  return {
    enabled: typeof r.enabled === "boolean" ? r.enabled : false,
    headline:
      typeof r.headline === "string" && r.headline.trim()
        ? r.headline.trim()
        : DEFAULT_PROMO_BANNER.headline,
    subheadline:
      typeof r.subheadline === "string"
        ? r.subheadline
        : DEFAULT_PROMO_BANNER.subheadline,
    ctaLabel:
      typeof r.ctaLabel === "string" && r.ctaLabel.trim()
        ? r.ctaLabel.trim()
        : DEFAULT_PROMO_BANNER.ctaLabel,
    ctaHref:
      typeof r.ctaHref === "string" && r.ctaHref.trim()
        ? r.ctaHref.trim()
        : DEFAULT_PROMO_BANNER.ctaHref,
    productHandles: Array.isArray(r.productHandles)
      ? (r.productHandles as unknown[])
          .filter((h): h is string => typeof h === "string" && h.length > 0)
          .slice(0, 12)
      : [],
    updatedAt:
      typeof r.updatedAt === "string"
        ? r.updatedAt
        : DEFAULT_PROMO_BANNER.updatedAt,
  };
}

export async function getPromoBanner(): Promise<PromoBannerConfig> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    return sanitize(JSON.parse(raw));
  } catch {
    return DEFAULT_PROMO_BANNER;
  }
}

export async function savePromoBanner(
  next: Omit<PromoBannerConfig, "updatedAt">,
): Promise<PromoBannerConfig> {
  const config: PromoBannerConfig = {
    ...sanitize(next),
    updatedAt: new Date().toISOString(),
  };
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(config, null, 2), "utf8");
  return config;
}
