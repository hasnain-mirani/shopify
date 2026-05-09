"use client";

import type { ReactNode } from "react";
import { PageTransition } from "@/components/motion/PageTransition";
import { CartDrawer } from "@/components/cart";
import { CursorGlow } from "@/components/ui/CursorGlow";
import { PageLoadOverlay } from "@/components/ui/PageLoadOverlay";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <PageLoadOverlay />
      <CursorGlow />
      <Header />
      <PageTransition>
        <main className="flex flex-1 flex-col bg-transparent">{children}</main>
      </PageTransition>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </>
  );
}
