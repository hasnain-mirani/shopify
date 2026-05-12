import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata(
  "Compare products",
  "Compare up to four products side by side — specs, price, and availability at SSHUB.",
  "/compare",
);

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
