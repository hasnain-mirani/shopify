import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const local = (() => {
  let map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
    clear: () => {
      map = new Map();
    },
    key: (i: number) => Array.from(map.keys())[i] ?? "",
    get length() {
      return map.size;
    },
  };
})();

describe("wishlist store", () => {
  beforeEach(() => {
    local.clear();
    vi.stubGlobal("localStorage", local);
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("addItem dedupes by product id", async () => {
    const { useWishlistStore } = await import("@/store/wishlist-store");
    const p = minimalProduct("1");
    useWishlistStore.getState().addItem(p);
    useWishlistStore.getState().addItem(p);
    expect(useWishlistStore.getState().items).toHaveLength(1);
  });

  it("toggleItem removes when already present", async () => {
    const { useWishlistStore } = await import("@/store/wishlist-store");
    const p = minimalProduct("2");
    useWishlistStore.getState().addItem(p);
    expect(useWishlistStore.getState().isInWishlist("2")).toBe(true);
    useWishlistStore.getState().toggleItem(p);
    expect(useWishlistStore.getState().isInWishlist("2")).toBe(false);
    expect(useWishlistStore.getState().items).toHaveLength(0);
  });
});

function minimalProduct(id: string) {
  return {
    id,
    handle: `h-${id}`,
    title: "Item",
    description: "",
    availableForSale: true,
    tags: [],
    options: [],
    priceRange: {
      minVariantPrice: { amount: "1", currencyCode: "USD" },
      maxVariantPrice: { amount: "1", currencyCode: "USD" },
    },
    images: [],
    variants: [],
  };
}
