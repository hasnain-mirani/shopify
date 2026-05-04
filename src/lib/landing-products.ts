/**
 * Landing Page Products config — persisted to .data/landing-products.json
 *
 * Lets admins pick up to 8 Shopify product handles to feature in the
 * "Featured Products" grid on the home page.
 *
 * Uses the same lightweight file-based pattern as the promo-banner lib.
 */
import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

export const LANDING_PRODUCTS_TAG = "landing-products";

export interface LandingProductsConfig {
  /** Up to 8 product handles to show in the featured grid on the homepage. */
  productHandles: string[];
  /** Section heading override (optional, defaults to "Featured Products") */
  sectionHeading: string;
  /** Section sub-copy override */
  sectionSubcopy: string;
  updatedAt: string;
}

export const DEFAULT_LANDING_PRODUCTS: LandingProductsConfig = {
  productHandles: [],
  sectionHeading: "Featured Products",
  sectionSubcopy:
    "Hand-picked tech accessories, smartwatches and power banks — restocked and updated every week.",
  updatedAt: new Date(0).toISOString(),
};

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE_PATH = path.join(DATA_DIR, "landing-products.json");

function sanitize(raw: unknown): LandingProductsConfig {
  if (!raw || typeof raw !== "object") return DEFAULT_LANDING_PRODUCTS;
  const r = raw as Partial<LandingProductsConfig>;
  return {
    productHandles: Array.isArray(r.productHandles)
      ? (r.productHandles as unknown[])
          .filter((h): h is string => typeof h === "string" && h.length > 0)
          .slice(0, 8)
      : [],
    sectionHeading:
      typeof r.sectionHeading === "string" && r.sectionHeading.trim()
        ? r.sectionHeading.trim()
        : DEFAULT_LANDING_PRODUCTS.sectionHeading,
    sectionSubcopy:
      typeof r.sectionSubcopy === "string"
        ? r.sectionSubcopy
        : DEFAULT_LANDING_PRODUCTS.sectionSubcopy,
    updatedAt:
      typeof r.updatedAt === "string"
        ? r.updatedAt
        : DEFAULT_LANDING_PRODUCTS.updatedAt,
  };
}

export async function getLandingProducts(): Promise<LandingProductsConfig> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    return sanitize(JSON.parse(raw));
  } catch {
    return DEFAULT_LANDING_PRODUCTS;
  }
}

export async function saveLandingProducts(
  next: Omit<LandingProductsConfig, "updatedAt">,
): Promise<LandingProductsConfig> {
  const config: LandingProductsConfig = {
    ...sanitize(next),
    updatedAt: new Date().toISOString(),
  };
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(config, null, 2), "utf8");
  return config;
}
