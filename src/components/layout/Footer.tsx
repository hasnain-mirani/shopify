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
      { label: "All products", href: "/shop" },
      { label: "Collections", href: "/collections" },
      { label: "New arrivals", href: "/shop?sort=CREATED_AT&reverse=true" },
      { label: "Sale", href: "/shop?tag=sale" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Journal", href: "/journal" },
      { label: "Contact", href: "/contact" },
      { label: "Sustainability", href: "/sustainability" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "FAQ", href: "/faq" },
      { label: "Size guide", href: "/size-guide" },
    ],
  },
];

export interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        "mt-20 border-t border-brand-200 bg-surface text-brand-800",
        className,
      )}
    >
      <div className="container-shop py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_2fr_1.3fr]">
          {/* Brand + tagline */}
          <div>
            <Link
              href="/"
              className="inline-flex flex-col leading-none"
              aria-label="Store — home"
            >
              <span className="flex items-center gap-2 text-brand-900">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-brand-900 text-base font-bold"
                >
                  ☀
                </span>
                <span className="font-ui text-[15px] font-semibold uppercase tracking-[0.2em]">
                  Store
                </span>
              </span>
              <span className="font-ui text-[10px] uppercase tracking-[0.25em] text-brand-500 mt-2">
                Considered goods
              </span>
            </Link>
            <p className="mt-5 text-sm text-brand-600 max-w-xs leading-relaxed">
              Designed for durability and everyday use. Honest materials,
              thoughtful construction, made to last.
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
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-900 mb-4">
                  {section.heading}
                </h3>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-brand-600 hover:text-brand-900 transition-colors"
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

        <div className="mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-t border-brand-200 pt-6 text-xs text-brand-500">
          <span>&copy; {new Date().getFullYear()} Store. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-brand-900 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-brand-900 transition-colors">
              Terms
            </Link>
            <Link href="/accessibility" className="hover:text-brand-900 transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-200 text-brand-700 hover:border-brand-900 hover:text-brand-900 transition-colors"
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
    // No backend yet — swap this for your real subscription endpoint.
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setEmail("");
    toast.success("Thanks for subscribing");
  };

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-900 mb-4">
        Newsletter
      </h3>
      <p className="text-sm text-brand-600 mb-4 leading-relaxed">
        Occasional emails about new releases and restocks. No spam.
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
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-900 text-white hover:bg-brand-700 disabled:opacity-60 transition-colors"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default Footer;
