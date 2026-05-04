import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { NewsletterSection } from "@/components/home";
import { buildPageMetadata } from "@/lib/metadata";
import {
  formatPublishDate,
  getAllPosts,
  getPostBySlug,
  type JournalTone,
} from "@/lib/journal";

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return buildPageMetadata("Journal", undefined, "/journal");
  return buildPageMetadata(post.title, post.dek, `/journal/${post.slug}`);
}

const TONE_BG: Record<JournalTone, string> = {
  green: "bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900",
  yellow: "bg-gradient-to-br from-accent to-accent-dark",
  orange:
    "bg-gradient-to-br from-[color:var(--color-accent-orange)] to-brand-700",
};

const TONE_INK: Record<JournalTone, string> = {
  green: "text-accent",
  yellow: "text-brand-900",
  orange: "text-white",
};

const TONE_CHIP: Record<JournalTone, string> = {
  green: "bg-white/15 text-white",
  yellow: "bg-brand-900/10 text-brand-900",
  orange: "bg-white/20 text-white",
};

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const all = getAllPosts();
  const idx = all.findIndex((p) => p.slug === post.slug);
  const prev = idx > 0 ? all[idx - 1] : undefined;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : undefined;

  return (
    <>
      {/* ───────────────────────── Header ───────────────────────── */}
      <section
        aria-label="Article header"
        className="relative overflow-hidden isolate"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(700px 420px at 88% 20%, rgba(245,164,124,0.22), transparent 60%), " +
              "linear-gradient(180deg, #fbf7f9 0%, #f1eaf4 100%)",
          }}
        />

        <div className="container-shop relative pt-10 pb-8 md:pt-14 md:pb-12">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 font-ui text-[11px] uppercase tracking-[0.28em] text-brand-700 hover:text-brand-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to the journal
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-ui text-[10px] uppercase tracking-[0.22em] ${TONE_CHIP[post.tone]} ${post.tone === "yellow" ? "" : TONE_BG[post.tone]}`}
            >
              {post.category}
            </span>
            <span className="font-ui text-[11px] uppercase tracking-[0.22em] text-brand-500">
              {formatPublishDate(post.publishedAt)}
            </span>
            <span className="h-1 w-1 rounded-full bg-brand-300" />
            <span className="inline-flex items-center gap-1.5 font-ui text-[11px] uppercase tracking-[0.22em] text-brand-500">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {post.readMinutes} min read
            </span>
          </div>

          <h1 className="heading-display text-[clamp(2.25rem,5.5vw,4.5rem)] text-brand-900 leading-[0.98] mt-5 max-w-4xl">
            {post.title}
          </h1>
          <p className="font-sans text-brand-600 text-lg md:text-xl leading-relaxed max-w-3xl mt-6">
            {post.dek}
          </p>

          <div className="mt-8 flex items-center gap-3 border-t border-brand-200 pt-6 max-w-md">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-900 text-accent font-ui text-xs font-bold">
              {initials(post.author)}
            </span>
            <div className="leading-tight">
              <div className="font-ui text-sm font-semibold text-brand-900">
                {post.author}
              </div>
              <div className="font-ui text-[11px] uppercase tracking-[0.2em] text-brand-500 mt-1">
                {post.authorRole}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Cover ───────────────────────── */}
      <section aria-hidden="true" className="container-shop">
        <div
          className={`relative h-[260px] md:h-[380px] lg:h-[460px] rounded-[28px] overflow-hidden ${TONE_BG[post.tone]}`}
        >
          <div
            className="absolute inset-0 opacity-25 mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 30%, white, transparent 60%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <span
            className={`absolute left-8 top-8 font-display text-[6rem] md:text-[9rem] leading-none select-none opacity-90 ${TONE_INK[post.tone]}`}
          >
            {String(idx + 1).padStart(2, "0")}
          </span>
          <span
            className={`absolute left-8 bottom-8 font-ui text-[11px] uppercase tracking-[0.28em] ${post.tone === "yellow" ? "text-brand-900/70" : "text-white/70"}`}
          >
            {post.category} · {formatPublishDate(post.publishedAt)}
          </span>
        </div>
      </section>

      {/* ───────────────────────── Body ───────────────────────── */}
      <article className="container-shop py-14 md:py-20">
        <div className="mx-auto max-w-2xl prose-journal">
          {post.body.map((paragraph, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "font-display text-2xl md:text-3xl text-brand-900 leading-[1.35] mb-8 first-letter:font-display first-letter:text-5xl md:first-letter:text-6xl first-letter:float-left first-letter:mr-3 first-letter:leading-[0.9] first-letter:text-brand-700"
                  : "font-sans text-brand-800 text-lg leading-[1.75] mb-6"
              }
            >
              {paragraph}
            </p>
          ))}

          <div className="mt-12 pt-8 border-t border-brand-200 flex flex-wrap items-center justify-between gap-4">
            <span className="font-ui text-[11px] uppercase tracking-[0.28em] text-brand-500">
              End · {post.category}
            </span>
            <Link
              href="/journal"
              className="inline-flex items-center gap-2 font-ui text-sm font-medium text-brand-800 hover:text-brand-900 border-b border-brand-300 hover:border-brand-900 pb-0.5 transition-colors"
            >
              Back to the journal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      {/* ───────────────────────── Prev / Next ───────────────────────── */}
      {(prev || next) && (
        <section
          aria-label="More from the journal"
          className="container-shop pb-16 md:pb-24"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {prev ? (
              <Link
                href={`/journal/${prev.slug}`}
                className="group surface-card overflow-hidden p-6 md:p-8 flex flex-col gap-3"
              >
                <span className="inline-flex items-center gap-2 font-ui text-[11px] uppercase tracking-[0.28em] text-brand-700">
                  <ArrowLeft className="h-3.5 w-3.5" /> Newer dispatch
                </span>
                <h3 className="font-display text-xl md:text-2xl text-brand-900 leading-tight group-hover:text-brand-700 transition-colors">
                  {prev.title}
                </h3>
                <p className="font-sans text-sm text-brand-600 line-clamp-2">
                  {prev.excerpt}
                </p>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/journal/${next.slug}`}
                className="group surface-card overflow-hidden p-6 md:p-8 flex flex-col gap-3 md:text-right md:items-end"
              >
                <span className="inline-flex items-center gap-2 font-ui text-[11px] uppercase tracking-[0.28em] text-brand-700">
                  Older dispatch <ArrowRight className="h-3.5 w-3.5" />
                </span>
                <h3 className="font-display text-xl md:text-2xl text-brand-900 leading-tight group-hover:text-brand-700 transition-colors">
                  {next.title}
                </h3>
                <p className="font-sans text-sm text-brand-600 line-clamp-2">
                  {next.excerpt}
                </p>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </section>
      )}

      <NewsletterSection />
    </>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}
