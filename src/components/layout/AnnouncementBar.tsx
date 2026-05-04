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
  message = "⚡ Weekend Sale — Up to 50% off Smartwatches & Power Banks. Free Shipping on orders over $50.",
  className,
}: AnnouncementBarProps) {
  const mounted = useIsMounted();

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
    } catch {}
  };

  if (!mounted || dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Site announcement"
      className={cn(
        "relative w-full flex items-center justify-center px-10 py-2 min-h-8",
        "font-ui text-[11px] font-bold uppercase tracking-[0.18em]",
        className,
      )}
      style={{
        background: "linear-gradient(90deg, #E8850A 0%, #F5A623 40%, #FFD580 60%, #F5A623 80%, #E8850A 100%)",
        color: "#1a0d00",
      }}
    >
      <p className="text-center leading-none">{message}</p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors"
        style={{ color: "rgba(26,13,0,0.6)" }}
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

export default AnnouncementBar;
