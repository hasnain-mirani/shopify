"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const SECTIONS: Array<{ heading: string; links: Array<{ label: string; href: string }> }> = [
  {
    heading: "Shop",
    links: [
      { label: "Phone Cases",       href: "/collections/phone-cases" },
      { label: "Smartwatches",      href: "/collections/smartwatches" },
      { label: "Power Banks",       href: "/collections/power-banks" },
      { label: "Wireless Chargers", href: "/collections/wireless-chargers" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us",  href: "/about" },
      { label: "Journal",   href: "/journal" },
      { label: "Contact",   href: "/contact" },
      { label: "Our Story", href: "/about" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Shipping",    href: "/shipping" },
      { label: "Returns",     href: "/returns" },
      { label: "FAQ",         href: "/faq" },
      { label: "Track Order", href: "/account" },
    ],
  },
];

export interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn("mt-0", className)}
      style={{
        background: "#0d0600",
        borderTop: "1px solid rgba(245,166,35,0.12)",
        color: "rgba(255,255,255,0.6)",
      }}
    >
      <div className="container-shop py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_2fr_1.3fr]">

          {/* Brand + tagline */}
          <div>
            <Link href="/" className="inline-flex flex-col leading-none" aria-label="Glow Store PK — home">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-base font-black text-brand-900"
                  style={{ background: "linear-gradient(135deg, #F5A623, #E8850A)" }}
                >
                  ⚡
                </span>
                <span
                  className="font-display text-lg font-black tracking-tight"
                  style={{
                    background: "linear-gradient(120deg, #FFD580, #F5A623, #E8850A)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  GlowStore
                </span>
              </span>
              <span
                className="font-ui text-[10px] uppercase tracking-[0.25em] mt-2"
                style={{ color: "rgba(245,166,35,0.5)" }}
              >
                Premium Tech Accessories
              </span>
            </Link>

            <p
              className="mt-5 text-sm max-w-xs leading-relaxed"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Phone accessories, smartwatches, power banks and wireless chargers —
              hand-picked for tech lovers. Ships worldwide.
            </p>

            <div className="mt-6 flex items-center gap-2">
              <SocialLink href="https://instagram.com" label="Instagram">
                <InstagramIcon className="h-4 w-4" />
              </SocialLink>
              <SocialLink href="https://twitter.com" label="Twitter / X">
                <XIcon className="h-4 w-4" />
              </SocialLink>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {SECTIONS.map((section) => (
              <div key={section.heading}>
                <h3
                  className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
                  style={{ color: "#F5A623" }}
                >
                  {section.heading}
                </h3>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors hover:text-accent"
                        style={{ color: "rgba(255,255,255,0.45)" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <Newsletter />
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-6 text-xs"
          style={{
            borderTop: "1px solid rgba(245,166,35,0.08)",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          <span>© {new Date().getFullYear()} Glow Store PK. All rights reserved.</span>
          <div className="flex items-center gap-4">
            {[
              { label: "Privacy",       href: "/privacy" },
              { label: "Terms",         href: "/terms" },
              { label: "Accessibility", href: "/accessibility" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-accent"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300"
      style={{
        border: "1px solid rgba(245,166,35,0.2)",
        color: "rgba(255,255,255,0.5)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,166,35,0.5)";
        (e.currentTarget as HTMLElement).style.color = "#F5A623";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,166,35,0.2)";
        (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
      }}
    >
      {children}
    </a>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setEmail("");
    toast.success("Thanks for subscribing ⚡");
  };

  return (
    <div>
      <h3
        className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
        style={{ color: "#F5A623" }}
      >
        Newsletter
      </h3>
      <p className="text-sm mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
        Flash sales, new drops, and exclusive bundle deals. No spam — just great tech.
      </p>
      <form onSubmit={onSubmit} className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            type="email"
            name="email"
            required
            label="Email"
            hideLabel
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="underline"
            inputSize="sm"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          aria-label="Subscribe"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-900 disabled:opacity-60 transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, #F5A623, #E8850A)",
            boxShadow: "0 4px 12px rgba(245,166,35,0.3)",
          }}
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default Footer;
