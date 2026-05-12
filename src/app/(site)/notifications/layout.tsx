import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata(
  "Notifications",
  "Store updates, promos, and announcements from SSHUB.",
  "/notifications",
);

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
