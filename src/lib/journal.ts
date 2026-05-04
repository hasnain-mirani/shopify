/**
 * Static journal data.
 *
 * The site doesn't wire a CMS yet — these posts are authored inline so
 * the Journal index and detail pages can ship without a backend. When a
 * CMS is added, replace `JOURNAL_POSTS` with a fetch and keep the
 * `JournalPost` shape.
 */

export type JournalCategory =
  | "Field Notes"
  | "Styling"
  | "Guides"
  | "Drops"
  | "Studio";

export type JournalTone = "green" | "yellow" | "orange";

export interface JournalPost {
  slug: string;
  title: string;
  dek: string;
  category: JournalCategory;
  author: string;
  authorRole: string;
  publishedAt: string; // ISO date
  readMinutes: number;
  tone: JournalTone;
  /** A short excerpt shown on the index. */
  excerpt: string;
  /** Paragraphs of body copy, rendered on the detail page. */
  body: string[];
}

export const JOURNAL_POSTS: JournalPost[] = [
  {
    slug: "how-to-style-a-phone-shelf",
    title: "How to style a phone shelf",
    dek: "The three-object rule, why a candle changes everything, and how to stop your desk from looking like a tech catalogue.",
    category: "Styling",
    author: "Noor Ibrahim",
    authorRole: "Styling lead",
    publishedAt: "2026-03-14",
    readMinutes: 6,
    tone: "green",
    excerpt:
      "A phone on its own looks like a phone. A phone next to a candle and a small mirror looks like a life. That's the whole trick.",
    body: [
      "A phone on its own looks like a phone. A phone next to a candle and a small mirror looks like a life. That&rsquo;s the whole trick, and once you see it you can&rsquo;t unsee it.",
      "My rule of three: every surface where a phone lives gets two other objects. One tall (a candle, a small vase, a lamp), one flat (a book, a tray, a coaster). The phone stops being the subject and becomes part of the composition.",
      "The lazy version of this: a MagSafe stand, a matcha candle, a linen-bound notebook. Three objects. Five minutes. Your desk is suddenly a shelf worth photographing — and also, quietly, a nicer place to spend a Tuesday.",
      "The harder version: a wall mirror above the desk, a plant to the left of the phone, warm-white lighting above. This is a whole afternoon of rearranging. It&rsquo;s also the version that makes people ask where you got everything.",
    ],
  },
  {
    slug: "the-bundle-math",
    title: "The bundle math, explained honestly",
    dek: "Why phone + home bundles save more than a single-item discount, and how we picked the 15% number.",
    category: "Guides",
    author: "Ayesha Khan",
    authorRole: "Founder",
    publishedAt: "2026-02-28",
    readMinutes: 4,
    tone: "yellow",
    excerpt:
      "A phone case alone is a transaction. A phone case and a candle is a mood — and that difference shows up on the order summary.",
    body: [
      "When we launched Bundle Deals, a lot of shops were doing &quot;buy two, get one free.&quot; We didn&rsquo;t want that. A free thing nobody chose ends up in a drawer, and the drawer is already full.",
      "Instead we picked pairs that actually belong together — a phone case and a matching candle, a charger and a coaster, a stand and a small mirror. The bundle isn&rsquo;t a promo; it&rsquo;s a set.",
      "On the 15% number: it&rsquo;s the discount at which we can still pay our makers properly, our packers a living wage, and our shipping budget. We tested 10% (too small to notice) and 20% (nice, but unsustainable). Fifteen turns out to be the honest middle.",
    ],
  },
  {
    slug: "glow-drop-26-behind-the-scenes",
    title: "Behind the Glow Drop &rsquo;26",
    dek: "Twelve new pieces, three new bundles, and a quiet change in how we photograph everything. Notes from the studio.",
    category: "Drops",
    author: "The Studio",
    authorRole: "Team note",
    publishedAt: "2026-02-10",
    readMinutes: 4,
    tone: "orange",
    excerpt:
      "This drop has the most phone cases we&rsquo;ve ever shipped in one go, and — for the first time — a candle scent named after a city.",
    body: [
      "Every season we sit down with the full sell-through spreadsheet and pick what comes next. For Glow Drop &rsquo;26, three patterns jumped out: matte finishes outperformed gloss 4:1, warm-toned candles sold faster than cool, and bundles converted at nearly twice the rate of single items.",
      "So we leaned in. Twelve new cases, all matte. Three new candles, all warm (bergamot, amber, fig). And the first-ever &ldquo;city set&rdquo; bundle — a phone case in our signature plum paired with a candle we&rsquo;ve named after the city it was mixed in.",
      "The other change, quieter: we reshot everything on film. Digital was making our products look plastic. A roll of Portra makes a ceramic candle look like a ceramic candle — and somehow that&rsquo;s worth the scan fees.",
    ],
  },
  {
    slug: "packing-an-order",
    title: "What goes in the box",
    dek: "We hand-pack every order ourselves. Here&rsquo;s what it looks like from our side of the packing table.",
    category: "Studio",
    author: "Zain Malik",
    authorRole: "Ops",
    publishedAt: "2026-01-22",
    readMinutes: 5,
    tone: "green",
    excerpt:
      "Tissue paper, a ribbon, a hand-written thank-you card. The box is the first thing you see — we make sure it earns the click.",
    body: [
      "When your order leaves our studio, a real person has touched every piece of it. That&rsquo;s not a marketing line — it&rsquo;s the operational reality of being a small shop. We can&rsquo;t automate packing yet, and honestly, we don&rsquo;t want to.",
      "Every box gets: the piece, wrapped in acid-free tissue; a recycled kraft card with your name on it, written by hand; a small sample (usually a candle try-pack); and a thin plum ribbon tied once and tucked.",
      "The tissue matters more than you&rsquo;d think. It&rsquo;s the first thing a customer sees when they lift the lid, and it sets a tone that a jiffy bag never can. We went through four suppliers before we found one whose paper folds cleanly without that cheap crinkle.",
    ],
  },
  {
    slug: "aesthetic-on-a-budget",
    title: "An aesthetic corner on a small budget",
    dek: "You don&rsquo;t need a renovation. You need a mirror, a candle, and a better charger. Here&rsquo;s the under-$60 version.",
    category: "Field Notes",
    author: "Noor Ibrahim",
    authorRole: "Styling lead",
    publishedAt: "2026-01-05",
    readMinutes: 5,
    tone: "yellow",
    excerpt:
      "The difference between a desk and a vibe is usually $40 of careful choices. A candle. A mirror. A cable that doesn&rsquo;t look like a cable.",
    body: [
      "People assume &ldquo;aesthetic&rdquo; means expensive. It doesn&rsquo;t. The difference between a desk and a vibe is usually $40 of careful choices — a small wall mirror, a single warm candle, a charging cable the colour of your actual flat.",
      "My under-$60 kit: a matte phone case (~$18), a braided charging cable in sand or plum (~$12), a small round wall mirror (~$22), and a single soy candle (~$8 on bundle). Total: $60, usually $51 with the bundle discount.",
      "None of this requires a weekend or a drill. The mirror has a self-adhesive back. The cable plugs into the same wall. The candle is just a candle. But together they make a corner of your flat look like it was art-directed — which, technically, it was.",
    ],
  },
  {
    slug: "why-we-ship-globally",
    title: "Why we ship globally",
    dek: "A short note on why a small shop in one corner of the world is better off sending boxes to 34 countries than to one.",
    category: "Studio",
    author: "The Studio",
    authorRole: "Team note",
    publishedAt: "2025-12-18",
    readMinutes: 3,
    tone: "orange",
    excerpt:
      "Our first ever international order went to Toronto. It took eleven days and cost us money. We&rsquo;d do it again.",
    body: [
      "Our first ever international order went to a flat in Toronto. The postage ate the entire margin. We shipped it anyway, because somebody had liked our stuff enough to type their address from 11,000 kilometres away.",
      "Four years later we ship to 34 countries. The economics got better, the packaging got sturdier, and the DMs got a lot more interesting. Somebody in Berlin tags us with their desk; somebody in Jakarta asks if we can do custom candle scents; somebody in Reykjavík sends a photo of our case in actual snow.",
      "We&rsquo;re not a global shop because it&rsquo;s strategically smart (it mostly isn&rsquo;t). We&rsquo;re global because the internet doesn&rsquo;t have borders and we&rsquo;d rather ship a parcel to Iceland than tell somebody we can&rsquo;t.",
    ],
  },
];

export function getAllPosts(): JournalPost[] {
  return [...JOURNAL_POSTS].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export function getPostBySlug(slug: string): JournalPost | undefined {
  return JOURNAL_POSTS.find((post) => post.slug === slug);
}

export function getAllCategories(): JournalCategory[] {
  const seen = new Set<JournalCategory>();
  for (const post of JOURNAL_POSTS) seen.add(post.category);
  return Array.from(seen);
}

/** Short, locale-agnostic publish date: "March 14, 2026". */
export function formatPublishDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
