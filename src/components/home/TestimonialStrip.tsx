import React from "react";
import { Quote, Star } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  tone: "green" | "yellow" | "orange";
  initials: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The phone case quality is insane. Dropped it twice and not a scratch. Packaging came so nicely — feels like a luxury unboxing experience.",
    author: "Ayesha Khan",
    role: "Content Creator · Karachi",
    tone: "green",
    initials: "AK",
  },
  {
    quote:
      "Ordered a smartwatch and power bank bundle. Both arrived in 3 days with free shipping. The watch looks even better in person than the photos!",
    author: "Priya Sharma",
    role: "Tech Enthusiast · Lahore",
    tone: "yellow",
    initials: "PS",
  },
  {
    quote:
      "100% authentic products, amazing prices, and their customer service actually helped me pick the right charger for my setup. Will definitely order again.",
    author: "Usman Ali",
    role: "Software Engineer · Islamabad",
    tone: "orange",
    initials: "UA",
  },
];

const TONE_GRADIENT: Record<Testimonial["tone"], string> = {
  green:  "text-white",
  yellow: "text-brand-900",
  orange: "text-white",
};

const TONE_BG: Record<Testimonial["tone"], React.CSSProperties> = {
  green:  { background: "linear-gradient(145deg, #2a1500, #1a0d00)", border: "1px solid rgba(245,166,35,0.25)" },
  yellow: { background: "linear-gradient(135deg, #F5A623, #E8850A)",  border: "none" },
  orange: { background: "linear-gradient(145deg, #3d1f00, #2a1500)", border: "1px solid rgba(245,166,35,0.3)" },
};

const TONE_AVATAR: Record<Testimonial["tone"], React.CSSProperties> = {
  green:  { background: "linear-gradient(135deg, #F5A623, #E8850A)", color: "#1a0d00" },
  yellow: { background: "rgba(26,13,0,0.25)", color: "#1a0d00" },
  orange: { background: "linear-gradient(135deg, #F5A623, #E8850A)", color: "#1a0d00" },
};

const TONE_QUOTE_COLOR: Record<Testimonial["tone"], string> = {
  green:  "rgba(245,166,35,0.15)",
  yellow: "rgba(26,13,0,0.15)",
  orange: "rgba(245,166,35,0.15)",
};

/**
 * Three-up testimonial strip — each card gets its own tonal treatment
 * so the row reads like a magazine collage rather than a repeating
 * block. Server-rendered, zero JS.
 */
export function TestimonialStrip() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="container-shop py-20 md:py-28"
    >
      <div className="flex items-end justify-between gap-6 mb-10 md:mb-14">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[1px] w-10" style={{ background: "rgba(245,166,35,0.5)" }} />
            <span className="font-ui text-[11px] uppercase tracking-[0.3em]" style={{ color: "rgba(245,166,35,0.7)" }}>
              Loved by 48k+
            </span>
          </div>
          <h2
            id="testimonials-heading"
            className="heading-display text-4xl md:text-5xl lg:text-6xl"
            style={{ color: "white" }}
          >
            What they&rsquo;re{" "}
            <span
              style={{
                background: "linear-gradient(120deg, #FFD580, #F5A623, #E8850A)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontStyle: "italic",
              }}
            >saying</span>.
          </h2>
        </div>

        <div className="hidden md:flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4" style={{ fill: "#F5A623", color: "#F5A623" }} aria-hidden="true" />
            ))}
          </div>
          <div className="font-ui text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            <strong style={{ color: "#FFD580" }}>4.9 / 5</strong> · 12,000+ verified reviews
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {TESTIMONIALS.map((t, i) => (
          <article
            key={t.author}
            className={`relative overflow-hidden rounded-[28px] p-7 md:p-8 flex flex-col gap-6 min-h-[320px] transition-transform duration-500 hover:-translate-y-1 ${TONE_GRADIENT[t.tone]}`}
            style={{
              ...TONE_BG[t.tone],
              marginTop: i === 1 ? "1.5rem" : undefined,
            }}
          >
            {/* Big decorative quote glyph */}
            <Quote
              aria-hidden="true"
              className="absolute -top-3 -right-3 h-28 w-28 rotate-12"
              strokeWidth={1}
              style={{ color: TONE_QUOTE_COLOR[t.tone] }}
            />

            {/* Index badge */}
            <span
              className="font-ui text-[10px] uppercase tracking-[0.25em]"
              style={{ color: t.tone === "yellow" ? "rgba(26,13,0,0.5)" : "rgba(255,255,255,0.45)" }}
            >
              {String(i + 1).padStart(2, "0")} / {TESTIMONIALS.length.toString().padStart(2, "0")}
            </span>

            {/* Quote */}
            <blockquote
              className="relative font-display text-xl md:text-[1.4rem] leading-snug tracking-tight flex-1"
              style={{ color: t.tone === "yellow" ? "#1a0d00" : "white" }}
            >
              &ldquo;{t.quote}&rdquo;
            </blockquote>

            {/* Stars */}
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                  style={t.tone === "yellow" ? { fill: "#1a0d00", color: "#1a0d00" } : { fill: "#F5A623", color: "#F5A623" }}
                />
              ))}
            </div>

            {/* Author */}
            <footer className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full font-ui text-xs font-bold"
                style={TONE_AVATAR[t.tone]}
              >
                {t.initials}
              </span>
              <div className="leading-tight">
                <div
                  className="font-ui text-sm font-semibold"
                  style={{ color: t.tone === "yellow" ? "#1a0d00" : "white" }}
                >
                  {t.author}
                </div>
                <div
                  className="font-ui text-xs"
                  style={{ color: t.tone === "yellow" ? "rgba(26,13,0,0.55)" : "rgba(255,255,255,0.55)" }}
                >
                  {t.role}
                </div>
              </div>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}

export default TestimonialStrip;
