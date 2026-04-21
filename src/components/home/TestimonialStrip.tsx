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
      "The quality is obvious the moment you hold it. I've had the overshirt for two years and it only gets better.",
    author: "Alex Moreno",
    role: "Architect · Lisbon",
    tone: "green",
    initials: "AM",
  },
  {
    quote:
      "This is the rare shop where I trust every piece I click. Beautifully made, beautifully packaged, no surprises.",
    author: "Priya Sharma",
    role: "Writer · Brooklyn",
    tone: "yellow",
    initials: "PS",
  },
  {
    quote:
      "I usually don't write reviews. But these are the first jeans I've worn daily for a year without thinking about replacing them.",
    author: "Kenji Watanabe",
    role: "Photographer · Kyoto",
    tone: "orange",
    initials: "KW",
  },
];

const TONE_GRADIENT: Record<Testimonial["tone"], string> = {
  green: "bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 text-white",
  yellow:
    "bg-gradient-to-br from-accent via-accent to-accent-dark text-brand-900",
  orange:
    "bg-gradient-to-br from-[color:var(--color-accent-orange)] via-[color:var(--color-accent-orange)] to-brand-700 text-white",
};

const TONE_AVATAR: Record<Testimonial["tone"], string> = {
  green: "bg-accent text-brand-900",
  yellow: "bg-brand-900 text-accent",
  orange: "bg-brand-900 text-white",
};

const TONE_QUOTE_COLOR: Record<Testimonial["tone"], string> = {
  green: "text-accent",
  yellow: "text-brand-900/40",
  orange: "text-white/50",
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
            <span className="h-[1px] w-10 bg-brand-700" />
            <span className="font-ui text-[11px] uppercase tracking-[0.3em] text-brand-700">
              Loved by 10k+
            </span>
          </div>
          <h2
            id="testimonials-heading"
            className="heading-display text-4xl md:text-5xl lg:text-6xl text-brand-900"
          >
            What they're{" "}
            <em className="italic text-brand-700">saying</em>.
          </h2>
        </div>

        {/* Right-side rating summary */}
        <div className="hidden md:flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-accent text-accent"
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="font-ui text-sm text-brand-800">
            <strong className="font-semibold">4.9 / 5</strong> · 2,300+ verified
            reviews
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {TESTIMONIALS.map((t, i) => (
          <article
            key={t.author}
            className={`relative overflow-hidden rounded-[28px] p-7 md:p-8 flex flex-col gap-6 min-h-[320px] transition-transform duration-500 hover:-translate-y-1 ${TONE_GRADIENT[t.tone]}`}
            style={{
              // Slight vertical stagger so the row feels composed, not grid-y.
              marginTop: i === 1 ? "1.5rem" : undefined,
            }}
          >
            {/* Big decorative quote glyph */}
            <Quote
              aria-hidden="true"
              className={`absolute -top-3 -right-3 h-28 w-28 ${TONE_QUOTE_COLOR[t.tone]} rotate-12`}
              strokeWidth={1}
            />

            {/* Index badge */}
            <span
              className={`font-ui text-[10px] uppercase tracking-[0.25em] ${t.tone === "yellow" ? "text-brand-900/60" : "text-white/60"}`}
            >
              {String(i + 1).padStart(2, "0")} / {TESTIMONIALS.length.toString().padStart(2, "0")}
            </span>

            {/* Quote */}
            <blockquote
              className={`relative font-display text-xl md:text-[1.55rem] leading-snug tracking-tight flex-1 ${t.tone === "yellow" ? "text-brand-900" : "text-white"}`}
            >
              &ldquo;{t.quote}&rdquo;
            </blockquote>

            {/* Stars */}
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  aria-hidden="true"
                  className={`h-3.5 w-3.5 ${t.tone === "yellow" ? "fill-brand-900 text-brand-900" : "fill-accent text-accent"}`}
                />
              ))}
            </div>

            {/* Author */}
            <footer className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full font-ui text-xs font-bold ${TONE_AVATAR[t.tone]}`}
              >
                {t.initials}
              </span>
              <div className="leading-tight">
                <div
                  className={`font-ui text-sm font-semibold ${t.tone === "yellow" ? "text-brand-900" : "text-white"}`}
                >
                  {t.author}
                </div>
                <div
                  className={`font-ui text-xs ${t.tone === "yellow" ? "text-brand-900/60" : "text-white/60"}`}
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
