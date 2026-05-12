/** Slugs used by admin ProductForm + Shopify productType; keep in sync with ProductForm UI. */
export const ADMIN_CATEGORY_OPTIONS = [
  { value: "mobiles", label: "Mobiles" },
  { value: "wireless-earbuds", label: "Wireless Earbuds" },
  { value: "smart-watches", label: "Smart Watches" },
  { value: "power-banks", label: "Power Banks" },
  { value: "wall-chargers", label: "Wall Chargers" },
  { value: "bluetooth-speakers", label: "Bluetooth Speakers" },
  { value: "tablets", label: "Tablets" },
  { value: "laptops", label: "Laptops" },
  { value: "trimmers-shavers", label: "Trimmers & Shavers" },
  { value: "hair-dryers", label: "Hair Dryers" },
  { value: "hair-straighteners", label: "Hair Straighteners" },
  { value: "home-appliances", label: "TV & Home Appliances" },
] as const;

export type AdminCategorySlug = (typeof ADMIN_CATEGORY_OPTIONS)[number]["value"];

const SLUGS = new Set<string>(ADMIN_CATEGORY_OPTIONS.map((o) => o.value));

export function normalizeAdminCategorySlug(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "-");
}

/** Map model output + product title to a valid admin category slug. */
export function coerceAdminProductCategory(rawType: string, title: string): AdminCategorySlug {
  const n = normalizeAdminCategorySlug(String(rawType || ""));
  if (SLUGS.has(n)) return n as AdminCategorySlug;

  const aliases: Record<string, AdminCategorySlug> = {
    mobile: "mobiles",
    mobiles: "mobiles",
    smartphone: "mobiles",
    phone: "mobiles",
    "mobile-phone": "mobiles",
    earbuds: "wireless-earbuds",
    "true-wireless": "wireless-earbuds",
    tws: "wireless-earbuds",
    "wireless-earbuds": "wireless-earbuds",
    "smart-watch": "smart-watches",
    smartwatch: "smart-watches",
    watches: "smart-watches",
    "power-bank": "power-banks",
    charger: "wall-chargers",
    "wall-charger": "wall-chargers",
    "bluetooth-speaker": "bluetooth-speakers",
    speaker: "bluetooth-speakers",
    tablet: "tablets",
    laptop: "laptops",
    notebook: "laptops",
    trimmer: "trimmers-shavers",
    shaver: "trimmers-shavers",
    "hair-dryer": "hair-dryers",
    "hair-straightener": "hair-straighteners",
    appliance: "home-appliances",
    tv: "home-appliances",
  };
  if (aliases[n]) return aliases[n];

  const t = `${title} ${rawType}`.toLowerCase();
  if (/\b(airpods|buds|earbuds|tws|encore|freebuds)\b/.test(t)) return "wireless-earbuds";
  if (/\b(galaxy watch|apple watch|amazfit|garmin|fitbit|mi band|watch ultra)\b/.test(t)) return "smart-watches";
  if (/\b(iphone|galaxy|pixel|redmi|oppo|vivo|realme|infinix|tecno|nothing phone)\b/.test(t)) return "mobiles";
  if (/\b(power.?bank|mah)\b/.test(t)) return "power-banks";
  if (/\b(charger|adapter|gan)\b/.test(t)) return "wall-chargers";
  if (/\b(speaker|soundbar)\b/.test(t)) return "bluetooth-speakers";
  if (/\b(ipad|tab s|tablet)\b/.test(t)) return "tablets";
  if (/\b(macbook|laptop|notebook|thinkbook)\b/.test(t)) return "laptops";

  return "mobiles";
}
