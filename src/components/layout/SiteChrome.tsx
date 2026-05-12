"use client";

import type { ReactNode } from "react";
import { PageTransition } from "@/components/motion/PageTransition";
import { CartDrawer } from "@/components/cart";
import { CursorGlow } from "@/components/ui/CursorGlow";
import { PageLoadOverlay } from "@/components/ui/PageLoadOverlay";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <PageLoadOverlay />
      <CursorGlow />
      <Header />
      <PageTransition>
        <main id="main-content" className="flex flex-1 flex-col bg-transparent pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </main>
      </PageTransition>
      <Footer className="pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0" />
      <CartDrawer />
      <WhatsAppButton />
      <MobileBottomNav />
    </>
  );
}
