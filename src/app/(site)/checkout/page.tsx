import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata(
  "Checkout",
  "Complete your order with secure delivery and cash on delivery across Pakistan.",
  "/checkout",
);

export default function CheckoutPage() {
  return <CheckoutClient />;
}
