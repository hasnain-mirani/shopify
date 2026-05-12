import type { ProductIdentifyFromImageResult } from "@/lib/api-client";

/** Coerced identify payload: every field the form reads is a defined string (avoids `.trim()` on numbers/arrays). */
export type NormalizedProductIdentifyPayload = Omit<
  Required<ProductIdentifyFromImageResult>,
  "sources"
> & { sources?: string[] };

function strField(v: unknown, maxLen?: number): string {
  if (v == null) return "";
  if (Array.isArray(v)) {
    const joined = v.map((x) => String(x).trim()).filter(Boolean).join(", ");
    return maxLen != null ? joined.slice(0, maxLen) : joined;
  }
  if (typeof v === "number" && Number.isFinite(v)) {
    const s = String(v);
    return maxLen != null ? s.slice(0, maxLen) : s;
  }
  if (typeof v === "boolean") return v ? "true" : "";
  const s = String(v).trim();
  return maxLen != null ? s.slice(0, maxLen) : s;
}

function pick(o: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (k in o && o[k] != null && String(o[k]).length > 0) return o[k];
  }
  return undefined;
}

function extractPkrNumber(text: string): string {
  const flat = String(text || "").replace(/,/g, "");
  const m =
    flat.match(/(?:PKR|Rs\.?)\s*[:\-]?\s*(\d+(?:\.\d+)?)/i) ||
    flat.match(/\bfrom\s+(\d{3,}(?:\.\d+)?)\b/i) ||
    flat.match(/\b(\d{4,}(?:\.\d+)?)\b/);
  return m ? m[1] : "";
}

/**
 * Coerce `/product-ai/identify-from-image` JSON into safe strings for the admin form.
 * Prevents runtime errors when the model returns numbers, arrays, or snake_case keys.
 */
export function normalizeProductIdentifyPayload(raw: unknown): NormalizedProductIdentifyPayload {
  const o = raw !== null && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const title = strField(pick(o, "title", "product_title"), 200);
  const description = strField(pick(o, "description", "body", "long_description"));
  const descriptionHtml = strField(pick(o, "descriptionHtml", "description_html", "html_description"));
  const vendor = strField(pick(o, "vendor", "brand", "manufacturer"), 200);
  const productType = strField(pick(o, "productType", "product_type", "category"), 80);
  const tags = strField(pick(o, "tags", "keywords"), 2000);
  const specifications = strField(pick(o, "specifications", "specs", "technical_specifications"), 20000);

  let ourPrice = strField(pick(o, "ourPrice", "our_price", "sale_price", "price"));
  let marketPrice = strField(pick(o, "marketPrice", "market_price", "mrp", "list_price", "compare_at_price"));
  const estimatedPrice =
    strField(pick(o, "estimatedPrice", "estimated_price", "price_note")) || "PKR —";

  if (!ourPrice && estimatedPrice) {
    ourPrice = extractPkrNumber(estimatedPrice);
  }
  if (!ourPrice && estimatedPrice) {
    for (const part of estimatedPrice.split(/[–—\-~]/)) {
      const hit = extractPkrNumber(part);
      if (hit) {
        ourPrice = hit;
        break;
      }
    }
  }
  if (!ourPrice && description) {
    ourPrice = extractPkrNumber(description.slice(0, 1200));
  }

  const sku = strField(pick(o, "sku", "SKU", "part_number"), 120);
  const barcode = strField(pick(o, "barcode", "ean", "upc", "gtin"), 120);
  const weight = strField(pick(o, "weight", "item_weight"), 32);
  const weightUnitRaw = strField(pick(o, "weightUnit", "weight_unit")).toLowerCase();
  const weightUnitStr =
    weightUnitRaw === "kg" || weightUnitRaw === "g" || weightUnitRaw === "lb" || weightUnitRaw === "oz"
      ? weightUnitRaw
      : "";

  const seoTitle = strField(pick(o, "seoTitle", "seo_title", "meta_title"), 200);
  const seoDescription = strField(pick(o, "seoDescription", "seo_description", "meta_description"), 320);

  const sourcesRaw = o.sources;
  const sources = Array.isArray(sourcesRaw)
    ? sourcesRaw.map((s) => String(s)).filter(Boolean).slice(0, 12)
    : undefined;

  return {
    title,
    description,
    descriptionHtml,
    vendor,
    productType,
    tags,
    specifications,
    marketPrice,
    ourPrice,
    estimatedPrice,
    sku,
    barcode,
    weight,
    weightUnit: weightUnitStr,
    seoTitle,
    seoDescription,
    sources,
  };
}
