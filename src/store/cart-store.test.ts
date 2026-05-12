import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  mockCreate: vi.fn(),
  mockGet: vi.fn(),
  mockAddItem: vi.fn(),
  mockUpdateItem: vi.fn(),
  mockRemoveItem: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

vi.mock("@/lib/api-client", () => ({
  ApiError: class ApiError extends Error {
    status?: number;
    constructor(message: string, opts?: { status?: number }) {
      super(message);
      this.name = "ApiError";
      this.status = opts?.status;
    }
  },
  api: {
    cart: {
      get: mocks.mockGet,
      create: mocks.mockCreate,
      addItem: mocks.mockAddItem,
      updateItem: mocks.mockUpdateItem,
      removeItem: mocks.mockRemoveItem,
    },
  },
}));

const memoryStorage = (() => {
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
  };
})();

function emptyCart(id: string) {
  return {
    id,
    totalQuantity: 0,
    items: [] as Array<{
      id: string;
      quantity: number;
      variant_id: string;
      product_title: string;
      variant_title: string;
      price: number;
      image_url: string;
    }>,
    cost: {
      subtotalAmount: { amount: "0", currencyCode: "PKR" },
      totalAmount: { amount: "0", currencyCode: "PKR" },
    },
  };
}

describe("cart store", () => {
  beforeEach(() => {
    memoryStorage.clear();
    vi.stubGlobal("localStorage", memoryStorage);
    vi.resetModules();
    vi.clearAllMocks();
    mocks.mockGet.mockResolvedValue(null);
    mocks.mockUpdateItem.mockResolvedValue(emptyCart("c1"));
    mocks.mockRemoveItem.mockResolvedValue(emptyCart("c1"));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not call API when variantId is empty", async () => {
    const { useCartStore } = await import("@/store/cart-store");
    await useCartStore.getState().addItem("", "X", 10);
    expect(mocks.mockCreate).not.toHaveBeenCalled();
    expect(mocks.mockAddItem).not.toHaveBeenCalled();
  });

  it("sends gift-wrap title, variantTitle, and bumped price to addItem", async () => {
    mocks.mockCreate.mockResolvedValue(emptyCart("cart-gw"));
    mocks.mockAddItem.mockImplementation(async (_cartId, payload: Record<string, unknown>) => {
      const price = Number(payload.price);
      return {
        ...emptyCart("cart-gw"),
        totalQuantity: 1,
        items: [
          {
            id: "line1",
            quantity: 1,
            variant_id: String(payload.variantId ?? "v1"),
            product_title: String(payload.productTitle),
            variant_title: String(payload.variantTitle ?? ""),
            price,
            image_url: String(payload.imageUrl ?? ""),
          },
        ],
        cost: {
          subtotalAmount: { amount: String(price), currencyCode: "PKR" },
          totalAmount: { amount: String(price), currencyCode: "PKR" },
        },
      };
    });

    const { useCartStore } = await import("@/store/cart-store");
    await useCartStore.getState().addItem("v1", "Watch", 5000, "", 1, {
      giftWrap: true,
      giftWrapFeePkr: 199,
    });

    expect(mocks.mockAddItem).toHaveBeenCalledWith(
      "cart-gw",
      expect.objectContaining({
        productTitle: "Watch (+ Gift Wrap)",
        price: 5199,
        variantTitle: expect.stringContaining("199"),
      }),
    );
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Added to bag");
  });

  it("uses default wrap fee 199 when giftWrap true and fee omitted", async () => {
    mocks.mockCreate.mockResolvedValue(emptyCart("cart-2"));
    mocks.mockAddItem.mockImplementation(async (_id, payload: Record<string, unknown>) => ({
      ...emptyCart("cart-2"),
      totalQuantity: 1,
      items: [],
      cost: {
        subtotalAmount: { amount: String(payload.price), currencyCode: "PKR" },
        totalAmount: { amount: String(payload.price), currencyCode: "PKR" },
      },
    }));
    const { useCartStore } = await import("@/store/cart-store");
    await useCartStore.getState().addItem("v1", "Watch", 100, "", 1, { giftWrap: true });
    expect(mocks.mockAddItem).toHaveBeenCalledWith(
      "cart-2",
      expect.objectContaining({ price: 299 }),
    );
  });

  it("shows toast when create fails before addItem", async () => {
    mocks.mockCreate.mockRejectedValue(new Error("network"));
    const { useCartStore } = await import("@/store/cart-store");
    await useCartStore.getState().addItem("v1", "Watch", 50);
    expect(mocks.mockAddItem).not.toHaveBeenCalled();
    expect(mocks.toastError).toHaveBeenCalled();
  });
});
