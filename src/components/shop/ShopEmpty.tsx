import Link from "next/link";
import { Compass, PackageOpen } from "lucide-react";

export interface ShopEmptyProps {
  /** Currently-active tag, if any — shown in the copy and offered as a clear action. */
  tag?: string;
}

/**
 * Empty state for the shop. Not just "nothing to show" — it offers a
 * way out (clear the filter, browse collections) so the user never
 * hits a dead end.
 */
export function ShopEmpty({ tag }: ShopEmptyProps) {
  return (
    <section className="container-shop py-16 md:py-24">
      <div className="relative overflow-hidden rounded-[32px] bg-brand-900 text-white px-6 md:px-14 py-14 md:py-20 isolate">
        {/* Decorative sun pool */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(500px 300px at 85% 20%, rgba(245,164,124,0.22), transparent 60%), " +
              "radial-gradient(400px 260px at 10% 90%, rgba(242,138,173,0.2), transparent 60%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="flex flex-col items-center text-center max-w-xl mx-auto">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-brand-900 mb-6">
            <PackageOpen className="h-6 w-6" aria-hidden="true" />
          </span>

          <span className="font-ui text-[11px] uppercase tracking-[0.28em] text-white/60 mb-3">
            The shop
          </span>
          <h2 className="heading-display text-[clamp(2rem,4.5vw,3.25rem)] text-white leading-[0.95]">
            Nothing{" "}
            <em className="italic text-accent">
              {tag ? `tagged "${tag}"` : "here"}
            </em>{" "}
            yet.
          </h2>
          <p className="font-sans text-white/70 text-base mt-4 max-w-md leading-relaxed">
            {tag
              ? "That filter is empty for now. Try a different tag, clear the filter, or explore by collection — new pieces drop weekly."
              : "Our catalog is restocking. Explore by collection or subscribe to the journal to hear the moment a new piece goes live."}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {tag && (
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-accent text-brand-900 pl-4 pr-3 py-2.5 font-ui text-[12px] font-semibold uppercase tracking-[0.18em] hover:-translate-y-0.5 transition-transform shadow-[0_8px_20px_rgba(245,164,124,0.4)]"
              >
                Clear filter
                <span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-900 text-accent text-[10px]">
                  ×
                </span>
              </Link>
            )}
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 text-white pl-4 pr-3 py-2.5 font-ui text-[12px] font-semibold uppercase tracking-[0.18em] border border-white/15 transition-colors"
            >
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              Browse collections
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShopEmpty;
