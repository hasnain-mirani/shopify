import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

export const BANNER_SLIDER_TAG = "banner-slider-config";

export interface BannerSlide {
  id: number;
  headline: string;
  sub: string;
  cta: string;
  href: string;
  bg: string;
  badge: string;
}

export interface BannerSliderConfig {
  enabled: boolean;
  autoPlayMs: number;
  slides: BannerSlide[];
  updatedAt: string;
}

export const DEFAULT_BANNER_SLIDER_CONFIG: BannerSliderConfig = {
  enabled: true,
  autoPlayMs: 4500,
  slides: [
    {
      id: 1,
      headline: "CHAMPIONS. DELIVERED.",
      sub: "Premium mobile accessories, smartwatches & smart tech — hand-picked for you.",
      cta: "Shop Now",
      href: "/shop",
      bg: "linear-gradient(135deg, #1A0D00 0%, #2C1500 40%, #3D1F00 70%, #1A0D00 100%)",
      badge: "Up to 50% OFF",
    },
    {
      id: 2,
      headline: "NEW ARRIVALS.",
      sub: "Fresh drops every week — earbuds, chargers, power banks and more.",
      cta: "Explore Now",
      href: "/shop",
      bg: "linear-gradient(135deg, #0D1A2E 0%, #0A1428 40%, #152240 70%, #0D1A2E 100%)",
      badge: "Free Delivery",
    },
    {
      id: 3,
      headline: "BEST SELLERS.",
      sub: "Pakistan's favourite tech accessories — authentic, fast-delivered, affordable.",
      cta: "View All",
      href: "/shop",
      bg: "linear-gradient(135deg, #1A001A 0%, #2A0028 40%, #1A0030 70%, #1A001A 100%)",
      badge: "Top Rated",
    },
  ],
  updatedAt: new Date(0).toISOString(),
};

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE_PATH = path.join(DATA_DIR, "banner-slider.json");

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function str(raw: unknown, fallback: string, maxLen = 240): string {
  if (typeof raw !== "string") return fallback;
  const trimmed = raw.trim().slice(0, maxLen);
  return trimmed || fallback;
}

function sanitizeSlide(raw: unknown, fallback: BannerSlide, index: number): BannerSlide {
  const r = (raw ?? {}) as Partial<BannerSlide>;
  return {
    id: index + 1,
    headline: str(r.headline, fallback.headline, 120),
    sub: str(r.sub, fallback.sub, 280),
    cta: str(r.cta, fallback.cta, 30),
    href: str(r.href, fallback.href, 400),
    bg: str(r.bg, fallback.bg, 400),
    badge: str(r.badge, fallback.badge, 40),
  };
}

function sanitize(raw: unknown): BannerSliderConfig {
  const r = (raw ?? {}) as Partial<BannerSliderConfig>;
  const defaults = DEFAULT_BANNER_SLIDER_CONFIG;
  const inputSlides = Array.isArray(r.slides) ? r.slides : defaults.slides;
  const slides = inputSlides.slice(0, 5).map((s, i) =>
    sanitizeSlide(s, defaults.slides[i] ?? defaults.slides[0], i),
  );

  return {
    enabled: typeof r.enabled === "boolean" ? r.enabled : defaults.enabled,
    autoPlayMs: clamp(
      Number.isFinite(Number(r.autoPlayMs)) ? Number(r.autoPlayMs) : defaults.autoPlayMs,
      1500,
      12000,
    ),
    slides: slides.length > 0 ? slides : defaults.slides,
    updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : defaults.updatedAt,
  };
}

export async function getBannerSliderConfig(): Promise<BannerSliderConfig> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    return sanitize(JSON.parse(raw));
  } catch {
    return DEFAULT_BANNER_SLIDER_CONFIG;
  }
}

export async function saveBannerSliderConfig(
  next: Omit<BannerSliderConfig, "updatedAt">,
): Promise<BannerSliderConfig> {
  const config: BannerSliderConfig = {
    ...sanitize(next),
    updatedAt: new Date().toISOString(),
  };
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(config, null, 2), "utf8");
  return config;
}
