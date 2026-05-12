import { describe, expect, it } from "vitest";
import { canSelectVariantCombination } from "@/lib/product-variant-availability";
import type { Product, Variant } from "@/types";

function v(
  id: string,
  options: Array<{ name: string; value: string }>,
  available: boolean,
  qty?: number | null,
): Variant {
  return {
    id,
    title: id,
    availableForSale: available,
    quantityAvailable: qty ?? null,
    selectedOptions: options,
    price: { amount: "10", currencyCode: "USD" },
  };
}

function productWithMatrix(): Product {
  return {
    id: "p",
    handle: "h",
    title: "T",
    description: "",
    availableForSale: true,
    tags: [],
    options: [
      { id: "1", name: "Size", values: ["S", "M"] },
      { id: "2", name: "Color", values: ["Red", "Blue"] },
    ],
    priceRange: {
      minVariantPrice: { amount: "10", currencyCode: "USD" },
      maxVariantPrice: { amount: "10", currencyCode: "USD" },
    },
    images: [],
    variants: [
      v("sr", [
        { name: "Size", value: "S" },
        { name: "Color", value: "Red" },
      ], true),
      v("sb", [
        { name: "Size", value: "S" },
        { name: "Color", value: "Blue" },
      ], false, 0),
      v("mr", [
        { name: "Size", value: "M" },
        { name: "Color", value: "Red" },
      ], true),
      v("mb", [
        { name: "Size", value: "M" },
        { name: "Color", value: "Blue" },
      ], true),
    ],
  };
}

describe("canSelectVariantCombination", () => {
  it("allows only combinations that map to an available variant", () => {
    const p = productWithMatrix();
    expect(canSelectVariantCombination(p, { Size: "S", Color: "Red" }, "Color", "Blue")).toBe(
      false,
    );
    expect(canSelectVariantCombination(p, { Size: "M", Color: "Red" }, "Color", "Blue")).toBe(
      true,
    );
  });

  it("returns false when no variants", () => {
    const empty: Product = {
      ...productWithMatrix(),
      variants: [],
    };
    expect(canSelectVariantCombination(empty, {}, "Size", "S")).toBe(false);
  });

  it("returns false when all matching variants are unavailable", () => {
    const p: Product = {
      ...productWithMatrix(),
      variants: [v("only", [{ name: "Size", value: "S" }], false, 0)],
    };
    expect(canSelectVariantCombination(p, {}, "Size", "S")).toBe(false);
  });
});
