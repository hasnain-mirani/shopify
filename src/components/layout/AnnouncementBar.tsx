"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMounted } from "@/hooks/useIsMounted";

const STORAGE_KEY = "announcement:dismissed";

export interface AnnouncementBarProps {
  message?: React.ReactNode;
  className?: string;
}

/**
 * Slim announcement bar that persists its dismissed state in sessionStorage,
 * so it stays hidden while the user navigates the site but returns on a fresh
 * visit/tab.
 *
 * Hydration-safe: on the server and the very first client paint, we render
 * nothing. The dismissed flag is read lazily once mounted.
 */
export function AnnouncementBar({
  message = "Free shipping on orders over $100 — enjoy complimentary returns within 30 days.",
  className,
}: AnnouncementBarProps) {
  const mounted = useIsMounted();

  // We initialize eagerly on the client — safe because we only render
  // after `mounted === true`. On the server this function isn't called
  // (useState initializers run on the client for a client component only
  // when it actually renders; still, `mounted === false` guards it).
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      return window.sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const dismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* sessionStorage unavailable (private mode) — soft fail */
    }
  };

  if (!mounted || dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Site announcement"
      className={cn(
        "relative w-full bg-brand-900 text-white",
        "flex items-center justify-center",
        "px-10 py-1.5 min-h-8",
        "font-ui text-[11px] font-medium uppercase tracking-[0.2em]",
        className,
      )}
    >
      <p className="text-center leading-none">{message}</p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

export default AnnouncementBar;
