/**
 * Pure types + constants for the homepage hero config.
 *
 * This file is intentionally NOT `server-only` so it can be imported from
 * both server components (page + action) and client components (the admin
 * form). The filesystem-backed store lives in `hero-config.ts`.
 */

export type HeroPillIcon = "star" | "leaf" | "sparkle" | "heart" | "package";

export interface HeroPill {
  icon: HeroPillIcon;
  label: string;
  sub: string;
}

export interface HeroConfig {
  /* Left column */
  eyebrow: string;
  headlinePrefix: string;
  headlineEm: string;
  headlineSuffix: string;
  subcopy: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  /** Up to 3 pills are rendered. */
  pills: HeroPill[];

  /* Right column bento */
  bentoNumber: string;
  bentoStatLabel: string;
  bentoStatHighlight: string;
  bentoStatSuffix: string;

  bentoPhoneEyebrow: string;
  bentoPhoneTitleLine1: string;
  bentoPhoneTitleLine2: string;

  bentoHomeEyebrow: string;
  bentoHomeTitleLine1: string;
  bentoHomeTitleLine2: string;

  /** "Loved by" floating glass pill — highlight + sublabel. */
  lovedByHighlight: string;
  lovedBySub: string;

  /** Circular rotating badge text. */
  badgeText: string;

  updatedAt: string;
}

export const HERO_PILL_ICONS: HeroPillIcon[] = [
  "star",
  "leaf",
  "sparkle",
  "heart",
  "package",
];

/**
 * Defaults mirror the currently-shipping hero content so a brand-new
 * install looks identical until the admin changes something.
 */
export const DEFAULT_HERO_CONFIG: HeroConfig = {
  eyebrow: "The Glow Drop · '26",
  headlinePrefix: "Aesthetics that",
  headlineEm: "glow",
  headlineSuffix: ", not shout.",
  subcopy:
    "Phone accessories and home pieces curated for the aesthetically curious. Cases, candles, cables, and cosy corners — all in one cart.",
  primaryCtaLabel: "Shop the Glow Drop",
  primaryCtaHref: "/shop",
  secondaryCtaLabel: "Browse bundles",
  secondaryCtaHref: "/collections",
  pills: [
    { icon: "star", label: "4.9 / 5", sub: "12k reviews" },
    { icon: "leaf", label: "Bundle & save", sub: "up to 20% off" },
    { icon: "sparkle", label: "Free shipping", sub: "worldwide over $60" },
  ],

  bentoNumber: "01",
  bentoStatLabel: "Delivered",
  bentoStatHighlight: "48k+",
  bentoStatSuffix: "orders",

  bentoPhoneEyebrow: "Phone",
  bentoPhoneTitleLine1: "Cases &",
  bentoPhoneTitleLine2: "chargers",

  bentoHomeEyebrow: "Home",
  bentoHomeTitleLine1: "Candles &",
  bentoHomeTitleLine2: "lighting",

  lovedByHighlight: "48k+",
  lovedBySub: "Aesthetic shoppers",

  badgeText: "BUNDLE · SAVE 15% · GLOW DROP ·",

  updatedAt: new Date(0).toISOString(),
};

export const HERO_CONFIG_TAG = "hero-config";
