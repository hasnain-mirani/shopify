/**
 * MarqueeBand — infinite scrolling gold/amber ticker.
 *
 * Full-width gold gradient background with dark text.
 * Diamond ◆ separators between items.
 * Pure CSS animation — no JS, fully SSR-safe.
 */

const DEFAULT_ITEMS = [
  "Free Shipping Over $50",
  "Up to 50% Off",
  "This Weekend Only",
  "Authentic Products",
  "Loyalty Rewards",
  "Smartwatches & Power Banks",
  "Fast 2–4 Day Delivery",
];

export interface MarqueeBandProps {
  items?: string[];
  /** "gold" (default) = gold gradient bg. "dark" / "light" = dark amber bg. */
  tone?: "gold" | "dark" | "light";
}

export function MarqueeBand({ items = DEFAULT_ITEMS, tone = "gold" }: MarqueeBandProps) {
  const isGold = tone === "gold"; // dark and light both render as dark amber
  const track = [...items, ...items]; // duplicate for seamless loop

  // Both tones now use vibrant gold/amber gradient — top marquee scrolls right, bottom scrolls left
  const bgStyle = {
    background: isGold
      ? "linear-gradient(90deg, #F5A623 0%, #E8850A 30%, #FFD580 60%, #E8850A 80%, #F5A623 100%)"
      : "linear-gradient(90deg, #E8850A 0%, #F5A623 35%, #FFD580 55%, #F5A623 75%, #E8850A 100%)",
  };

  const textColor = "#1a0d00";
  const dotColor  = "rgba(26,13,0,0.35)";

  return (
    <section
      aria-label="Sale announcements"
      className="relative w-full overflow-hidden py-3.5 md:py-4"
      style={bgStyle}
    >
      {/* Left edge fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 z-10"
        style={{
          background: isGold
            ? "linear-gradient(to right, #F5A623, transparent)"
            : "linear-gradient(to right, #E8850A, transparent)",
        }}
      />
      {/* Right edge fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 z-10"
        style={{
          background: isGold
            ? "linear-gradient(to left, #E8850A, transparent)"
            : "linear-gradient(to left, #F5A623, transparent)",
        }}
      />

      {/* Scrolling track — bottom marquee scrolls in reverse direction */}
      <div
        className="flex w-max items-center gap-8 md:gap-12 marquee-track"
        style={{ animation: `marqueeX ${isGold ? "30s" : "25s"} linear ${isGold ? "normal" : "reverse"} infinite` }}
      >
        {track.map((item, i) => (
          <div
            key={`${item}-${i}`}
            className="flex items-center gap-8 md:gap-12 shrink-0"
          >
            <span
              className="font-ui font-bold whitespace-nowrap uppercase tracking-[0.1em]"
              style={{ color: textColor, fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)" }}
            >
              {item}
            </span>
            <span
              aria-hidden="true"
              className="font-bold text-xs"
              style={{ color: dotColor }}
            >
              ◆
            </span>
          </div>
        ))}
      </div>

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
