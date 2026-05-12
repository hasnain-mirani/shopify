import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata(
  "Wishlist",
  "Saved products you love — sign in optional, synced on this device.",
  "/wishlist",
);

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
