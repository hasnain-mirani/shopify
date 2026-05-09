"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist-store";
import { useIsMounted } from "@/hooks/useIsMounted";
import { ProductCard } from "@/components/product/ProductCard";

export default function WishlistPage() {
  const isMounted = useIsMounted();
  const items = useWishlistStore((s) => s.items);

  if (!isMounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-brand-600 border-t-transparent animate-spin mb-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-50 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-brand-900 mb-3">
              Your Wishlist
            </h1>
            <p className="text-brand-600 font-ui text-lg">
              {items.length} {items.length === 1 ? "item" : "items"} saved
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 md:p-24 text-center border border-brand-200/50 shadow-sm flex flex-col items-center">
            <div className="h-24 w-24 rounded-full bg-brand-100 flex items-center justify-center mb-6">
              <Heart className="h-10 w-10 text-brand-400" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-brand-900 mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-brand-600 mb-8 max-w-md mx-auto">
              You haven't saved any items yet. Start exploring our collection and tap the heart icon to save your favorites here.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-brand-900 text-white font-ui font-semibold transition-transform hover:scale-105"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
            {items.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                priority={index < 4}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
