# Store — A Next.js 16 Shopify Storefront

An editorial, "Photovoltaic Goldstein"-inspired headless Shopify store built on
**Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind v4**.
Ships with a public storefront (home, shop, collections, products, search,
cart) **and** a password-protected admin panel for managing products and
orders without leaving the app.

> Deep forest green + solar yellow. DM Serif Display headlines, DM Sans body,
> Outfit UI numerals. Liquid-glass chrome, bento layouts, animated pills.

---

## Highlights

### Storefront
- **Editorial home page** — full-bleed hero with SVG brush-stroke italic, bento
  collections, feature spotlight, animated counter "story" section,
  testimonials, marquee bookends, newsletter.
- **Editor's-choice navbar** — split "liquid-glass" pills, sliding yellow
  active indicator (`layoutId`), `⌘K` search shortcut, cart hover "peek"
  with item count + subtotal, spring-damped scroll progress bar, morphing
  hamburger.
- **Editorial shop page** — italic-serif hero with index counter, sticky
  filter toolbar (tag chips + Filters popover + Sort popover), URL-driven
  state, clean 4-col grid.
- **Premium product card** — secondary-image hover crossfade, "hang-tag"
  quick-add pill (yellow disc that rotates 90° on hover, morphs to
  spinner → ✓ during add), wishlist heart, automatic color swatches, and
  editorial new/sale pills.
- **Filters popover** — price range with floating-label number inputs,
  in-stock toggle, and an active-count badge on the trigger.
- **Cart drawer** with optimistic add-to-bag, cart-action server functions,
  and toasts.
- **Search** backed by Shopify predictive search.
- **Dark mode** via `next-themes` with glass tokens that swap.
- **Fully responsive** — the bento collapses to a single column on mobile,
  the navbar collapses to a morphing hamburger with an editorial overlay.

### Admin (`/admin`)
- **Password-gated** — a signed JWT session cookie (via `jose`) set on
  successful login, validated in middleware (`src/proxy.ts`).
- **Dashboard** with KPI cards (orders, revenue, customers).
- **Products** — list, create (with images, variants, pricing), delete
  with two-step confirmation.
- **Orders** — browse recent orders with status badges.

### Under the hood
- **Server-first** — product, collection, and cart reads happen in
  Server Components. Mutations use Server Actions. The only
  client-side state is the cart drawer (Zustand) and UI (`useState`,
  `useTransition`).
- **On-demand revalidation** — `src/app/api/revalidate/route.ts` accepts
  Shopify webhooks, verifies the HMAC, and calls `updateTag(...)` so
  product/collection changes propagate without a full rebuild.
- **Strict TypeScript**, zero lint debt.

---

## Tech stack

| Layer                 | Choice                                                               |
| --------------------- | -------------------------------------------------------------------- |
| Framework             | [Next.js 16](https://nextjs.org) (App Router, Server Actions)        |
| UI runtime            | React 19                                                             |
| Language              | TypeScript 5                                                         |
| Styling               | Tailwind CSS v4 (`@theme` tokens + `@apply` components)              |
| Animations            | Framer Motion 12                                                     |
| Cart state            | Zustand 5                                                            |
| Shopify clients       | `@shopify/storefront-api-client`, direct `fetch` for Admin GraphQL   |
| Icons                 | `lucide-react`                                                       |
| Auth (admin)          | `jose` JWT in an HTTP-only cookie                                    |
| Toasts                | `react-hot-toast`                                                    |
| Fonts                 | `next/font` — DM Serif Display, DM Sans, Outfit, Geist Mono          |

---

## Project structure

```
src/
├── app/
│   ├── (site)/                 # public storefront routes
│   │   ├── page.tsx            # home
│   │   ├── shop/               # catalog + filters/sort
│   │   ├── collections/        # collection list + detail
│   │   ├── products/[handle]/  # product detail page
│   │   └── search/             # predictive search
│   ├── (admin)/                # password-gated dashboard
│   │   ├── admin/login/
│   │   └── admin/(shell)/      # dashboard · products · orders
│   ├── api/revalidate/         # Shopify webhook → updateTag()
│   ├── sitemap.ts · robots.ts
│   └── layout.tsx              # root fonts + <ThemeProvider>
├── components/
│   ├── home/                   # Hero, ValueProps, FeatureSpotlight,
│   │                           # StorySection, TestimonialStrip, MarqueeBand…
│   ├── shop/                   # ShopHero, TagStrip, FilterPanel, ShopEmpty
│   ├── product/                # ProductCard (hang-tag pill), Grid, Sort…
│   ├── cart/                   # Drawer, LineItem
│   ├── layout/                 # Header (split pills), Footer, AnnouncementBar
│   ├── admin/                  # Shell, Sidebar, Topbar, StatusBadge
│   └── ui/                     # Badge, Button, Input, Skeleton, Spinner
├── lib/
│   ├── shopify/                # Storefront client, queries, actions, normalizers
│   ├── shopify-admin.ts        # Admin GraphQL fetch wrapper
│   ├── admin-data.ts           # Dashboard KPI aggregation
│   ├── admin-session.ts        # jose JWT sign/verify for admin cookie
│   ├── metadata.ts             # OG/Twitter builder
│   └── utils.ts                # cn, formatPrice, isVariantAvailable
├── hooks/                      # useScrollPosition, useOutsideClick, useIsMounted
├── store/cart-store.ts         # Zustand cart with optimistic counter
├── proxy.ts                    # Next.js 16 middleware (admin gate)
├── types/shopify.ts            # normalized Shopify shapes
└── app/globals.css             # Tailwind @theme + custom components
```

---

## Getting started

### 1. Prerequisites
- **Node.js 20+**
- **npm** (the repo is lockfile-clean; pnpm / yarn / bun also work).
- A **Shopify store** with the **Headless** sales channel installed and a
  **Custom App** for the Admin API.

### 2. Install
```bash
npm install
```

### 3. Environment variables
Copy `.env.local.example` (if present) or create `.env.local` with:

```bash
# ── Storefront (public) ─────────────────────────────────────────
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
# From: Shopify admin → Sales channels → Headless → Storefront API
SHOPIFY_STOREFRONT_ACCESS_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SHOPIFY_STOREFRONT_API_VERSION=2025-01

# ── Admin API (server-only, never exposed to the browser) ───────
# Create a Custom App: Settings → Apps → Develop apps → Create an app
# Scopes needed:
#   read/write_products, read/write_orders, read_customers,
#   read_inventory, read/write_files
# Reveal the token ONCE on install — it starts with "shpat_".
SHOPIFY_ADMIN_API_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxx
SHOPIFY_ADMIN_API_VERSION=2026-04

# ── Admin panel auth ────────────────────────────────────────────
ADMIN_PANEL_PASSWORD=some-strong-password
# Generate with:
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
ADMIN_SESSION_SECRET=replace-me-with-a-48-byte-hex-string

# ── Shopify webhook revalidation ────────────────────────────────
SHOPIFY_REVALIDATION_SECRET=replace-me-with-a-long-random-string

# ── Canonical site URL for sitemap / robots / SEO ───────────────
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run
```bash
npm run dev       # http://localhost:3000
```

### 5. Build for production
```bash
npm run build
npm run start
```

---

## Shopify setup checklist

### Storefront token
1. Admin → **Sales channels** → **Headless** → install the channel.
2. Open the created storefront → **Storefront API**.
3. Copy the **Public access token** into `SHOPIFY_STOREFRONT_ACCESS_TOKEN`.

### Admin token
1. Admin → **Settings** → **Apps and sales channels** → **Develop apps**.
2. **Create an app** → **Configuration** → **Admin API integration**.
3. Grant the scopes listed in the env comment above.
4. **Install app** → **API credentials** → **Reveal the token once**.
5. Paste it into `SHOPIFY_ADMIN_API_ACCESS_TOKEN`.

### Webhooks (optional, for instant revalidation)
Point `products/create`, `products/update`, `products/delete`, `collections/update`
at:
```
https://<your-domain>/api/revalidate
```
The route verifies Shopify's HMAC signature using
`SHOPIFY_REVALIDATION_SECRET` and then calls `updateTag()`.

---

## Admin panel

| Route                    | Purpose                                                |
| ------------------------ | ------------------------------------------------------ |
| `/admin/login`           | Password form. Sets a signed session cookie on success.|
| `/admin`                 | KPI dashboard (orders, revenue, customers).            |
| `/admin/products`        | Product list + delete with two-step confirmation.      |
| `/admin/products/new`    | Create product (images, variants, prices).             |
| `/admin/orders`          | Recent orders with status badges.                      |
| `/admin/logout` (POST)   | Clears the session cookie.                             |

Middleware (`src/proxy.ts`) redirects any unauthenticated request under
`/admin/**` (except `/admin/login`) back to `/admin/login`.

---

## Route / URL cheatsheet

### Public
- `/` — home
- `/shop` — catalog
- `/shop?tag=…&sort=…&min=…&max=…&instock=1` — filtered catalog
- `/collections` — all collections
- `/collections/[handle]` — collection detail
- `/products/[handle]` — product detail
- `/search?q=…` — predictive search
- `/sitemap.xml` · `/robots.txt`

### API
- `POST /api/revalidate` — Shopify webhook handler
- `POST /admin/logout` — admin sign-out

---

## Scripts

| Command         | Action                              |
| --------------- | ----------------------------------- |
| `npm run dev`   | Start Next.js dev server            |
| `npm run build` | Production build                    |
| `npm run start` | Start the production server         |
| `npm run lint`  | Run ESLint (`eslint-config-next`)   |

Type-check:
```bash
npx tsc --noEmit
```

---

## Design system — at a glance

All tokens live in `src/app/globals.css` under the Tailwind v4 `@theme`
block. Anything you can name with Tailwind already works:

| Token group | Examples                                                   |
| ----------- | ---------------------------------------------------------- |
| Brand       | `bg-brand-50`, `text-brand-900`, `border-brand-200`        |
| Accent      | `bg-accent` (solar yellow), `bg-accent-orange`             |
| Fonts       | `font-display` (DM Serif Display), `font-sans`, `font-ui`  |
| Radii       | `rounded-pill`, `rounded-lg` (24px), `rounded-md` (16px)   |
| Animation   | `animate-fade-up`, `animate-shimmer`, `animate-float-down` |

Component classes (in `@layer components`):
`btn-primary`, `btn-outline`, `btn-ghost`, `glass-pill`, `nav-glass-pill`,
`surface-card`, `card-hover`, `no-scrollbar`.

---

## State & caching

- **Server data** (products, collections, cart) is fetched in RSCs
  through `src/lib/shopify/actions.ts`. Every call passes `tags` and a
  `revalidate` window so individual resources can be purged by webhook.
- **Cart state** lives in Zustand (`src/store/cart-store.ts`) with an
  optimistic badge-count bump on add so the header responds instantly
  even while the real Shopify cart mutation is in flight.
- **URL as state** — shop filters, sort, and search all live in
  `searchParams`, so back/forward and shareable links Just Work.

---

## Deployment

Designed for Vercel but works on any Node 20+ host:

1. Push to a Git provider.
2. Import into Vercel (or your host of choice).
3. Set every env var from `.env.local` in the project settings.
4. Add your production domain to Shopify's **Headless** storefront →
   **CORS allowlist**.
5. Point production webhooks at `https://your-domain/api/revalidate`.

---

## Troubleshooting

| Symptom                                        | Fix                                                                                          |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `Access denied for orders field`               | Admin app is missing `read_orders`. Re-check scopes and reinstall the Custom App.            |
| `Product variant is missing ID attribute`      | You're on a legacy Admin API version. `SHOPIFY_ADMIN_API_VERSION=2026-04` or later.          |
| 401 on `/admin/**`                             | Session cookie is missing or secret changed. Log in again; confirm `ADMIN_SESSION_SECRET`.   |
| Prices not filtering                           | Shopify Storefront API doesn't expose reliable price query operators — filter happens client-side after fetch (see `shop/page.tsx`). |
| LCP warnings on the hero image                 | The hero `<Image>` uses `priority`; make sure your own hero swaps don't drop that prop.      |
| `middleware.ts is deprecated`                  | We already renamed to `src/proxy.ts` per Next.js 16. If you restore the file, fix the name.  |

---

## License

Private / unlicensed — for the author's own use. Remove this section
and add your preferred license before publishing.

---

## Credits

- Visual language adapted from the **Photovoltaic Goldstein** reference
  deck (solar yellow + deep forest, editorial serifs, liquid glass).
- Built with ❤️ on top of Shopify's Storefront and Admin GraphQL APIs.
