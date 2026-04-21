"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { CartLineItem } from "./CartLineItem";

export interface CartDrawerProps {
  /** Extra classes on the panel (for theming). */
  className?: string;
}

export function CartDrawer({ className }: CartDrawerProps) {
  const cart = useCartStore((s) => s.cart);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const initCart = useCartStore((s) => s.initCart);

  // Load (or create) the cart the first time the drawer mounts.
  useEffect(() => {
    void initCart();
  }, [initCart]);

  const lines = cart?.lines ?? [];
  const totalQuantity = cart?.totalQuantity ?? 0;
  const isEmpty = lines.length === 0;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(next) => !next && closeCart()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/40",
            "data-[state=open]:animate-fade-in",
            "data-[state=closed]:opacity-0 transition-opacity duration-300",
          )}
        />

        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            "fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col",
            "bg-white shadow-2xl will-change-transform",
            "translate-x-full data-[state=open]:translate-x-0",
            "transition-transform duration-300 ease-out",
            "focus:outline-none",
            className,
          )}
        >
          <header className="flex items-center justify-between border-b border-brand-200 px-6 h-16 shrink-0">
            <Dialog.Title className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-900">
              Your bag ({totalQuantity})
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close cart"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-600 hover:text-brand-900 hover:bg-brand-100 transition-colors"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </header>

          <div className="flex-1 overflow-y-auto">
            {isEmpty ? (
              <EmptyState onClose={closeCart} />
            ) : (
              <ul className="px-6">
                {lines.map((line) => (
                  <CartLineItem
                    key={line.id}
                    line={line}
                    onNavigate={closeCart}
                  />
                ))}
              </ul>
            )}
          </div>

          {!isEmpty && cart && (
            <footer className="border-t border-brand-200 px-6 py-5 space-y-4 shrink-0">
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-600">Subtotal</span>
                <span className="font-medium text-brand-900 tabular-nums">
                  {formatPrice(
                    cart.cost.subtotalAmount.amount,
                    cart.cost.subtotalAmount.currencyCode,
                  )}
                </span>
              </div>

              <p className="text-xs text-brand-500 leading-relaxed">
                Shipping and taxes calculated at checkout.
              </p>

              <a
                href={cart.checkoutUrl}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Checkout
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </footer>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8 py-12 gap-5">
      <BagIllustration className="h-20 w-20 text-brand-300" />
      <div className="space-y-1.5">
        <h3 className="heading-display text-2xl text-brand-900">
          Your bag is empty
        </h3>
        <p className="text-sm text-brand-500 max-w-[28ch] mx-auto">
          Nothing in here yet. Start with a considered piece that speaks to you.
        </p>
      </div>
      <Link
        href="/products"
        onClick={onClose}
        className="btn-outline mt-2 inline-flex items-center gap-2"
      >
        Shop products
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function BagIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M14 22h36l-2.5 30a4 4 0 0 1-4 3.6H20.5a4 4 0 0 1-4-3.6L14 22Z" />
      <path d="M22 22v-4a10 10 0 0 1 20 0v4" />
      <path d="M24 32c2.5 3.5 13.5 3.5 16 0" opacity={0.5} />
    </svg>
  );
}

export default CartDrawer;
