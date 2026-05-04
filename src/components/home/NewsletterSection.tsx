"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { ArrowRight } from "lucide-react";

/**
 * Newsletter section — dark #1A0D00 canvas with centered radial amber glow.
 * Playfair Display heading, pill-shaped email input with gold focus border,
 * gold gradient submit button.
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
    toast.success("Thanks — we'll keep you in the loop! ⚡");
  };

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="relative overflow-hidden"
      style={{ background: "#1A0D00" }}
    >
      {/* Centered radial amber glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(800px 500px at 50% 50%, rgba(245,166,35,0.08) 0%, transparent 70%)",
        }}
      />
      {/* Top-left blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-32 rounded-full blur-3xl"
        style={{ width: "450px", height: "450px", background: "radial-gradient(circle, rgba(245,166,35,0.07), transparent 65%)" }}
      />
      {/* Bottom-right blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-32 rounded-full blur-3xl"
        style={{ width: "480px", height: "480px", background: "radial-gradient(circle, rgba(232,133,10,0.06), transparent 65%)" }}
      />

      {/* Dot pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(245,166,35,0.9) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Gold border lines top & bottom */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,166,35,0.3), transparent)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,166,35,0.3), transparent)" }} />

      <div className="container-shop relative py-20 md:py-28 flex flex-col items-center text-center gap-10">
        {/* Eyebrow */}
        <span
          className="inline-flex items-center gap-2 font-ui text-[11px] uppercase tracking-[0.3em]"
          style={{ color: "#F5A623" }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#F5A623" }} />
          The Glow List
        </span>

        {/* Heading */}
        <div className="max-w-2xl">
          <h2
            id="newsletter-heading"
            className="heading-display"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              color: "white",
              lineHeight: 0.95,
            }}
          >
            Get the{" "}
            <span
              style={{
                background: "linear-gradient(120deg, #FFD580, #F5A623, #E8850A, #FFD580)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shine 3s linear infinite",
              }}
            >
              best deals
            </span>{" "}
            first.
          </h2>
          <p
            className="font-sans mt-5"
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "clamp(0.95rem, 1.8vw, 1.1rem)",
              lineHeight: 1.7,
              maxWidth: "520px",
              margin: "1.25rem auto 0",
            }}
          >
            Early access to flash sales, new smartwatch arrivals, power bank drops, and exclusive bundle discounts. Monthly — never spammy.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          aria-label="Subscribe to newsletter"
          className="w-full max-w-md"
        >
          <div
            className="flex items-center gap-2 p-2 rounded-full"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(245,166,35,0.2)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              transition: "border-color 0.3s, box-shadow 0.3s",
            }}
          >
            <input
              id="newsletter-email"
              type="email"
              name="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent pl-4 pr-2 text-white placeholder:text-white/30 font-sans text-sm outline-none"
              onFocus={(e) => {
                const parent = e.target.parentElement;
                if (parent) {
                  parent.style.borderColor = "rgba(245,166,35,0.5)";
                  parent.style.boxShadow = "0 0 0 3px rgba(245,166,35,0.1), 0 4px 20px rgba(0,0,0,0.3)";
                }
              }}
              onBlur={(e) => {
                const parent = e.target.parentElement;
                if (parent) {
                  parent.style.borderColor = "rgba(245,166,35,0.2)";
                  parent.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
                }
              }}
            />
            <button
              type="submit"
              disabled={submitting || !email}
              aria-label="Subscribe"
              className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-ui text-sm font-bold text-brand-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #F5A623, #E8850A)",
                boxShadow: "0 4px 16px rgba(245,166,35,0.3)",
              }}
            >
              {submitting ? "Joining…" : "Join Now"}
              {!submitting && (
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>

          <p
            className="mt-4 font-sans text-xs text-center"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            By subscribing you agree to our privacy policy. Unsubscribe anytime.
          </p>
        </form>

        {/* Trust row */}
        <div
          className="flex items-center gap-6 flex-wrap justify-center font-ui text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          <span>48k+ subscribers</span>
          <span className="h-1 w-1 rounded-full" style={{ background: "rgba(245,166,35,0.3)" }} />
          <span>Monthly · never spam</span>
          <span className="h-1 w-1 rounded-full" style={{ background: "rgba(245,166,35,0.3)" }} />
          <span>Unsubscribe anytime</span>
        </div>
      </div>
    </section>
  );
}

export default NewsletterSection;
