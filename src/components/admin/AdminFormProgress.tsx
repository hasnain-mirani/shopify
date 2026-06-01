"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  active: boolean;
  label: string;
  className?: string;
};

/** Top progress bar + optional banner for long-running admin form actions */
export function AdminFormProgress({ active, label, className }: Props) {
  if (!active) return null;

  return (
    <>
      <div
        className="fixed inset-x-0 top-0 z-[200] h-1 overflow-hidden bg-amber-500/20"
        role="progressbar"
        aria-valuetext={label}
        aria-busy="true"
      >
        <div className="admin-progress-indeterminate h-full w-1/3 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
      </div>
      <div
        className={cn(
          "fixed left-1/2 top-16 z-[200] flex -translate-x-1/2 items-center gap-2 rounded-full border border-amber-300/40 bg-white/95 px-4 py-2 text-sm font-medium text-amber-950 shadow-lg backdrop-blur-md dark:border-amber-500/30 dark:bg-zinc-900/95 dark:text-amber-100",
          className,
        )}
      >
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-amber-600" aria-hidden />
        {label}
      </div>
    </>
  );
}
