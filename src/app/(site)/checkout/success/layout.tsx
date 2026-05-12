import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata(
  "Order confirmed",
  "Thank you for your order. View your confirmation and delivery details.",
  "/checkout/success",
);

export default function CheckoutSuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
