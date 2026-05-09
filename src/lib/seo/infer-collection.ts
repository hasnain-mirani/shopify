import type { Product } from "@/types";

export interface InferredCollection {
  href: string;
  title: string;
}

/** Map product signals to a primary collection for internal links & breadcrumbs. */
export function inferPrimaryCollection(
  product: Product,
  collections: Array<{ handle: string; title: string }>,
): InferredCollection | null {
  const handles = new Set(collections.map((c) => c.handle.toLowerCase()));
  const titleByHandle = new Map(
    collections.map((c) => [c.handle.toLowerCase(), c.title] as const),
  );

  const type = (product.productType ?? "").toLowerCase();
  const tagStr = (product.tags ?? []).join(" ").toLowerCase();
  const blob = `${type} ${tagStr} ${product.title}`.toLowerCase();

  const tryHandle = (h: string): InferredCollection | null => {
    const key = h.toLowerCase();
    if (!handles.has(key)) return null;
    return {
      href: `/collections/${key}`,
      title: titleByHandle.get(key) ?? h,
    };
  };

  if (blob.includes("earbud") || blob.includes("ear bud") || blob.includes("airpod"))
    return tryHandle("wireless-earbuds") ?? tryHandle("new-products");
  if (blob.includes("watch") || blob.includes("smartwatch") || blob.includes("wearable"))
    return tryHandle("smart-watches") ?? tryHandle("new-products");
  if (blob.includes("power bank") || blob.includes("powerbank"))
    return tryHandle("power-banks");
  if (blob.includes("charger") || blob.includes("adapter") || blob.includes("charging"))
    return tryHandle("wall-chargers");
  if (blob.includes("speaker"))
    return tryHandle("bluetooth-speakers");

  for (const t of product.tags ?? []) {
    const slug = t.toLowerCase().replace(/\s+/g, "-");
    const hit = tryHandle(slug);
    if (hit) return hit;
  }

  return tryHandle("new-products");
}
