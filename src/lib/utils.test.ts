import { describe, expect, it } from "vitest";
import {
  cn,
  formatPrice,
  getVariantId,
  isVariantAvailable,
  truncate,
} from "@/lib/utils";
import type { Product, Variant } from "@/types";

describe("formatPrice", () => {
  it("formats string amounts for PKR", () => {
    expect(formatPrice("1299.5", "PKR", "en-PK")).toMatch(/1[,.]?299/);
  });

  it("formats numeric USD", () => {
    const out = formatPrice(10, "USD", "en-US");
    expect(out).toContain("10");
    expect(out).toContain("$");
  });

  it("handles invalid currency without throwing", () => {
    const out = formatPrice(5, "XXX");
    expect(out).toMatch(/5/);
  });

  it("treats non-numeric string as 0", () => {
    expect(formatPrice("nope", "USD")).toContain("0");
  });
});

describe("truncate", () => {
  it("returns empty for falsy", () => {
    expect(truncate("", 5)).toBe("");
  });

  it("returns original when short enough", () => {
    expect(truncate("hi", 10)).toBe("hi");
  });

  it("truncates with ellipsis respecting max length", () => {
    expect(truncate("abcdefghij", 5)).toBe("abcd…");
  });
});

describe("cn", () => {
  it("merges tailwind conflicts toward later args", () => {
    expect(cn("px-2", "px-8")).toBe("px-8");
  });

  it("handles conditional classes", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });
});

function variant(
  id: string,
  opts: Array<{ name: string; value: string }>,
  available = true,
  qty: number | null = null,
): Variant {
  return {
    id,
    title: id,
    availableForSale: available,
    quantityAvailable: qty,
    selectedOptions: opts,
    price: { amount: "1", currencyCode: "USD" },
  };
}

describe("getVariantId", () => {
  const product: Pick<Product, "variants"> = {
    variants: [
      variant("v1", [
        { name: "Size", value: "M" },
        { name: "Color", value: "Black" },
      ]),
      variant("v2", [
        { name: "Size", value: "S" },
        { name: "Color", value: "Black" },
      ]),
    ],
  };

  it("matches record selection case-insensitively on values", () => {
    expect(
      getVariantId(product, { Size: "m", Color: "BLACK" }),
    ).toBe("v1");
  });

  it("matches array option order", () => {
    expect(
      getVariantId(product, [
        { name: "Color", value: "Black" },
        { name: "Size", value: "S" },
      ]),
    ).toBe("v2");
  });

  it("returns first variant when desired empty", () => {
    expect(getVariantId(product, {})).toBe("v1");
  });

  it("returns undefined when no match", () => {
    expect(getVariantId(product, { Size: "XL", Color: "Black" })).toBeUndefined();
  });
});

describe("isVariantAvailable", () => {
  it("false for null", () => {
    expect(isVariantAvailable(null)).toBe(false);
  });

  it("false when not for sale", () => {
    expect(isVariantAvailable({ availableForSale: false, quantityAvailable: 5 })).toBe(
      false,
    );
  });

  it("false when quantity is 0", () => {
    expect(isVariantAvailable({ availableForSale: true, quantityAvailable: 0 })).toBe(
      false,
    );
  });

  it("true when for sale and quantity omitted", () => {
    expect(isVariantAvailable({ availableForSale: true })).toBe(true);
  });

  it("true when for sale and quantity positive", () => {
    expect(isVariantAvailable({ availableForSale: true, quantityAvailable: 3 })).toBe(
      true,
    );
  });
});
