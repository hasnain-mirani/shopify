import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getHeroConfig } from "@/lib/hero-config";
import { getProducts } from "@/lib/shopify";
import { HeroParallax } from "./HeroClient";
import { CategoryMenu } from "./CategoryMenu";

/**
 * Dark amber/gold luxury hero — full viewport height.
 *
 * Visual layers (back → front):
 *   1. #1A0D00 base background
 *   2. Radial amber glow (top-right)
 *   3. 40 floating gold CSS particles
 *   4. 3 expanding smoke/ring circles
 *   5. Left: hero text content with Playfair Display headings
 *   6. Right: product cluster scene (real Shopify product images)
 *      — admin-configurable via Landing Products panel
 *   7. Top-right of scene: "Up to 50% OFF" badge
 *
 * All copy comes from getHeroConfig() (admin-editable).
 * Products come from Landing Products admin config (fallback: top 5 products).
 */
export async function Hero() {
  const { getLandingProducts } = await import("@/lib/landing-products");
  const { getProductByHandle } = await import("@/lib/shopify");

  const [config, defaultProducts, landingConfig] = await Promise.all([
    getHeroConfig(),
    getProducts({ limit: 5 }).catch(() => []),
    getLandingProducts().catch(() => null),
  ]);

  // Use admin-pinned products if configured, otherwise fall back to defaults
  let heroProducts = defaultProducts.filter((p) => !!p.featuredImage).slice(0, 5);
  if (landingConfig && landingConfig.productHandles.length > 0) {
    const pinned = await Promise.all(
      landingConfig.productHandles.slice(0, 5).map((h) =>
        getProductByHandle(h).catch(() => null)
      )
    );
    const resolved = pinned.filter((p) => p && p.featuredImage) as typeof defaultProducts;
    if (resolved.length > 0) heroProducts = resolved;
  }

  return (
    <section
      className="relative overflow-hidden isolate"
      style={{ minHeight: "100vh", background: "#1A0D00" }}
    >
      {/* ── Layer 1: Radial amber glow (top-right) ─────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(900px 700px at 85% 10%, rgba(245,166,35,0.18) 0%, transparent 60%), " +
            "radial-gradient(600px 500px at 10% 80%, rgba(232,133,10,0.12) 0%, transparent 60%)",
        }}
      />

      {/* ── Layer 2: 40 floating gold particles (CSS only) ─────────── */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="hero-particle"
            style={{
              left:   `${p.left}%`,
              bottom: `-${p.size * 2}px`,
              width:  `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDuration:  `${p.duration}s`,
              animationDelay:     `${p.delay}s`,
              filter: p.size > 4 ? "blur(0.5px)" : "none",
            }}
          />
        ))}
      </div>

      {/* ── Layer 3: 3 expanding smoke rings ───────────────────────── */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {RINGS.map((r, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width:  r.size,
              height: r.size,
              top:    r.top,
              left:   r.left,
              border: `1px solid rgba(245,166,35,${r.opacity})`,
              animation: `expand-ring ${r.duration}s ease-out ${r.delay}s infinite`,
              transformOrigin: "center",
            }}
          />
        ))}
      </div>

      {/* ── Category strip — sits just below the navbar ─────────────── */}
      <div
        className="relative z-20 w-full"
        style={{
          borderBottom: "1px solid rgba(245,166,35,0.1)",
          background: "rgba(26,13,0,0.55)",
          backdropFilter: "blur(12px)",
        }}
      >
        <CategoryMenu />
      </div>

      {/* ── Main content grid ──────────────────────────────────────── */}
      <div className="container-shop relative grid min-h-screen grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-16 pt-24 pb-16 md:pt-28 md:pb-20">

        {/* ═══ LEFT: Hero text ═══ */}
        <div
          className="flex flex-col gap-6 max-w-2xl relative z-10"
          style={{ animation: "fadeSlideUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}
        >
          {/* Eyebrow */}
          <span
            className="inline-flex items-center gap-2 self-start font-ui text-[11px] uppercase tracking-[0.28em]"
            style={{
              color: "#F5A623",
              animation: "fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s both",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-75"
                style={{ background: "#F5A623" }}
              />
              <span
                className="relative rounded-full h-2 w-2"
                style={{ background: "#F5A623" }}
              />
            </span>
            {config.eyebrow || "Premium Tech Accessories · This Weekend Sale"}
          </span>

          {/* Main heading */}
          <div style={{ animation: "fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
            <h1
              className="heading-display"
              style={{ fontSize: "clamp(3.5rem, 8vw, 6.5rem)", color: "white", lineHeight: "0.92" }}
            >
              <span
                style={{
                  fontStyle: "italic",
                  fontSize: "0.55em",
                  color: "#F5A623",
                  display: "block",
                  marginBottom: "0.1em",
                  fontWeight: 400,
                }}
              >
                Super
              </span>
              {config.headlinePrefix || "MOBILE"}{" "}
              <span
                className="heading-display block"
                style={{
                  fontSize: "1em",
                  background: "linear-gradient(120deg, #FFD580 0%, #F5A623 35%, #FFD580 50%, #E8850A 70%, #FFD580 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shine 3s linear infinite",
                }}
              >
                {config.headlineEm || "ACCESSORIES"}
              </span>
              <span style={{ fontSize: "0.65em", display: "block", color: "rgba(255,255,255,0.85)" }}>
                {config.headlineSuffix || "& SMART TECH"}
              </span>
            </h1>

            {/* "This weekend only" italic sub-line */}
            <p
              className="font-display"
              style={{
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
                color: "rgba(255,255,255,0.6)",
                marginTop: "0.75rem",
                letterSpacing: "0.01em",
              }}
            >
              This weekend only — up to 50% off
            </p>
          </div>

          {/* Sub-copy */}
          <p
            className="font-sans"
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: "clamp(1rem, 1.8vw, 1.15rem)",
              lineHeight: 1.7,
              maxWidth: "480px",
              animation: "fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both",
            }}
          >
            {config.subcopy || "Phone cases, smartwatches, power banks & wireless chargers — authentic products, lightning delivery."}
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap gap-3 pt-2"
            style={{ animation: "fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.45s both" }}
          >
            <Link href={config.primaryCtaHref || "/shop"} className="btn-primary group">
              {config.primaryCtaLabel || "Shop the Sale"}
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <Link href={config.secondaryCtaHref || "/collections"} className="btn-outline">
              {config.secondaryCtaLabel || "Browse Collections"}
            </Link>
          </div>

          {/* Trust pills */}
          <div
            className="flex flex-wrap items-center gap-3 pt-2"
            style={{ animation: "fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.6s both" }}
          >
            {TRUST_PILLS.map((pill) => (
              <div
                key={pill.label}
                className="flex items-center gap-2 rounded-full px-3.5 py-2"
                style={{
                  background: "rgba(245,166,35,0.08)",
                  border: "1px solid rgba(245,166,35,0.18)",
                }}
              >
                <span className="text-sm">{pill.icon}</span>
                <div className="leading-none">
                  <div className="font-ui text-[11px] font-semibold" style={{ color: "#FFD580" }}>
                    {pill.label}
                  </div>
                  {pill.sub && (
                    <div className="font-ui text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {pill.sub}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ RIGHT: Product cluster scene ═══
            Layout (bottom-baseline aligned, like a product shoot):

                        [P0 — MAIN, tallest, center]
                [P1]                        [P2]     ← medium, flanking
              [P3]                              [P4]  ← smallest, front corners

            50% OFF badge sits top-right of the entire scene container.
        */}
        <HeroParallax
          intensity={12}
          className="relative hidden lg:flex items-center justify-center"
          style={{
            height: "580px",
            animation: "fadeSlideLeft 1s cubic-bezier(0.16,1,0.3,1) 0.4s both",
          }}
        >
          {/* Elliptical warm glow below the product cluster */}
          <div
            aria-hidden="true"
            className="absolute pointer-events-none"
            style={{
              width: "460px",
              height: "200px",
              bottom: "8%",
              left: "50%",
              transform: "translateX(-50%)",
              background: "radial-gradient(ellipse, rgba(245,166,35,0.22) 0%, transparent 72%)",
              filter: "blur(28px)",
            }}
          />

          {/* ── 50% OFF badge — top-right corner of the scene ── */}
          <div
            className="absolute z-40"
            style={{
              top: "5%",
              right: "5%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              animation: "float-gentle 4s ease-in-out infinite",
            }}
          >
            {/* Pulse halo */}
            <div
              style={{
                position: "absolute",
                width: "92px",
                height: "92px",
                borderRadius: "50%",
                background: "rgba(245,166,35,0.15)",
                animation: "pulse-dot 2.6s ease-in-out infinite",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -62%)",
              }}
            />
            {/* Gold circle */}
            <div
              style={{
                width: "78px",
                height: "78px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FFD580 0%, #F5A623 50%, #E8850A 100%)",
                boxShadow: "0 8px 28px rgba(245,166,35,0.55), 0 2px 8px rgba(0,0,0,0.4)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1px",
              }}
            >
              <span style={{ fontFamily: "var(--font-outfit)", fontSize: "8px", fontWeight: 700, color: "rgba(26,13,0,0.6)", letterSpacing: "0.14em", textTransform: "uppercase", lineHeight: 1 }}>
                UP TO
              </span>
              <span style={{ fontFamily: "var(--font-playfair)", fontSize: "23px", fontWeight: 900, color: "#1a0d00", lineHeight: 1 }}>
                50%
              </span>
              <span style={{ fontFamily: "var(--font-outfit)", fontSize: "8px", fontWeight: 700, color: "rgba(26,13,0,0.6)", letterSpacing: "0.14em", textTransform: "uppercase", lineHeight: 1 }}>
                OFF
              </span>
            </div>
            {/* Label pill */}
            <div
              style={{
                marginTop: "7px",
                background: "rgba(245,166,35,0.1)",
                border: "1px solid rgba(245,166,35,0.4)",
                borderRadius: "10px",
                padding: "3px 9px",
                fontFamily: "var(--font-outfit)",
                fontSize: "8px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "#FFD580",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              ⚡ Weekend
            </div>
          </div>

          {/* ── Product cluster (bottom-baseline aligned flex row) ── */}
          <div
            className="absolute"
            style={{
              bottom: "9%",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "flex-end",
              gap: "8px",
            }}
          >
            {/* P3 — front far-left (smallest) */}
            {heroProducts[3] && (
              <div style={{ animation: "float-gentle 4.5s ease-in-out 1.3s infinite" }}>
                <ProductCard product={heroProducts[3]} width={86} height={106} borderRadius="14px" />
              </div>
            )}

            {/* P1 — mid-left */}
            {heroProducts[1] && (
              <div style={{ animation: "float-gentle 4s ease-in-out 0.7s infinite" }}>
                <ProductCard product={heroProducts[1]} width={118} height={158} borderRadius="18px" />
              </div>
            )}

            {/* P0 — MAIN (tallest, center) */}
            <div style={{ animation: "float-gentle 3.5s ease-in-out infinite", zIndex: 10 }}>
              <ProductCard product={heroProducts[0]} width={150} height={210} borderRadius="22px" glow />
            </div>

            {/* P2 — mid-right */}
            {heroProducts[2] && (
              <div style={{ animation: "float-gentle 3.8s ease-in-out 0.4s infinite" }}>
                <ProductCard product={heroProducts[2]} width={118} height={158} borderRadius="18px" />
              </div>
            )}

            {/* P4 — front far-right (smallest) */}
            {heroProducts[4] && (
              <div style={{ animation: "float-gentle 3.6s ease-in-out 0.9s infinite" }}>
                <ProductCard product={heroProducts[4]} width={86} height={106} borderRadius="14px" />
              </div>
            )}
          </div>

          {/* Floating "48k+ orders shipped" social proof pill */}
          <div
            className="absolute bottom-2 left-2 glass-pill rounded-2xl px-4 py-3 flex items-center gap-3 z-30"
            style={{ maxWidth: "190px", animation: "fadeSlideUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.8s both" }}
          >
            <div className="flex -space-x-2">
              {["#F5A623", "#E8850A", "#FFD580"].map((clr, i) => (
                <span
                  key={i}
                  className="h-7 w-7 rounded-full flex items-center justify-center font-ui text-[10px] font-bold text-brand-900"
                  style={{ background: clr, outline: "2px solid #1a0d00" }}
                >
                  {["A", "M", "K"][i]}
                </span>
              ))}
            </div>
            <div className="leading-none">
              <div className="font-display text-base" style={{ color: "#FFD580" }}>48k+</div>
              <div className="font-ui text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>orders shipped</div>
            </div>
          </div>
        </HeroParallax>
      </div>

      {/* Scroll indicator */}
      <div
        className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2"
        style={{
          color: "rgba(255,255,255,0.35)",
          animation: "fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 1s both",
        }}
      >
        <span className="font-ui text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <span
          className="h-10 w-[1px]"
          style={{ background: "linear-gradient(to bottom, rgba(245,166,35,0.4), transparent)" }}
        />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Static data                                                                 */
/* -------------------------------------------------------------------------- */

/** 40 particle configs, generated deterministically (no Math.random at render) */
const PARTICLES = Array.from({ length: 40 }, (_, i) => {
  const seed = (i * 2654435761) >>> 0;
  const rand = (n: number) => ((seed * (i + 1) * 1103515245 + 12345) >>> 0) % n;
  return {
    left:     (((seed % 97) + 3)),
    size:     2 + (rand(5)),
    opacity:  0.3 + (rand(5)) * 0.1,
    duration: 8 + (rand(12)),
    delay:    -(rand(20)),
  };
});

const RINGS = [
  { size: "200px", top: "15%", left: "70%", opacity: 0.2, duration: 4, delay: 0 },
  { size: "300px", top: "20%", left: "65%", opacity: 0.12, duration: 4, delay: 1.3 },
  { size: "140px", top: "25%", left: "78%", opacity: 0.25, duration: 4, delay: 2.6 },
];

const TRUST_PILLS = [
  { icon: "⚡", label: "Fast Delivery",    sub: "2–4 days" },
  { icon: "✓",  label: "100% Authentic",   sub: "Verified" },
  { icon: "↩",  label: "Easy Returns",     sub: "30 days" },
];

/* -------------------------------------------------------------------------- */
/* ProductCard — real Shopify product image in a glassy floating frame        */
/* -------------------------------------------------------------------------- */

interface ProductCardProps {
  product: { title: string; featuredImage?: { url: string; altText?: string | null } | null } | undefined;
  width: number;
  height: number;
  borderRadius: string;
  glow?: boolean;
}

function ProductCard({ product, width, height, borderRadius, glow }: ProductCardProps) {
  const imgUrl  = product?.featuredImage?.url;
  const altText = product?.featuredImage?.altText ?? product?.title ?? "Product";

  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        overflow: "hidden",
        border: `1.5px solid rgba(245,166,35,${glow ? 0.45 : 0.2})`,
        boxShadow: glow
          ? "0 18px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(245,166,35,0.08), 0 0 40px rgba(245,166,35,0.2)"
          : "0 10px 36px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,166,35,0.07)",
        background: "rgba(42,21,0,0.75)",
        backdropFilter: "blur(10px)",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {imgUrl ? (
        <Image
          src={imgUrl}
          alt={altText}
          fill
          sizes={`${width}px`}
          className="object-cover"
          style={{ objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(145deg, rgba(245,166,35,0.08), rgba(232,133,10,0.04))",
          }}
        >
          <span style={{ fontSize: "28px", opacity: 0.4 }}>📦</span>
        </div>
      )}
      {/* Subtle gold shimmer overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(160deg, rgba(245,166,35,0.07) 0%, transparent 50%, rgba(232,133,10,0.04) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default Hero;
