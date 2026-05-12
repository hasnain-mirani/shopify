"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { formatPrice } from "@/lib/utils";
import { safeCheckoutHref } from "@/lib/safe-checkout-href";

export function CartPageClient() {
  const cart = useCartStore((s) => s.cart);
  const initCart = useCartStore((s) => s.initCart);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    void initCart();
  }, [initCart]);

  const lines = cart?.items ?? [];
  const isEmpty = lines.length === 0;

  if (!cart) {
    return (
      <div className="min-h-[50vh] bg-background">
        <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-8">
          <div className="mx-auto max-w-md space-y-4">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-32 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-8 md:py-14">
        <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Your cart
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEmpty ? "Ready when you are." : `${lines.length} ${lines.length === 1 ? "item" : "items"} in your bag`}
            </p>
          </div>
          {!isEmpty && (
            <Link href="/shop" className="text-sm font-medium text-accent underline-offset-4 hover:underline">
              Continue shopping
            </Link>
          )}
        </div>

        {isEmpty ? (
          <div className="mx-auto flex max-w-lg flex-col items-center rounded-3xl border border-border bg-card px-8 py-16 text-center shadow-card">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-11 w-11 text-muted-foreground" aria-hidden />
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground">Your cart is empty</h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Browse the shop and add products you love. Your selections sync here and in the bag icon in
              the header.
            </p>
            <Link href="/shop" className="btn-primary mt-8 inline-flex min-h-11 items-center justify-center px-8">
              Shop bestsellers
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
            <div className="rounded-3xl border border-border bg-card shadow-card">
              <ul className="divide-y divide-border px-4 md:px-6">
                {lines.map((line) => (
                  <CartLineItem key={line.id} line={line} />
                ))}
              </ul>
            </div>

            <aside className="lg:sticky lg:top-24">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-elevated">
                <h2 className="font-ui text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Order summary
                </h2>
                <p className="mt-4 text-3xl font-semibold tabular-nums text-foreground">
                  {formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>

                <details
                  className="mt-6 group rounded-xl border border-border bg-background/50"
                  open={promoOpen}
                  onToggle={(e) => setPromoOpen((e.target as HTMLDetailsElement).open)}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
                    Promo code
                    {promoOpen ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    )}
                  </summary>
                  <div className="border-t border-border px-4 pb-4 pt-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Enter code"
                        autoComplete="off"
                        className="min-h-11 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <button
                        type="button"
                        className="min-h-11 shrink-0 rounded-lg border border-border px-4 text-sm font-medium text-muted-foreground"
                        disabled
                        title="Promo codes are not enabled yet"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Promotional codes coming soon.</p>
                  </div>
                </details>

                <Link
                  href={safeCheckoutHref(cart.checkoutUrl)}
                  className="btn-primary mt-6 flex min-h-11 w-full items-center justify-center gap-2"
                >
                  Proceed to checkout
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
