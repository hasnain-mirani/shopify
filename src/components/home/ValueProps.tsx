import { Package, ShieldCheck, RotateCcw, Gift } from "lucide-react";

const ITEMS = [
  {
    Icon: Package,
    emoji: "🚀",
    title: "Free Shipping",
    sub: "On all orders over $50. Worldwide delivery.",
  },
  {
    Icon: ShieldCheck,
    emoji: "✓",
    title: "100% Authentic",
    sub: "Genuine brands — every product verified.",
  },
  {
    Icon: RotateCcw,
    emoji: "↩",
    title: "Easy Returns",
    sub: "30-day hassle-free return policy.",
  },
  {
    Icon: Gift,
    emoji: "⭐",
    title: "Loyalty Rewards",
    sub: "Earn points on every purchase.",
  },
] as const;

/**
 * Features strip — dark #1A0D00 background with gold borders and icons.
 * Sits between the hero/marquee and the products section.
 */
export function ValueProps() {
  return (
    <section
      aria-label="Why shop with us"
      className="w-full"
      style={{
        background: "#1A0D00",
        borderTop: "1px solid rgba(245,166,35,0.15)",
        borderBottom: "1px solid rgba(245,166,35,0.15)",
      }}
    >
      <div className="container-shop py-10 md:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px"
          style={{ background: "rgba(245,166,35,0.08)", borderRadius: "16px", overflow: "hidden" }}
        >
          {ITEMS.map(({ Icon, emoji, title, sub }) => (
            <div
              key={title}
              className="flex flex-col items-start gap-3 p-5 md:p-6 group transition-all duration-300"
              style={{ background: "#1A0D00" }}
            >
              {/* Icon square */}
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                style={{
                  background: "rgba(245,166,35,0.1)",
                  border: "1px solid rgba(245,166,35,0.2)",
                }}
              >
                <Icon
                  className="h-5 w-5 transition-colors"
                  style={{ color: "#F5A623" }}
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3
                  className="font-display font-bold text-lg leading-tight"
                  style={{ color: "#FFD580" }}
                >
                  {title}
                </h3>
                <p
                  className="font-sans text-sm mt-1 leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ValueProps;
