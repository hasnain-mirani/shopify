import type { Product } from "@/types";
import { plainTextFromHtml, stripEmojisForSeo } from "./text";

function firstFeatureSnippet(product: Product): string {
  const raw = String(product.specifications ?? "").trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const first = Object.entries(parsed)[0];
      if (first) return `${first[0]}: ${String(first[1])}`;
    } catch {
      const line = raw.split(/\r?\n/).find((l) => l.includes(":"));
      if (line) return line.trim();
    }
  }
  const t = (product.tags ?? []).filter(Boolean)[0];
  return t ? `Tagged: ${t}` : "Premium build and everyday reliability.";
}

/** Ensures ~150+ words for crawlable body copy with local keywords. */
export function buildProductSeoNarrative(
  product: Product,
  primaryKeyword: string,
): string {
  const clean = stripEmojisForSeo(product.title);
  const existing = plainTextFromHtml(
    product.descriptionHtml ?? product.description ?? "",
  );
  if (existing.split(/\s+/).filter(Boolean).length >= 150) {
    return existing;
  }

  const feat = firstFeatureSnippet(product);
  const type = (product.productType ?? "mobile accessory").toLowerCase();

  return [
    `Buy ${clean} online in Pakistan from SSHUB—trusted for mobile accessories, earbuds, smartwatches, and charging gear.`,
    `This ${type} is selected for quality and value: ${feat}`,
    `Whether you need reliable audio, longer battery life, or a better daily carry setup, ${clean} fits modern use across cities and travel.`,
    `SSHUB focuses on clear specs, fair pricing, and fast delivery nationwide.`,
    `Shop ${primaryKeyword} with confidence: authentic listings, helpful support, and straightforward returns when you order from SSHUB.`,
    existing,
  ]
    .filter(Boolean)
    .join(" ");
}
