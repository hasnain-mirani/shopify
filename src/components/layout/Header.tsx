"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  type Variants,
} from "framer-motion";
import { ChevronRight, Bell, Heart, Search, ShoppingBag, X, Zap } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useIsMounted } from "@/hooks/useIsMounted";
import {
  selectCartCount,
  selectSubtotal,
  useCartStore,
} from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useAuthStore } from "@/store/auth-store";
import { getFirebaseAuth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { AnnouncementBar } from "./AnnouncementBar";
import { SshubMark } from "@/components/brand/SshubMark";
import { SshubWordmark } from "@/components/brand/SshubWordmark";

const NAV_LINKS = [
  { label: "Shop",        href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "About",       href: "/about" },
  { label: "Journal",     href: "/journal" },
] as const;

export interface HeaderProps {
  transparentOnTop?: boolean;
  wishlistCount?: number;
  showAnnouncement?: boolean;
  announcementMessage?: React.ReactNode;
}

export function Header({
  transparentOnTop = true,
  wishlistCount = 0,
  showAnnouncement = true,
  announcementMessage,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = useCartStore(selectCartCount);
  const subtotal = useCartStore(selectSubtotal);
  const openCart = useCartStore((s) => s.openCart);

  const isMounted = useIsMounted();
  const wishlistStoreCount = useWishlistStore((s) => s.items.length);
  const displayWishlistCount = isMounted ? wishlistStoreCount : wishlistCount;

  const [navCompact, setNavCompact] = useState(false);
  const prevCartRef = useRef<number | null>(null);
  const prevWishRef = useRef<number | null>(null);
  const [cartBounceTick, setCartBounceTick] = useState(0);
  const [wishBounceTick, setWishBounceTick] = useState(0);
  const reduceMotion = useReducedMotion();

  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);

  useEffect(() => {
    const onScroll = () => setNavCompact(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (prevCartRef.current !== null && cartCount > prevCartRef.current) {
      setCartBounceTick((t) => t + 1);
    }
    prevCartRef.current = cartCount;
  }, [cartCount]);

  useEffect(() => {
    if (prevWishRef.current !== null && displayWishlistCount > prevWishRef.current) {
      setWishBounceTick((t) => t + 1);
    }
    prevWishRef.current = displayWishlistCount;
  }, [displayWishlistCount]);

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

  useEffect(() => {
    if (!mobileOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [mobileOpen]);

  return (
    <>
      {showAnnouncement && <AnnouncementBar message={announcementMessage} />}

      <ScrollProgress />

      <header
        className={cn(
          "nav-bar-glass sticky top-0 z-40 w-full transition-[box-shadow] duration-300",
          navCompact && "shadow-lg shadow-black/25",
        )}
      >
        <div
          className={cn(
            "container-shop flex items-center gap-3 transition-[height,padding] duration-300 ease-out",
            navCompact ? "h-14" : "h-[60px]",
          )}
        >
          {/* ── Hamburger (mobile) ── */}
          <MobileMenuButton open={mobileOpen} onToggle={() => setMobileOpen((v) => !v)} />

          {/* ── Logo ── */}
          <Link
            href="/"
            aria-label="SSHUB — home"
            className="group flex items-center gap-2 leading-none shrink-0 outline-none"
          >
            <motion.span
              aria-hidden="true"
              initial={reduceMotion ? false : { scale: 0.88, opacity: 0.85 }}
              animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full transition-transform duration-500 group-hover:rotate-[360deg]"
              style={
                reduceMotion
                  ? undefined
                  : {
                      animation: "logo-glow-pulse 2.8s ease-in-out 0.2s 2",
                    }
              }
            >
              <SshubMark size={32} className="h-full w-full rounded-full object-cover" />
            </motion.span>
            <span className="hidden sm:block">
              <SshubWordmark variant="nav" />
            </span>
          </Link>

          {/* ── CENTER: Search bar ── */}
          <div className="flex-1 max-w-[600px] mx-auto">
            <Link
              href="/search"
              aria-label="Search products"
              className="flex h-10 items-center gap-2.5 rounded-full border border-brand-200/15 bg-brand-900/75 px-4 no-underline transition-all duration-300 hover:border-accent/55 hover:bg-brand-800/75 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1e]"
            >
              <Search
                className="w-4 h-4 text-slate-400 flex-shrink-0"
                aria-hidden="true"
              />
              <span className="flex-1 font-ui text-sm text-slate-400">
                Search products…
              </span>
              <kbd
                className="hidden md:inline-block font-ui text-[11px] font-semibold px-2 py-0.5 rounded bg-brand-800/80 text-slate-200 border border-brand-200/15 flex-shrink-0"
              >
                ⌘K
              </kbd>
            </Link>
          </div>

          {/* ── RIGHT: Login + Register + Cart + Wishlist ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Auth buttons */}
            {isMounted && !authLoading && (
              user ? (
                <UserMenu user={user} />
              ) : (
                <>
                  <Link
                    href="/account/login"
                    className="hidden sm:inline-flex items-center h-9 px-4 rounded-full border border-brand-200/20 font-ui text-xs font-semibold text-slate-100 no-underline whitespace-nowrap transition-colors hover:bg-brand-800/70"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/account/register"
                    className="hidden sm:inline-flex items-center h-9 px-4 rounded-full bg-gradient-to-br from-accent-light to-accent font-ui text-xs font-bold text-brand-950 no-underline whitespace-nowrap shadow-lg shadow-accent/20 transition-all hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-px"
                  >
                    Register
                  </Link>
                </>
              )
            )}

            {/* Notification bell */}
            {isMounted && <NotificationBell />}

            <IconButton
              label="Wishlist"
              href="/wishlist"
              badge={displayWishlistCount}
              bumpKey={wishBounceTick}
            >
              <Heart className="h-[18px] w-[18px]" aria-hidden="true" />
            </IconButton>

            <CartIconButton
              count={cartCount}
              subtotal={subtotal}
              onClick={openCart}
              bumpKey={cartBounceTick}
            />
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} pathname={pathname} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Scroll progress — gold gradient                                             */
/* -------------------------------------------------------------------------- */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 h-[2px] origin-left pointer-events-none bg-gradient-to-r from-accent via-brand-200 to-accent-dark"
      style={{ scaleX }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Nav link with gold sliding indicator                                        */
/* -------------------------------------------------------------------------- */

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href, active, children,
}: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative font-ui text-[13px] font-medium px-3.5 py-1.5 rounded-full",
        "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent",
        active ? "text-brand-900" : "text-white/60 hover:text-accent",
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active-pill"
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-gradient-to-br from-accent to-accent-dark"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Icon button                                                                 */
/* -------------------------------------------------------------------------- */

interface IconButtonProps {
  label: string;
  href?: string;
  badge?: number;
  animated?: boolean;
  bumpKey?: number;
  onClick?: () => void;
  children: React.ReactNode;
}

function IconButton({ label, href, badge, animated, bumpKey = 0, onClick, children }: IconButtonProps) {
  const inner = (
    <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition-colors hover:text-accent">
      {children}
      {typeof badge === "number" && badge > 0 && <CountBadge count={badge} animated={animated} />}
      <span className="sr-only">{label}</span>
    </span>
  );

  const content =
    bumpKey > 0 ? (
      <motion.span
        key={bumpKey}
        initial={{ y: 0 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="inline-flex"
      >
        {inner}
      </motion.span>
    ) : (
      inner
    );

  if (href) {
    return (
      <Link href={href} aria-label={label} className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent">
        {content}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent">
      {content}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Cart icon with hover peek                                                   */
/* -------------------------------------------------------------------------- */

function CartIconButton({
  count,
  subtotal,
  onClick,
  bumpKey = 0,
}: {
  count: number;
  subtotal: { amount: string; currencyCode: string } | null;
  onClick: () => void;
  bumpKey?: number;
}) {
  const [open, setOpen] = useState(false);

  const bag = (
    <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition-colors hover:text-accent">
      <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />
      {count > 0 && <CountBadge count={count} animated />}
      <span className="sr-only">Cart</span>
    </span>
  );

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
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {bumpKey > 0 ? (
          <motion.span
            key={bumpKey}
            initial={{ y: 0 }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex"
          >
            {bag}
          </motion.span>
        ) : (
          bag
        )}
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
            className="absolute top-full right-0 mt-2 min-w-[200px] nav-glass-pill rounded-2xl px-4 py-3 text-left pointer-events-none"
          >
            <div className="font-ui text-[10px] uppercase tracking-[0.22em] text-white/50">Your bag</div>
            <div className="mt-1 flex items-baseline justify-between gap-4">
              <span className="font-display text-xl text-white leading-none">
                {count} {count === 1 ? "item" : "items"}
              </span>
              {subtotal && (
                <span className="font-ui text-sm font-semibold text-accent tabular-nums">
                  {formatPrice(subtotal.amount, subtotal.currencyCode)}
                </span>
              )}
            </div>
            <div className="mt-2 font-ui text-[11px] text-white/40">Click to review & check out</div>
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
    "text-brand-900 text-[10px] font-black leading-none ring-2 ring-brand-900",
    "bg-accent"
  );

  if (!animated) return <span className={classes}>{display}</span>;

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
/* User menu                                                                   */
/* -------------------------------------------------------------------------- */

import type { User } from "firebase/auth";

function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const initial = (user.displayName?.[0] || user.email?.[0] || "U").toUpperCase();

  return (
    <div
      className="relative hidden sm:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="Account menu"
        className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-brand-900 font-ui font-bold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || ""} className="h-full w-full rounded-full object-cover" />
        ) : (
          initial
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="user-menu"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full right-0 mt-2 w-52 nav-glass-pill rounded-2xl p-2 shadow-xl"
          >
            <div className="px-3 py-2 border-b border-brand-200/10 mb-1">
              <p className="font-ui text-xs font-semibold text-white truncate">{user.displayName || "Account"}</p>
              <p className="font-ui text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const a = getFirebaseAuth();
                if (a) void signOut(a);
              }}
              className="w-full text-left px-3 py-2 rounded-xl font-ui text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Notification Bell                                                           */
/* -------------------------------------------------------------------------- */

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const email = user?.email?.trim();
        const qs = email
          ? `?email=${encodeURIComponent(email)}`
          : "";
        const res = await fetch(`/api/site-notifications${qs}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          
          // Check unread
          const lastRead = localStorage.getItem("last_read_notifications") || "0";
          const newItems = (data.notifications || []).filter((n: any) => n.created_at > lastRead);
          setUnreadCount(newItems.length);
        }
      } catch (err) {}
    };
    fetchNotifications();
    
    // Poll every 60s
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user?.email]);

  const handleOpen = () => {
    setOpen(true);
    setUnreadCount(0);
    if (notifications.length > 0) {
      localStorage.setItem("last_read_notifications", notifications[0].created_at);
    }
  };

  return (
    <div 
      className="relative hidden sm:block"
      onMouseEnter={handleOpen}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="Notifications"
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-full outline-none transition-colors",
          unreadCount > 0
            ? "text-brand-900 bg-amber-400"
            : "text-slate-400 hover:text-slate-200 hover:bg-brand-800/50"
        )}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-brand-900">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full right-[-50px] mt-2 w-80 nav-glass-pill rounded-2xl p-2 shadow-xl z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-brand-200/10 flex justify-between items-center">
              <h3 className="font-ui text-sm font-bold text-white">Notifications</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-ui">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.url || "#"}
                    className="block px-4 py-3 hover:bg-brand-800/50 transition-colors border-b border-brand-200/5 last:border-0"
                  >
                    <p className="font-ui text-sm font-semibold text-amber-400 mb-1 leading-tight">{n.title}</p>
                    <p className="font-ui text-xs text-slate-300 leading-snug line-clamp-2">{n.body}</p>
                    <p className="font-ui text-[10px] text-slate-500 mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile hamburger button                                                     */
/* -------------------------------------------------------------------------- */

function MobileMenuButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      onClick={onToggle}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-300 hover:text-accent transition-colors outline-none"
    >
      <span className="relative block h-4 w-5">
        <motion.span
          aria-hidden="true"
          className="absolute left-0 right-0 h-[2px] bg-current rounded-full"
          animate={open ? { top: 7, rotate: 45 } : { top: 2, rotate: 0 }}
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
          animate={open ? { top: 7, rotate: -45 } : { top: 12, rotate: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        />
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Sidebar menu (priceoye-style)                                               */
/* -------------------------------------------------------------------------- */

const SIDEBAR_CATEGORIES = [
  { label: "Mobiles",                   href: "/collections/mobiles", icon: "📱", subs: ["Samsung", "Infinix", "Oppo", "Xiaomi", "Vivo", "Honor", "Tecno", "Realme", "More Brands"] },
  { label: "Smart Watches",             href: "/collections/smart-watches", icon: "⌚", subs: ["Faster", "Nothing", "Zero", "Assorted", "Dany", "Samsung", "Huawei", "More Brands"] },
  { label: "Wireless Earbuds",          href: "/collections/wireless-earbuds", icon: "🎧", subs: ["Xiaomi", "Airox", "Soundpeats", "Anker", "More Brands"] },
  { label: "Trimmers & Shavers",        href: "/collections/trimmers-shavers", icon: "🪒", subs: ["Kemei", "Philips", "Wahl", "More Brands"] },
  { label: "Power Banks",               href: "/collections/power-banks", icon: "🔋", subs: ["Xiaomi", "Anker", "Baseus", "More Brands"] },
  { label: "Wall Chargers",             href: "/collections/wall-chargers", icon: "🔌", subs: ["Anker", "Baseus", "Samsung", "More Brands"] },
  { label: "Bluetooth Speakers",        href: "/collections/bluetooth-speakers", icon: "🔊", subs: ["JBL", "Xiaomi", "Airox", "More Brands"] },
  { label: "Tablets",                   href: "/collections/tablets", icon: "📟", subs: ["Samsung", "Xiaomi", "Lenovo", "More Brands"] },
  { label: "Laptops",                   href: "/collections/laptops", icon: "💻", subs: ["Dell", "HP", "Lenovo", "Asus", "More Brands"] },
  { label: "Hair Dryers",               href: "/collections/hair-dryers", icon: "💨", subs: ["Kemei", "Nova", "More Brands"] },
  { label: "Hair Straighteners",        href: "/collections/hair-straighteners", icon: "✂️", subs: ["Kemei", "Nova", "More Brands"] },
  { label: "TV & Home Appliances",      href: "/collections/home-appliances", icon: "📺", subs: ["Samsung", "LG", "TCL", "Haier", "More Brands"] },
];

function MobileMenu({
  open, onClose,
}: { open: boolean; onClose: () => void; pathname: string | null }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (label: string) =>
    setExpanded((prev) => (prev === label ? null : label));

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.55)" }}
            onClick={onClose}
          />

          {/* Sidebar panel */}
          <motion.aside
            key="sidebar-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 bottom-0 z-50 flex flex-col"
            style={{ width: "280px", background: "#020617", boxShadow: "8px 0 36px rgba(0,0,0,0.45)", borderRight: "1px solid rgba(148,163,184,0.2)" }}
          >
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #172554, #1e293b)", padding: "16px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(148,163,184,0.2)" }}>
              <Link href="/" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                <SshubMark size={28} className="rounded-full" />
                <SshubWordmark variant="drawer" />
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                onClick={onClose}
                style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(148,163,184,0.2)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#f8fafc" }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Login + quick links */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(148,163,184,0.2)" }}>
              <Link
                href="/account"
                onClick={onClose}
                style={{ display: "inline-block", padding: "7px 24px", borderRadius: "8px", background: "linear-gradient(135deg, #fcd34d, #f59e0b)", color: "#020617", fontFamily: "var(--font-outfit, sans-serif)", fontSize: "13px", fontWeight: 700, textDecoration: "none", marginBottom: "10px" }}
              >
                Login
              </Link>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Link href="/track-order" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#cbd5e1", textDecoration: "none" }}>
                  <span>📍</span> Track my Order
                </Link>
                <Link href="/contact" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#cbd5e1", textDecoration: "none" }}>
                  <span>📢</span> Launch a Complaint
                </Link>
              </div>
            </div>

            {/* Scrollable categories */}
            <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
              <p style={{ padding: "10px 16px 6px", fontFamily: "var(--font-outfit, sans-serif)", fontSize: "11px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>Categories</p>

              {SIDEBAR_CATEGORIES.map((cat) => (
                <div key={cat.label}>
                  <button
                    type="button"
                    onClick={() => toggle(cat.label)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", background: "none", border: "none", borderBottom: "1px solid rgba(148,163,184,0.14)", cursor: "pointer", textAlign: "left" }}
                  >
                    <span style={{ fontSize: "18px", width: "22px", textAlign: "center" }}>{cat.icon}</span>
                    <Link
                      href={cat.href}
                      onClick={onClose}
                      style={{ flex: 1, fontFamily: "var(--font-outfit, sans-serif)", fontSize: "13px", fontWeight: 500, color: "#e2e8f0", textDecoration: "none" }}
                    >
                      {cat.label}
                    </Link>
                    <ChevronRight
                      size={14}
                      style={{
                        color: "#94a3b8",
                        transform: expanded === cat.label ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    />
                  </button>

                  {/* Sub-items */}
                  {expanded === cat.label && (
                    <div style={{ background: "rgba(15,23,42,0.6)", borderBottom: "1px solid rgba(148,163,184,0.14)" }}>
                      {cat.subs.map((sub) => (
                        <Link
                          key={sub}
                          href={`/shop?tag=${encodeURIComponent(sub === "More Brands" ? cat.label : sub)}`}
                          onClick={onClose}
                          style={{ display: "block", padding: "8px 16px 8px 50px", fontFamily: "var(--font-outfit, sans-serif)", fontSize: "12px", color: "#cbd5e1", textDecoration: "none", borderBottom: "1px solid rgba(148,163,184,0.1)" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#f59e0b"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#cbd5e1"; }}
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Popular lists */}
              <p style={{ padding: "14px 16px 6px", fontFamily: "var(--font-outfit, sans-serif)", fontSize: "11px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>Popular Lists</p>
              {["Best Sellers", "New Arrivals", "Top Rated", "Under Rs 1,000"].map((item) => (
                <Link
                  key={item}
                  href={`/shop?tag=${encodeURIComponent(item)}`}
                  onClick={onClose}
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", fontFamily: "var(--font-outfit, sans-serif)", fontSize: "13px", color: "#e2e8f0", textDecoration: "none", borderBottom: "1px solid rgba(148,163,184,0.14)" }}
                >
                  <span style={{ color: "#f59e0b" }}>›</span> {item}
                </Link>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default Header;
