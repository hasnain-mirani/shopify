import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Feather } from "lucide-react";
import { MarqueeBand, NewsletterSection } from "@/components/home";
import { buildPageMetadata } from "@/lib/metadata";
import {
  formatPublishDate,
  getAllCategories,
  getAllPosts,
  type JournalPost,
  type JournalTone,
} from "@/lib/journal";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(
    "Journal",
    "Styling notes, drop diaries, and studio dispatches from Glow Store PK — the aesthetic corner of the internet.",
    "/journal",
  );
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

export default function JournalPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();
  const [hero, ...rest] = posts;
  const totalLabel = String(posts.length).padStart(2, "0");

  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section
        aria-labelledby="journal-hero-heading"
        className="relative overflow-hidden isolate"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(720px 440px at 88% 18%, rgba(245,164,124,0.25), transparent 60%), " +
              "radial-gradient(620px 380px at 8% 92%, rgba(242,138,173,0.2), transparent 60%), " +
              "linear-gradient(180deg, #fbf7f9 0%, #f1eaf4 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-[0.3]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(26,14,46,0.08) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 85%)",
          }}
        />

        <div className="container-shop relative pt-12 pb-10 md:pt-16 md:pb-14">
          <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">
            <span className="inline-flex items-center gap-3 font-ui text-[11px] uppercase tracking-[0.28em] text-brand-700">
              <span aria-hidden="true" className="h-px w-10 bg-accent" />
              The Journal · Since 2022
            </span>
            <span className="inline-flex items-baseline gap-1.5 font-ui text-[11px] uppercase tracking-[0.24em] text-brand-500">
              <span className="font-display text-brand-900 text-lg md:text-xl leading-none tabular-nums">
                {totalLabel}
              </span>
              <span>dispatches</span>
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-10">
            <div className="max-w-2xl">
              <h1
                id="journal-hero-heading"
                className="heading-display text-[clamp(2.25rem,5.5vw,4.75rem)] text-brand-900"
              >
                Notes from the{" "}
                <span className="relative inline-block">
                  <em className="italic relative z-10 text-brand-700">
                    glow
                  </em>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 300 24"
                    preserveAspectRatio="none"
                    className="absolute left-0 right-0 -bottom-1 w-full h-3 md:h-4 text-accent"
                  >
                    <path
                      d="M2 18 Q 80 4, 160 12 T 298 10"
                      stroke="currentColor"
                      strokeWidth="9"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.85"
                    />
                  </svg>
                </span>{" "}
                side.
              </h1>
              <p className="font-sans text-brand-600 text-[15px] md:text-base max-w-lg mt-5 leading-relaxed">
                Styling walkthroughs, drop diaries, packing-table stories.
                No trend reports, no affiliate links — just what we&rsquo;re
                actually thinking about this month.
              </p>
            </div>

            {/* Category chips — visual for now, hash-linked so they act as in-page anchors */}
            <ul
              aria-label="Browse by category"
              className="flex flex-wrap gap-2 lg:justify-end"
            >
              {categories.map((cat) => (
                <li key={cat}>
                  <a
                    href={`#cat-${slugify(cat)}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-brand-200/60 px-3 py-1.5 font-ui text-[11px] font-medium uppercase tracking-[0.18em] text-brand-800 hover:border-brand-900 hover:text-brand-900 transition-colors"
                  >
                    {cat}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="#archive"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-900 text-white pl-3.5 pr-2 py-1.5 font-ui text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-brand-800 transition-colors"
                >
                  Full archive
                  <span
                    aria-hidden="true"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-brand-900 text-[10px]"
                  >
                    ↓
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─────────────── Featured article ─────────────── */}
      {hero && (
        <section
          aria-label="Featured article"
          className="container-shop pt-4 pb-16 md:pt-6 md:pb-24"
        >
          <div className="flex items-baseline justify-between gap-4 mb-6 md:mb-8">
            <span className="inline-flex items-center gap-3 font-ui text-[11px] uppercase tracking-[0.28em] text-brand-700">
              <span aria-hidden="true" className="h-px w-8 bg-accent" />
              This week
            </span>
            <span className="font-ui text-[11px] uppercase tracking-[0.22em] text-brand-500 tabular-nums">
              01 / {totalLabel}
            </span>
          </div>

          <FeaturedPost post={hero} />
        </section>
      )}

      {/* ─────────────── Marquee band ─────────────── */}
      <MarqueeBand
        tone="light"
        items={[
          "Styling walkthroughs",
          "Drop diaries",
          "Bundle breakdowns",
          "Packing notes",
          "Studio reports",
        ]}
      />

      {/* ─────────────── Archive grid ─────────────── */}
      {rest.length > 0 && (
        <section
          id="archive"
          aria-labelledby="archive-heading"
          className="container-shop py-16 md:py-24 scroll-mt-24"
        >
          <div className="flex items-end justify-between gap-6 mb-10 md:mb-14">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-10 bg-brand-700" />
                <span className="font-ui text-[11px] uppercase tracking-[0.3em] text-brand-700">
                  The archive · {String(rest.length).padStart(2, "0")} more
                </span>
              </div>
              <h2
                id="archive-heading"
                className="heading-display text-3xl md:text-5xl text-brand-900"
              >
                Everything{" "}
                <em className="italic text-brand-700">we&rsquo;ve filed</em>.
              </h2>
              <p className="font-sans text-brand-600 text-base mt-4 max-w-md">
                A slow-moving log — updated whenever there&rsquo;s something
                worth writing down.
              </p>
            </div>
            <Link
              href="#journal-hero-heading"
              className="hidden sm:inline-flex items-center gap-2 font-ui text-sm font-medium text-brand-800 hover:text-brand-900 border-b border-brand-300 hover:border-brand-900 pb-0.5 transition-colors"
            >
              Back to top
              <ArrowRight className="h-4 w-4 -rotate-90" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {rest.map((post, i) => (
              <PostCard key={post.slug} post={post} index={i + 2} />
            ))}
          </div>
        </section>
      )}

      {/* ─────────────── Pull quote ─────────────── */}
      <section
        aria-label="From the studio"
        className="container-shop pb-20 md:pb-28"
      >
        <figure className="surface-card relative overflow-hidden p-10 md:p-16 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full opacity-35 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(245,164,124,0.55), transparent 65%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full opacity-35 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(242,138,173,0.5), transparent 65%)",
            }}
          />
          <Feather
            aria-hidden="true"
            className="relative mx-auto h-9 w-9 text-brand-700 mb-5"
          />
          <blockquote className="relative heading-display text-2xl md:text-4xl text-brand-900 leading-[1.15] max-w-3xl mx-auto">
            &ldquo;We write when we have something to say. Some months that
            means four essays. Some months it means{" "}
            <em className="italic text-brand-700">none</em>.&rdquo;
          </blockquote>
          <figcaption className="relative mt-5 font-ui text-[11px] uppercase tracking-[0.3em] text-brand-500">
            — From the editor
          </figcaption>
        </figure>
      </section>

      <NewsletterSection />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Featured post                                                              */
/* -------------------------------------------------------------------------- */

function FeaturedPost({ post }: { post: JournalPost }) {
  return (
    <Link
      href={`/journal/${post.slug}`}
      className="group block surface-card overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        {/* Visual slab */}
        <div
          className={`relative min-h-[320px] lg:min-h-[480px] ${TONE_BG[post.tone]} overflow-hidden`}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-25 mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 30%, white, transparent 60%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <span
            aria-hidden="true"
            className={`absolute left-8 top-8 font-display text-[6rem] md:text-[8rem] leading-none select-none opacity-90 ${TONE_INK[post.tone]}`}
          >
            01
          </span>
          <div className="absolute left-8 bottom-8 right-8 flex items-center justify-between gap-4">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-ui text-[10px] uppercase tracking-[0.22em] ${TONE_CHIP[post.tone]}`}
            >
              {post.category}
            </span>
            <span
              className={`font-ui text-[10px] uppercase tracking-[0.22em] ${post.tone === "yellow" ? "text-brand-900/70" : "text-white/70"}`}
            >
              {formatPublishDate(post.publishedAt)}
            </span>
          </div>
        </div>

        {/* Copy */}
        <div className="p-8 md:p-12 flex flex-col gap-5">
          <span className="inline-flex items-center gap-2 font-ui text-[11px] uppercase tracking-[0.28em] text-brand-700">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Featured · This week
          </span>
          <h2 className="heading-display text-3xl md:text-4xl lg:text-5xl text-brand-900 leading-[1.05] group-hover:text-brand-700 transition-colors">
            {post.title}
          </h2>
          <p className="font-sans text-brand-600 text-base leading-relaxed">
            {post.dek}
          </p>
          <div className="mt-2 flex items-center gap-4 text-xs text-brand-500 font-ui uppercase tracking-[0.2em]">
            <span>{post.author}</span>
            <span className="h-1 w-1 rounded-full bg-brand-300" />
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {post.readMinutes} min read
            </span>
          </div>
          <span className="mt-4 inline-flex items-center gap-2 font-ui text-sm font-semibold text-brand-900 border-b border-brand-900 pb-0.5 self-start group-hover:gap-3 transition-all">
            Read the dispatch
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Post card                                                                  */
/* -------------------------------------------------------------------------- */

function PostCard({ post, index }: { post: JournalPost; index: number }) {
  return (
    <Link
      href={`/journal/${post.slug}`}
      id={`cat-${slugify(post.category)}`}
      className="group surface-card overflow-hidden flex flex-col scroll-mt-24"
    >
      <div
        className={`relative h-48 md:h-52 ${TONE_BG[post.tone]} overflow-hidden`}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-25 mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 30%, white, transparent 60%)",
          }}
        />
        <span
          aria-hidden="true"
          className={`absolute left-5 top-5 font-display text-[3.5rem] leading-none select-none opacity-90 ${TONE_INK[post.tone]}`}
        >
          {String(index).padStart(2, "0")}
        </span>
        <span
          className={`absolute left-5 bottom-5 inline-flex items-center gap-2 rounded-full px-3 py-1 font-ui text-[10px] uppercase tracking-[0.22em] ${TONE_CHIP[post.tone]}`}
        >
          {post.category}
        </span>
      </div>

      <div className="p-6 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-3 font-ui text-[11px] uppercase tracking-[0.22em] text-brand-500">
          <span>{formatPublishDate(post.publishedAt)}</span>
          <span className="h-1 w-1 rounded-full bg-brand-300" />
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {post.readMinutes} min
          </span>
        </div>
        <h3 className="font-display text-xl md:text-2xl text-brand-900 leading-tight group-hover:text-brand-700 transition-colors">
          {post.title}
        </h3>
        <p className="font-sans text-sm text-brand-600 leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
        <div className="mt-auto pt-4 flex items-center justify-between text-xs font-ui uppercase tracking-[0.2em] text-brand-500">
          <span>{post.author}</span>
          <span className="inline-flex items-center gap-1 text-brand-800 group-hover:gap-2 transition-all">
            Read
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "-");
}
