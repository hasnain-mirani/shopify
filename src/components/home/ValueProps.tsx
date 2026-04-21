import { Leaf, Package, RotateCcw, ShieldCheck } from "lucide-react";

const ITEMS = [
  {
    Icon: Package,
    title: "Free shipping",
    sub: "Over $100 — worldwide carbon-neutral.",
  },
  {
    Icon: RotateCcw,
    title: "30-day returns",
    sub: "No questions asked, even after a wear.",
  },
  {
    Icon: ShieldCheck,
    title: "Quality guarantee",
    sub: "Repairs & replacements for life of the piece.",
  },
  {
    Icon: Leaf,
    title: "Made slowly",
    sub: "Small-batch runs, traceable supply.",
  },
] as const;

/**
 * 4-up trust strip. Sits between the hero marquee and the "Shop by edit"
 * collections so visitors immediately see the brand's promises.
 */
export function ValueProps() {
  return (
    <section
      aria-label="Why shop with us"
      className="container-shop py-12 md:py-16"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {ITEMS.map(({ Icon, title, sub }) => (
          <div
            key={title}
            className="surface-card p-5 md:p-6 flex flex-col gap-3 card-hover"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/20 text-brand-800">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-display text-xl text-brand-900 leading-tight">
                {title}
              </h3>
              <p className="font-sans text-sm text-brand-600 mt-1.5 leading-relaxed">
                {sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ValueProps;
