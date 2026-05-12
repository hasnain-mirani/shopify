"use client";

import toast from "react-hot-toast";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { api, ApiError } from "@/lib/api-client";
import type { Cart } from "@/types";

export interface CartState {
  cartId: string | null;
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  lastAddedItem: string | null;
  _initPromise: Promise<void> | null;

  initCart: () => Promise<void>;
  addItem: (
    variantId: string,
    productTitle: string,
    price: number,
    imageUrl?: string,
    quantity?: number,
    opts?: { giftWrap?: boolean; giftWrapFeePkr?: number },
  ) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  clearCart: () => void;
}

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

async function refetchQuietly(cartId: string | null): Promise<Cart | null> {
  if (!cartId) return null;
  try { return await api.cart.get(cartId); } catch { return null; }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null, cart: null, isOpen: false, isLoading: false, lastAddedItem: null, _initPromise: null,

      initCart: async () => {
        const existing = get()._initPromise;
        if (existing) return existing;
        const promise = (async () => {
          set({ isLoading: true });
          try {
            const { cartId } = get();
            if (cartId) {
              try {
                const cart = await api.cart.get(cartId);
                if (cart) {
                  set({ cart, isLoading: false });
                  return;
                }
              } catch (err) {
                // Persisted cart IDs can go stale (deleted/expired server-side).
                // Recover transparently by creating a fresh cart instead of failing init.
                if (!(err instanceof ApiError) || err.status !== 404) {
                  throw err;
                }
              }
            }
            const cart = await api.cart.create();
            set({ cartId: cart.id, cart, isLoading: false });
          } catch (err) {
            set({ isLoading: false });
            // Silent fail: cart can be initialized later without noisy console errors.
          } finally {
            set({ _initPromise: null });
          }
        })();
        set({ _initPromise: promise });
        return promise;
      },

      addItem: async (variantId, productTitle, price, imageUrl = "", quantity = 1, opts) => {
        if (!variantId || quantity < 1) return;
        const wrapFee = opts?.giftWrap ? (opts.giftWrapFeePkr ?? 199) : 0;
        const lineTitle = opts?.giftWrap ? `${productTitle} (+ Gift Wrap)` : productTitle;
        const linePrice = Number(price) + wrapFee;
        const variantTitle = opts?.giftWrap ? `Gift wrap Rs ${wrapFee.toLocaleString("en-PK")}` : "";
        let { cartId } = get();
        if (!cartId) {
          try {
            const created = await api.cart.create();
            cartId = created.id;
            set({ cartId, cart: created });
          } catch (err) { toast.error(errorMessage(err, "Could not create cart")); return; }
        }
        const snapshot = get().cart;
        set((s) => ({ isLoading: true, cart: s.cart ? { ...s.cart, totalQuantity: s.cart.totalQuantity + quantity } : s.cart }));
        try {
          if (!cartId) throw new Error("Cart ID is required");
          const cart = await api.cart.addItem(cartId, {
            variantId,
            productTitle: lineTitle,
            variantTitle,
            price: linePrice,
            quantity,
            imageUrl,
          });
          set({ cart, isLoading: false, lastAddedItem: variantId, isOpen: true });
          toast.success("Added to bag");
        } catch (err) {
          const fresh = await refetchQuietly(get().cartId);
          set({ cart: fresh ?? snapshot, isLoading: false });
          toast.error(errorMessage(err, "Could not add item"));
        }
      },

      updateItem: async (lineId, quantity) => {
        const { cartId } = get();
        if (!cartId || !lineId) return;
        if (quantity <= 0) return get().removeItem(lineId);
        set({ isLoading: true });
        try {
          const cart = await api.cart.updateItem(cartId, lineId, quantity);
          set({ cart, isLoading: false });
        } catch (err) {
          const fresh = await refetchQuietly(cartId);
          set({ cart: fresh ?? get().cart, isLoading: false });
          toast.error(errorMessage(err, "Could not update quantity"));
        }
      },

      removeItem: async (lineId) => {
        const { cartId } = get();
        if (!cartId || !lineId) return;
        set({ isLoading: true });
        try {
          const cart = await api.cart.removeItem(cartId, lineId);
          set({ cart, isLoading: false });
        } catch (err) {
          const fresh = await refetchQuietly(cartId);
          set({ cart: fresh ?? get().cart, isLoading: false });
          toast.error(errorMessage(err, "Could not remove item"));
        }
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      clearCart: () => set({ cartId: null, cart: null }),
    }),
    { name: "store-cart", storage: createJSONStorage(() => localStorage), partialize: (s) => ({ cartId: s.cartId }), version: 2 },
  ),
);

export const selectCartCount = (s: CartState): number => s.cart?.totalQuantity ?? 0;
export const selectCartLines = (s: CartState) => s.cart?.items ?? [];
export const selectSubtotal = (s: CartState) => s.cart?.cost.subtotalAmount ?? null;
