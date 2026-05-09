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
      className="w-full bg-brand-900 border-t border-b border-accent/15"
    >
      <div className="container-shop py-10 md:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-accent/8 rounded-2xl overflow-hidden"
        >
          {ITEMS.map(({ Icon, emoji, title, sub }) => (
            <div
              key={title}
              className="flex flex-col items-start gap-3 p-5 md:p-6 group transition-all duration-300 bg-brand-900"
            >
              {/* Icon square */}
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 bg-accent/10 border border-accent/20"
              >
                <Icon
                  className="h-5 w-5 transition-colors text-accent"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3
                  className="font-display font-bold text-lg leading-tight text-brand-200"
                >
                  {title}
                </h3>
                <p
                  className="font-sans text-sm mt-1 leading-relaxed text-white/50"
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
