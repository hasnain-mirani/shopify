import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart/CartPageClient";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata(
  "Cart",
  "Review your bag and continue to secure checkout.",
  "/cart",
);

export default function CartPage() {
  return <CartPageClient />;
}
