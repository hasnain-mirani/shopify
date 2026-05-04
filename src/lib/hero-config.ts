/**
 * Homepage hero config — persisted to a small JSON file on disk.
 *
 * This file is `server-only` because it touches the filesystem. Pure
 * types + defaults live in `hero-config-types.ts` so the admin client
 * form can import them safely.
 */
import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import {
  DEFAULT_HERO_CONFIG,
  HERO_PILL_ICONS,
  type HeroConfig,
  type HeroPill,
  type HeroPillIcon,
} from "./hero-config-types";

export {
  DEFAULT_HERO_CONFIG,
  HERO_CONFIG_TAG,
  HERO_PILL_ICONS,
} from "./hero-config-types";
export type { HeroConfig, HeroPill, HeroPillIcon } from "./hero-config-types";

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE_PATH = path.join(DATA_DIR, "hero-config.json");

function str(raw: unknown, fallback: string, maxLen = 240): string {
  if (typeof raw !== "string") return fallback;
  const trimmed = raw.slice(0, maxLen);
  return trimmed.length > 0 ? trimmed : fallback;
}

function pillIcon(raw: unknown): HeroPillIcon {
  if (typeof raw === "string" && (HERO_PILL_ICONS as string[]).includes(raw)) {
    return raw as HeroPillIcon;
  }
  return "star";
}

function sanitizePills(raw: unknown): HeroPill[] {
  if (!Array.isArray(raw)) return DEFAULT_HERO_CONFIG.pills;
  const cleaned: HeroPill[] = [];
  for (const p of raw.slice(0, 3)) {
    if (!p || typeof p !== "object") continue;
    const rec = p as Record<string, unknown>;
    cleaned.push({
      icon: pillIcon(rec.icon),
      label: str(rec.label, "Label", 40),
      sub: str(rec.sub, "", 60),
    });
  }
  return cleaned.length > 0 ? cleaned : DEFAULT_HERO_CONFIG.pills;
}

function sanitize(raw: unknown): HeroConfig {
  const r = (raw ?? {}) as Partial<HeroConfig>;
  const d = DEFAULT_HERO_CONFIG;
  return {
    eyebrow: str(r.eyebrow, d.eyebrow, 60),
    headlinePrefix: str(r.headlinePrefix, d.headlinePrefix, 120),
    headlineEm: str(r.headlineEm, d.headlineEm, 40),
    headlineSuffix: str(r.headlineSuffix, d.headlineSuffix, 120),
    subcopy: str(r.subcopy, d.subcopy, 400),
    primaryCtaLabel: str(r.primaryCtaLabel, d.primaryCtaLabel, 40),
    primaryCtaHref: str(r.primaryCtaHref, d.primaryCtaHref, 400),
    secondaryCtaLabel: str(r.secondaryCtaLabel, d.secondaryCtaLabel, 40),
    secondaryCtaHref: str(r.secondaryCtaHref, d.secondaryCtaHref, 400),
    pills: sanitizePills(r.pills),
    bentoNumber: str(r.bentoNumber, d.bentoNumber, 6),
    bentoStatLabel: str(r.bentoStatLabel, d.bentoStatLabel, 30),
    bentoStatHighlight: str(r.bentoStatHighlight, d.bentoStatHighlight, 20),
    bentoStatSuffix: str(r.bentoStatSuffix, d.bentoStatSuffix, 30),
    bentoPhoneEyebrow: str(r.bentoPhoneEyebrow, d.bentoPhoneEyebrow, 30),
    bentoPhoneTitleLine1: str(r.bentoPhoneTitleLine1, d.bentoPhoneTitleLine1, 30),
    bentoPhoneTitleLine2: str(r.bentoPhoneTitleLine2, d.bentoPhoneTitleLine2, 30),
    bentoHomeEyebrow: str(r.bentoHomeEyebrow, d.bentoHomeEyebrow, 30),
    bentoHomeTitleLine1: str(r.bentoHomeTitleLine1, d.bentoHomeTitleLine1, 30),
    bentoHomeTitleLine2: str(r.bentoHomeTitleLine2, d.bentoHomeTitleLine2, 30),
    lovedByHighlight: str(r.lovedByHighlight, d.lovedByHighlight, 20),
    lovedBySub: str(r.lovedBySub, d.lovedBySub, 40),
    badgeText: str(r.badgeText, d.badgeText, 80),
    updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : d.updatedAt,
  };
}

export async function getHeroConfig(): Promise<HeroConfig> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    return sanitize(JSON.parse(raw));
  } catch {
    return DEFAULT_HERO_CONFIG;
  }
}

export async function saveHeroConfig(
  next: Omit<HeroConfig, "updatedAt">,
): Promise<HeroConfig> {
  const config: HeroConfig = {
    ...sanitize(next),
    updatedAt: new Date().toISOString(),
  };
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(config, null, 2), "utf8");
  return config;
}
