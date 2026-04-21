"use client";

import toast from "react-hot-toast";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  addToCart as addToCartAction,
  createCart as createCartAction,
  getCart as getCartAction,
  removeFromCart as removeFromCartAction,
  updateCartLines as updateCartLinesAction,
} from "@/lib/shopify/cart-actions";
import type { ShopifyCart } from "@/types/shopify";

export interface CartState {
  cartId: string | null;
  cart: ShopifyCart | null;
  isOpen: boolean;
  isLoading: boolean;
  /** The variantId most recently added via `addItem` — handy for highlight animations. */
  lastAddedItem: string | null;
  /** Prevents `initCart` from running more than once per session. */
  _initPromise: Promise<void> | null;

  initCart: () => Promise<void>;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

/** Shown to users when a Shopify/network error bubbles up. */
function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

/**
 * Re-fetches the persisted cart from Shopify. Used after a failed optimistic
 * mutation so the UI snaps back to server truth.
 */
async function refetchQuietly(cartId: string | null): Promise<ShopifyCart | null> {
  if (!cartId) return null;
  try {
    return await getCartAction(cartId);
  } catch {
    return null;
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      cart: null,
      isOpen: false,
      isLoading: false,
      lastAddedItem: null,
      _initPromise: null,

      initCart: async () => {
        const existing = get()._initPromise;
        if (existing) return existing;

        const promise = (async () => {
          set({ isLoading: true });
          try {
            const { cartId } = get();
            if (cartId) {
              const cart = await getCartAction(cartId);
              if (cart) {
                set({ cart, isLoading: false });
                return;
              }
            }
            const cart = await createCartAction();
            set({ cartId: cart.id, cart, isLoading: false });
          } catch (err) {
            set({ isLoading: false });
            // Don't toast on init — the user didn't actively trigger this.
            console.error("[cart] initCart failed:", err);
          }
        })();

        set({ _initPromise: promise });
        return promise;
      },

      addItem: async (variantId, quantity = 1) => {
        if (!variantId || quantity < 1) return;

        // Ensure we have a cart before mutating.
        let { cartId } = get();
        if (!cartId) {
          try {
            const created = await createCartAction();
            cartId = created.id;
            set({ cartId, cart: created });
          } catch (err) {
            toast.error(errorMessage(err, "Could not create cart"));
            return;
          }
        }

        // Optimistic: bump the total-quantity counter so the header badge
        // updates instantly; we'll reconcile with the real cart shape below.
        const snapshot = get().cart;
        set((state) => ({
          isLoading: true,
          cart: state.cart
            ? { ...state.cart, totalQuantity: state.cart.totalQuantity + quantity }
            : state.cart,
        }));

        try {
          const cart = await addToCartAction(cartId, [
            { merchandiseId: variantId, quantity },
          ]);
          set({
            cart,
            isLoading: false,
            lastAddedItem: variantId,
            isOpen: true,
          });
          toast.success("Added to bag");
        } catch (err) {
          // Revert optimistic delta to server truth.
          const fresh = await refetchQuietly(get().cartId);
          set({ cart: fresh ?? snapshot, isLoading: false });
          toast.error(errorMessage(err, "Could not add item"));
        }
      },

      updateItem: async (lineId, quantity) => {
        const { cartId } = get();
        if (!cartId || !lineId) return;

        // Treat 0 as "remove" — matches Shopify's own client behavior.
        if (quantity <= 0) {
          return get().removeItem(lineId);
        }

        set({ isLoading: true });
        try {
          const cart = await updateCartLinesAction(cartId, [{ id: lineId, quantity }]);
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
          const cart = await removeFromCartAction(cartId, [lineId]);
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
    }),
    {
      name: "shopify-cart",
      storage: createJSONStorage(() => localStorage),
      // Only persist the cartId — the full cart can drift server-side and
      // should be re-fetched on every page load via `initCart()`.
      partialize: (state) => ({ cartId: state.cartId }),
      version: 1,
    },
  ),
);

/* --------------------------- Selector helpers ----------------------------- */

export const selectCartCount = (s: CartState): number =>
  s.cart?.totalQuantity ?? 0;

export const selectCartLines = (s: CartState) => s.cart?.lines ?? [];

export const selectSubtotal = (s: CartState) =>
  s.cart?.cost.subtotalAmount ?? null;
