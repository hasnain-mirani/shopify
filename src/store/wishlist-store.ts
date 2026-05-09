"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ShopifyProduct } from "@/types/shopify";

export interface WishlistState {
  items: ShopifyProduct[];
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  addItem: (product: ShopifyProduct) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: ShopifyProduct) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
      addItem: (product) => set((state) => {
        if (state.items.find((p) => p.id === product.id)) return state;
        return { items: [...state.items, product] };
      }),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter((p) => p.id !== productId)
      })),
      toggleItem: (product) => {
        const { items, addItem, removeItem } = get();
        if (items.find((p) => p.id === product.id)) {
          removeItem(product.id);
        } else {
          addItem(product);
        }
      },
      isInWishlist: (productId) => get().items.some((p) => p.id === productId),
    }),
    {
      name: "store-wishlist",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
