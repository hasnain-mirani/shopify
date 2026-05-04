"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TagStripProps {
  tags: string[];
  /** Currently-active tag from the URL, if any. */
  activeTag?: string;
}

/**
 * Horizontally-scrolling chip rail for the most common product tags.
 * Each chip toggles the `?tag=…` URL param, so the shop page filters
 * server-side via its existing `searchParams` wiring.
 *
 * The "All" chip clears any active tag. Active chips flip to the
 * accent-yellow pill, echoing the active-nav indicator in the header.
 */
export function TagStrip({ tags, activeTag }: TagStripProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const setTag = (next: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!next) params.delete("tag");
    else params.set("tag", next);
    startTransition(() => {
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    });
  };

  const allActive = !activeTag;

  return (
    <div
      role="region"
      aria-label="Filter by tag"
      data-pending={pending}
      className="relative data-[pending=true]:opacity-70 transition-opacity"
    >
      {/* Edge fades so long rails look like they continue off-canvas. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-brand-50 to-transparent z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-brand-50 to-transparent z-10"
      />

      <ul
        className="no-scrollbar flex items-center gap-2 overflow-x-auto scroll-px-4 px-1 py-1 -mx-1"
      >
        <li>
          <Chip active={allActive} onClick={() => setTag(null)}>
            All
          </Chip>
        </li>
        {tags.map((tag) => {
          const active = activeTag?.toLowerCase() === tag.toLowerCase();
          return (
            <li key={tag}>
              <Chip active={active} onClick={() => setTag(active ? null : tag)}>
                {tag}
                {active && (
                  <X
                    aria-hidden="true"
                    className="h-3 w-3 ml-1 -mr-0.5 opacity-80"
                    strokeWidth={2.5}
                  />
                )}
              </Chip>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5",
        "font-ui text-[12px] font-medium uppercase tracking-[0.14em]",
        "transition-all duration-200 outline-none",
        "focus-visible:ring-2 focus-visible:ring-brand-900",
        active
          ? "bg-accent text-brand-900 shadow-[0_4px_14px_rgba(245,164,124,0.5)] border border-[color-mix(in_oklab,var(--accent)_40%,black)]/10"
          : "bg-white/70 text-brand-700 border border-brand-200/70 hover:text-brand-900 hover:border-brand-900/40 hover:-translate-y-0.5",
      )}
    >
      {children}
    </button>
  );
}

export default TagStrip;
