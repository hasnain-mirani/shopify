/**
 * Infinite-scrolling keyword strip. Pure CSS — no JS, no framer-motion —
 * so it's cheap to hydrate and renders from the server. The track holds
 * the list twice back-to-back and animates `translateX(-50%)` which
 * makes the loop seamless.
 *
 * Inspired by the Photovoltaic Goldstein reference's "band of values"
 * that sits between the hero and the product sections.
 */

const DEFAULT_ITEMS = [
  "Considered goods",
  "Made to last",
  "Small-batch",
  "Honest materials",
  "Ships worldwide",
  "Wear-in guarantee",
  "Crafted slowly",
];

export interface MarqueeBandProps {
  items?: string[];
  /** "dark" puts the band on deep forest green with yellow dots (default).
   *  "light" flips to off-white with green text. */
  tone?: "dark" | "light";
}

export function MarqueeBand({ items = DEFAULT_ITEMS, tone = "dark" }: MarqueeBandProps) {
  const isDark = tone === "dark";

  // Duplicate the list once so the translateX(-50%) loop is continuous.
  const track = [...items, ...items];

  return (
    <section
      aria-label="Brand values"
      className={
        isDark
          ? "relative w-full overflow-hidden bg-brand-900 text-white py-5 md:py-6"
          : "relative w-full overflow-hidden bg-surface-alt text-brand-900 py-5 md:py-6 border-y border-brand-200"
      }
    >
      {/* edge fades */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 z-10"
        style={{
          background: isDark
            ? "linear-gradient(to right, #0d2b14, transparent)"
            : "linear-gradient(to right, #edeee9, transparent)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 z-10"
        style={{
          background: isDark
            ? "linear-gradient(to left, #0d2b14, transparent)"
            : "linear-gradient(to left, #edeee9, transparent)",
        }}
      />

      <div
        className="flex w-max items-center gap-10 md:gap-16 marquee-track"
        style={{
          animation: "marqueeX 28s linear infinite",
        }}
      >
        {track.map((item, i) => (
          <div
            key={`${item}-${i}`}
            className="flex items-center gap-10 md:gap-16 shrink-0"
          >
            <span className="font-display text-2xl md:text-4xl tracking-tight whitespace-nowrap">
              {item}
            </span>
            <span
              aria-hidden="true"
              className="h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-accent shrink-0"
            />
          </div>
        ))}
      </div>

      {/* Local keyframes — scoped via a <style> tag so the component
          is self-contained without touching globals.css further. */}
      <style>{`
        @keyframes marqueeX {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none !important; }
        }
      `}</style>
    </section>
  );
}

export default MarqueeBand;
