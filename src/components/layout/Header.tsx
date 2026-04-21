"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  type Variants,
} from "framer-motion";
import { useTheme } from "next-themes";
import { Heart, Moon, Search, ShoppingBag, Sun, X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useIsMounted } from "@/hooks/useIsMounted";
import {
  selectCartCount,
  selectSubtotal,
  useCartStore,
} from "@/store/cart-store";
import { AnnouncementBar } from "./AnnouncementBar";

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/journal" },
] as const;

export interface HeaderProps {
  /** When true, the header starts transparent and only solidifies on scroll. */
  transparentOnTop?: boolean;
  /** Wishlist item count. */
  wishlistCount?: number;
  /** Show the announcement bar above the header. */
  showAnnouncement?: boolean;
  announcementMessage?: React.ReactNode;
}

/**
 * "Editor's choice" navbar.
 *
 * Highlights (the reason it reads premium rather than generic):
 *   ① A spring-damped scroll-progress line runs along the very top edge,
 *     tinted with the accent-yellow → accent-orange gradient.
 *   ② On desktop the bar splits into TWO floating glass pills with a gap
 *     between them — one for brand + navigation, one for search + icons.
 *   ③ A yellow pill slides behind the active nav link using framer-motion
 *     `layoutId`, so route changes animate like a native iOS tab bar.
 *   ④ A live "SPRING 2026" chip with a pulsing dot sits next to the logo,
 *     echoing a broadcast "on air" indicator.
 *   ⑤ The search affordance is a full pill button with an inline ⌘K
 *     keyboard-shortcut hint; pressing ⌘K / Ctrl+K anywhere on the site
 *     jumps you to /search.
 *   ⑥ Hovering the cart icon reveals a floating glass "peek" card with
 *     item count + subtotal — no need to open the drawer just to glance.
 *   ⑦ The mobile hamburger morphs smoothly between menu-lines and ×.
 */
export function Header({
  transparentOnTop = true,
  wishlistCount = 0,
  showAnnouncement = true,
  announcementMessage,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const scrollY = useScrollPosition(8);
  const scrolled = scrollY > 24;
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = useCartStore(selectCartCount);
  const subtotal = useCartStore(selectSubtotal);
  const openCart = useCartStore((s) => s.openCart);

  const solid = scrolled || !transparentOnTop;

  // ⌘K / Ctrl+K → jump to /search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        router.push("/search");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  // Mobile menu: lock body scroll while open.
  useEffect(() => {
    if (!mobileOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [mobileOpen]);

  return (
    <>
      {showAnnouncement && <AnnouncementBar message={announcementMessage} />}

      <ScrollProgress />

      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-[padding] duration-300 outline-none",
          /* Tight rhythm under the promo bar — extra pt/pb here was reading
             as “random blank space” between the strip and the pills. */
          "py-1.5 md:py-2",
        )}
      >
        <div className="container-shop flex items-center gap-3 md:gap-4">
          {/* ═══════════════════════ LEFT PILL ═══════════════════════════
              Brand + live chip + desktop nav. On mobile we still render
              the logo + live chip here (the nav collapses into the
              hamburger overlay), in a single unified pill. */}
          <div
            className={cn(
              "flex items-center h-11 md:h-[3.25rem] pl-3 md:pl-4 pr-2 md:pr-3 gap-3 md:gap-5",
              "transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
              "outline-none ring-0",
              solid
                ? "nav-glass-pill rounded-full"
                : "bg-transparent border border-transparent",
            )}
          >
            <Link
              href="/"
              aria-label="Store — home"
              className="group flex items-center gap-2 leading-none shrink-0 outline-none"
            >
              {/* The sun-disc morphs to an arrow on hover — a tiny
                  delight that rewards exploration without being noisy. */}
              <span
                aria-hidden="true"
                className="relative flex h-7 w-7 items-center justify-center rounded-full bg-accent text-brand-900 overflow-hidden transition-transform duration-500 group-hover:rotate-180"
              >
                <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold transition-opacity duration-300 group-hover:opacity-0">
                  ☀
                </span>
                <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  →
                </span>
              </span>
              <span className="font-ui text-[13px] font-semibold uppercase tracking-[0.18em] text-brand-900">
                Store
              </span>
            </Link>

            {/* LIVE / season chip */}
            <div
              aria-label="Current season"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-brand-900/90 pl-1.5 pr-2.5 py-1 font-ui text-[9px] font-semibold uppercase tracking-[0.22em] text-white"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-80" />
                <span className="relative rounded-full h-1.5 w-1.5 bg-accent" />
              </span>
              <span>Spring 2026</span>
            </div>

            {/* Desktop nav with sliding indicator */}
            <nav
              aria-label="Primary"
              className="hidden md:flex items-center gap-1 pl-2"
            >
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  active={isActive(pathname, link.href)}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Flexible gap between pills */}
          <div className="flex-1" />

          {/* ═══════════════════════ RIGHT PILL ══════════════════════════
              Search, wishlist, cart (with hover peek), theme, mobile menu. */}
          <div
            className={cn(
              "flex items-center h-11 md:h-[3.25rem] gap-0.5 md:gap-1 px-1.5 md:px-2",
              "transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
              "outline-none ring-0",
              solid
                ? "nav-glass-pill rounded-full"
                : "bg-transparent border border-transparent",
            )}
          >
            {/* Desktop: full search pill with ⌘K hint.
                Mobile: collapses to a simple icon button. */}
            <Link
              href="/search"
              aria-label="Search — press Command or Control plus K"
              className={cn(
                "group hidden md:inline-flex items-center gap-2.5 pl-3 pr-2 h-8 rounded-full",
                "bg-brand-100/70 hover:bg-brand-100 text-brand-500 hover:text-brand-900",
                "transition-colors border border-brand-200/35",
              )}
            >
              <Search className="h-[15px] w-[15px]" aria-hidden="true" />
              <span className="font-ui text-[12px] pr-6 md:pr-8 lg:pr-12">
                Search…
              </span>
              <kbd className="font-ui text-[10px] font-medium bg-white text-brand-600 rounded-md border border-brand-200 shadow-sm px-1.5 py-0.5 tabular-nums">
                ⌘K
              </kbd>
            </Link>

            <Link
              href="/search"
              aria-label="Search"
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-900 hover:bg-brand-100/70 transition-colors outline-none"
            >
              <Search className="h-[18px] w-[18px]" aria-hidden="true" />
            </Link>

            <IconButton label="Wishlist" href="/wishlist" badge={wishlistCount}>
              <Heart className="h-[18px] w-[18px]" aria-hidden="true" />
            </IconButton>

            <CartIconButton
              count={cartCount}
              subtotal={subtotal}
              onClick={openCart}
            />

            <ThemeToggle />

            <MobileMenuButton
              open={mobileOpen}
              onToggle={() => setMobileOpen((v) => !v)}
            />
          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Scroll progress bar                                                        */
/* -------------------------------------------------------------------------- */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.4,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 h-[2px] origin-left bg-gradient-to-r from-accent via-[color:var(--color-accent-orange)] to-accent pointer-events-none"
      style={{ scaleX }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Active-aware nav link with sliding pill                                    */
/* -------------------------------------------------------------------------- */

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative font-ui text-[13px] font-medium px-3.5 py-1.5 rounded-full",
        "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-900",
        active ? "text-brand-900" : "text-brand-500 hover:text-brand-900",
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active-pill"
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-accent"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Generic icon button                                                        */
/* -------------------------------------------------------------------------- */

interface IconButtonProps {
  label: string;
  href?: string;
  badge?: number;
  animated?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

function IconButton({
  label,
  href,
  badge,
  animated,
  onClick,
  children,
}: IconButtonProps) {
  const content = (
    <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-900 hover:bg-brand-100/70 transition-colors">
      {children}
      {typeof badge === "number" && badge > 0 && (
        <CountBadge count={badge} animated={animated} />
      )}
      <span className="sr-only">{label}</span>
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={label}
        className="outline-none focus-visible:ring-2 focus-visible:ring-brand-900 rounded-full"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="outline-none focus-visible:ring-2 focus-visible:ring-brand-900 rounded-full"
    >
      {content}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Cart icon with hover "peek" card                                           */
/* -------------------------------------------------------------------------- */

interface CartIconButtonProps {
  count: number;
  subtotal: { amount: string; currencyCode: string } | null;
  onClick: () => void;
}

function CartIconButton({ count, subtotal, onClick }: CartIconButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="Cart"
        onClick={onClick}
        className="outline-none focus-visible:ring-2 focus-visible:ring-brand-900 rounded-full"
      >
        <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-900 hover:bg-brand-100/70 transition-colors">
          <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />
          {count > 0 && <CountBadge count={count} animated />}
          <span className="sr-only">Cart</span>
        </span>
      </button>

      <AnimatePresence>
        {open && count > 0 && (
          <motion.div
            key="cart-peek"
            role="tooltip"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute top-full right-0 mt-2 min-w-[200px]",
              "nav-glass-pill rounded-2xl px-4 py-3 text-left pointer-events-none",
            )}
          >
            <div className="font-ui text-[10px] uppercase tracking-[0.22em] text-brand-500">
              Your bag
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-4">
              <span className="font-display text-xl text-brand-900 leading-none">
                {count} {count === 1 ? "item" : "items"}
              </span>
              {subtotal && (
                <span className="font-ui text-sm font-semibold text-brand-900 tabular-nums">
                  {formatPrice(subtotal.amount, subtotal.currencyCode)}
                </span>
              )}
            </div>
            <div className="mt-2 font-ui text-[11px] text-brand-500">
              Click to review & check out
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CountBadge({ count, animated }: { count: number; animated?: boolean }) {
  const display = count > 99 ? "99+" : String(count);
  const classes = cn(
    "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1",
    "inline-flex items-center justify-center rounded-full",
    "bg-accent text-brand-900 text-[10px] font-semibold leading-none",
    "ring-2 ring-white",
  );

  if (!animated) {
    return <span className={classes}>{display}</span>;
  }

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={count}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.6, opacity: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 22 }}
        className={classes}
      >
        {display}
      </motion.span>
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/* Theme toggle — sun/moon crossfade                                          */
/* -------------------------------------------------------------------------- */

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-900 hover:bg-brand-100/70 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-900"
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted && isDark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="inline-flex"
          >
            <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="inline-flex"
          >
            <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Morphing hamburger                                                         */
/* -------------------------------------------------------------------------- */

function MobileMenuButton({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      onClick={onToggle}
      className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-900 hover:bg-brand-100/70 transition-colors outline-none"
    >
      <span className="relative block h-4 w-5">
        <motion.span
          aria-hidden="true"
          className="absolute left-0 right-0 h-[2px] bg-current rounded-full"
          animate={
            open ? { top: 7, rotate: 45 } : { top: 2, rotate: 0 }
          }
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.span
          aria-hidden="true"
          className="absolute left-0 right-0 h-[2px] bg-current rounded-full top-[7px]"
          animate={{ opacity: open ? 0 : 1 }}
          transition={{ duration: 0.18 }}
        />
        <motion.span
          aria-hidden="true"
          className="absolute left-0 right-0 h-[2px] bg-current rounded-full"
          animate={
            open ? { top: 7, rotate: -45 } : { top: 12, rotate: 0 }
          }
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        />
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile overlay                                                             */
/* -------------------------------------------------------------------------- */

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.08 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: 8, transition: { duration: 0.15 } },
};

function MobileMenu({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string | null;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 bg-surface md:hidden flex flex-col"
        >
          <div className="container-shop h-16 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-brand-900 text-[13px] font-bold"
              >
                ☀
              </span>
              <span className="font-ui text-[13px] font-semibold uppercase tracking-[0.18em]">
                Store
              </span>
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-brand-100/70"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <nav
            aria-label="Mobile primary"
            className="container-shop flex-1 flex flex-col justify-center gap-1"
          >
            {NAV_LINKS.map((link, i) => {
              const active = isActive(pathname, link.href);
              return (
                <motion.div key={link.href} variants={itemVariants}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-baseline gap-4 py-2.5 border-b border-brand-200",
                      "font-display text-5xl transition-colors",
                      active ? "text-brand-900" : "text-brand-800 hover:text-brand-600",
                    )}
                  >
                    <span className="font-ui text-[10px] uppercase tracking-[0.25em] text-brand-400 w-8">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1">{link.label}</span>
                    {active && (
                      <span className="h-2 w-2 rounded-full bg-accent" />
                    )}
                  </Link>
                </motion.div>
              );
            })}

            <motion.div
              variants={itemVariants}
              className="mt-10 flex items-center gap-4 font-ui text-sm text-brand-600"
            >
              <Link href="/wishlist" onClick={onClose} className="hover:text-brand-900">
                Wishlist
              </Link>
              <span className="w-px h-4 bg-brand-300" />
              <Link href="/cart" onClick={onClose} className="hover:text-brand-900">
                Cart
              </Link>
              <span className="w-px h-4 bg-brand-300" />
              <Link href="/account" onClick={onClose} className="hover:text-brand-900">
                Account
              </Link>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-8 flex items-center gap-2 rounded-full bg-brand-900 text-white w-max pl-2 pr-3.5 py-1.5 font-ui text-[10px] font-semibold uppercase tracking-[0.22em]"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-80" />
                <span className="relative rounded-full h-1.5 w-1.5 bg-accent" />
              </span>
              <span>Spring 2026 · Live now</span>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Header;
