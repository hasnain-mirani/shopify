"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { ArrowRight } from "lucide-react";

/**
 * Full-bleed subscribe block. Deep forest-green canvas with decorative
 * sun-washed gradient blobs, a large serif headline, and a single-line
 * email capture that mirrors the Photovoltaic Goldstein aesthetic.
 */
export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    setSubmitting(false);
    setEmail("");
    toast.success("Thanks — we'll be in touch.");
  };

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="relative overflow-hidden bg-brand-900 text-white"
    >
      {/* Decorative blobs — golden-hour pools of light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-32 h-[480px] w-[480px] rounded-full opacity-35 blur-3xl"
        style={{ background: "radial-gradient(circle, #f5e04a, transparent 65%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #f2a65a, transparent 65%)" }}
      />

      {/* Subtle dot pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="container-shop relative py-20 md:py-28 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] items-center gap-12">
        {/* Copy */}
        <div className="flex flex-col gap-5 max-w-xl">
          <span className="inline-flex items-center gap-2 font-ui text-[11px] uppercase tracking-[0.3em] text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            The Journal
          </span>
          <h2
            id="newsletter-heading"
            className="heading-display text-[clamp(2.5rem,5.5vw,4.5rem)] text-white leading-[0.95]"
          >
            Stay in the{" "}
            <em className="italic text-accent">loop</em>.
          </h2>
          <p className="font-sans text-white/70 text-base md:text-lg leading-relaxed max-w-md">
            New releases, quiet restocks, and the occasional long read.
            Delivered monthly. No noise.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={onSubmit}
          className="glass-pill rounded-[28px] p-6 md:p-8 backdrop-blur-2xl w-full max-w-md lg:ml-auto"
          aria-label="Subscribe to newsletter"
        >
          <label
            htmlFor="newsletter-email"
            className="block font-ui text-[11px] uppercase tracking-[0.25em] text-white/60"
          >
            Email address
          </label>

          <div className="mt-3 flex items-center gap-2 border-b border-white/25 focus-within:border-accent transition-colors">
            <input
              id="newsletter-email"
              type="email"
              name="email"
              required
              placeholder="you@somewhere.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent py-3 pr-2 text-white placeholder:text-white/35 font-sans text-base outline-none"
            />
            <button
              type="submit"
              disabled={submitting || !email}
              aria-label="Subscribe"
              className="group inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent text-brand-900 transition-all duration-300 hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
          </div>

          <p className="mt-5 font-sans text-xs text-white/50 leading-relaxed">
            By subscribing you agree to our privacy policy. Unsubscribe
            anytime — we won't take it personally.
          </p>

          {/* mini trust row */}
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between font-ui text-[10px] uppercase tracking-[0.2em] text-white/50">
            <span>10k+ subscribers</span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span>Monthly · never spam</span>
          </div>
        </form>
      </div>
    </section>
  );
}

export default NewsletterSection;
