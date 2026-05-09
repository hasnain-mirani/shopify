import { queryAll } from "@/lib/db";

type OptionWithValues = { name: string; values: string[] };

/**
 * Rebuild `selectedOptions` for storefront variant matching (ProductVariantSelector / getVariantId).
 * Admin saves combination titles like "Red / Large" aligned with option order.
 */
function selectedOptionsFromVariantTitle(
  title: string,
  optionsOrdered: OptionWithValues[],
): Array<{ name: string; value: string }> {
  if (!optionsOrdered.length) return [];

  const t = title.trim();
  if (!t) return [];

  if (optionsOrdered.length === 1) {
    const only = optionsOrdered[0];
    const byValue = only.values.find((v) => v.toLowerCase() === t.toLowerCase());
    if (byValue) return [{ name: only.name, value: byValue }];
    if (t.toLowerCase() === "default title" && only.values[0]) {
      return [{ name: only.name, value: only.values[0] }];
    }
    return [{ name: only.name, value: t }];
  }

  const parts = t.split(/\s*\/\s*/).map((s) => s.trim()).filter(Boolean);
  if (parts.length === optionsOrdered.length) {
    return optionsOrdered.map((opt, i) => ({ name: opt.name, value: parts[i] }));
  }

  const usedPartIdx = new Set<number>();
  const out: Array<{ name: string; value: string }> = [];
  for (const opt of optionsOrdered) {
    let hit: string | undefined;
    let partIdx = -1;
    for (const v of opt.values) {
      const j = parts.findIndex(
        (p, pi) => !usedPartIdx.has(pi) && p.toLowerCase() === v.toLowerCase(),
      );
      if (j !== -1) {
        hit = v;
        partIdx = j;
        break;
      }
    }
    if (hit === undefined || partIdx < 0) return [];
    usedPartIdx.add(partIdx);
    out.push({ name: opt.name, value: hit });
  }
  return out;
}

/** Shape a single DB `products` row into the JSON returned by GET /api/products. */
export async function serializeProductRow(p: Record<string, unknown>) {
  const id = p.id as string;
  const images = await queryAll(
    "SELECT * FROM product_images WHERE product_id = ? ORDER BY position",
    [id],
  );
  const variants = await queryAll(
    "SELECT * FROM product_variants WHERE product_id = ? ORDER BY position",
    [id],
  );
  const options = await queryAll(
    "SELECT * FROM product_options WHERE product_id = ? ORDER BY position",
    [id],
  );
  const tags = JSON.parse((p.tags as string) || "[]");
  const prices = variants.map((v: { price: number }) => v.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const comparePrices = variants
    .map((v: { compare_at_price: number | null }) => v.compare_at_price)
    .filter((x: number | null): x is number => x != null && x > 0);
  const minCompare =
    comparePrices.length > 0 ? Math.min(...comparePrices) : null;

  const optionsWithValues = await Promise.all(
    options.map(async (opt: { id: string; name: string }) => {
      const values = await queryAll(
        "SELECT * FROM product_option_values WHERE option_id = ? ORDER BY position",
        [opt.id],
      );
      return {
        id: opt.id,
        name: opt.name,
        values: values.map((v: { value: string }) => v.value),
      };
    }),
  );

  const status = p.status as string;

  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    description: p.description,
    descriptionHtml: p.description_html || p.description,
    specifications: p.specifications || "",
    vendor: p.vendor,
    productType: p.product_type,
    status,
    tags,
    marketPrice: p.market_price,
    ourPrice: p.our_price,
    costPerItem: p.cost_per_item,
    barcode: p.barcode,
    trackQuantity: p.track_quantity === 1,
    continueSellingWhenOutOfStock: p.continue_selling_when_out_of_stock === 1,
    requiresShipping: p.requires_shipping === 1,
    weight: p.weight,
    weightUnit: p.weight_unit,
    seoTitle: p.seo_title,
    seoDescription: p.seo_description,
    availableForSale: status === "ACTIVE",
    featuredImage: images[0] || null,
    images,
    options: optionsWithValues,
    compareAtPriceRange:
      minCompare != null && minCompare > minPrice
        ? {
            minVariantPrice: { amount: String(minCompare), currencyCode: "PKR" },
            maxVariantPrice: { amount: String(Math.max(...comparePrices)), currencyCode: "PKR" },
          }
        : undefined,
    variants: variants.map(
      (v: {
        id: string;
        title: string;
        sku: string;
        price: number;
        compare_at_price: number | null;
        quantity: number;
        available_for_sale: number;
        barcode: string;
        weight: number | null;
        weight_unit: string;
      }) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        price: { amount: String(v.price), currencyCode: "PKR" },
        compareAtPrice: v.compare_at_price
          ? { amount: String(v.compare_at_price), currencyCode: "PKR" }
          : null,
        availableForSale: status === "ACTIVE" && v.quantity > 0 && v.available_for_sale === 1,
        quantityAvailable: v.quantity,
        selectedOptions: selectedOptionsFromVariantTitle(
          v.title,
          optionsWithValues.map(({ name, values }) => ({ name, values })),
        ),
        barcode: v.barcode,
        weight: v.weight,
        weightUnit: v.weight_unit,
      }),
    ),
    priceRange: {
      minVariantPrice: { amount: String(minPrice), currencyCode: "PKR" },
      maxVariantPrice: { amount: String(maxPrice), currencyCode: "PKR" },
    },
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}
