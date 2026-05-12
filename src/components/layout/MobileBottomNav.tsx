"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CircleUserRound,
  Home,
  LayoutGrid,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMounted } from "@/hooks/useIsMounted";
import { selectCartCount, useCartStore } from "@/store/cart-store";
import { useSiteNotifications } from "@/hooks/useSiteNotifications";

const SAFE_BOTTOM = "pb-[max(0.5rem,env(safe-area-inset-bottom))]";

function NavBadge({ count }: { count: number }) {
  if (count < 1) return null;
  const text = count > 99 ? "99+" : String(count);
  return (
    <span
      className="pointer-events-none absolute -right-1 -top-0.5 z-[1] flex h-4 min-w-[16px] translate-x-px items-center justify-center rounded-full border border-brand-950 bg-accent px-1 font-ui text-[9px] font-bold leading-none text-brand-950"
      aria-hidden
    >
      {text}
    </span>
  );
}

function IconSlot({
  children,
  badge,
}: {
  children: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <span className="relative flex h-6 w-6 shrink-0 items-center justify-center [&>svg]:h-5 [&>svg]:w-5">
      {children}
      {badge}
    </span>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname() ?? "";
  const isMounted = useIsMounted();
  const cartCount = useCartStore(selectCartCount);
  const openCart = useCartStore((s) => s.openCart);
  const { unreadCount } = useSiteNotifications();

  const isHome = pathname === "/";
  const isNotifications = pathname.startsWith("/notifications");
  const isCategories =
    pathname.startsWith("/collections") ||
    pathname === "/shop" ||
    pathname.startsWith("/shop");
  const isAccount = pathname.startsWith("/account");

  const displayCart = isMounted ? cartCount : 0;

  const itemBase =
    "flex min-h-[52px] w-full flex-col items-center justify-center gap-1 rounded-md px-0.5 py-1.5 outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/70";

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-[45] border-t border-white/[0.06] bg-brand-950 md:hidden",
        SAFE_BOTTOM,
      )}
      aria-label="Mobile navigation"
    >
      <ul className="mx-auto grid h-full w-full max-w-lg grid-cols-5">
        <li className="min-w-0">
          <Link
            href="/"
            className={cn(
              itemBase,
              isHome ? "text-accent" : "text-slate-500 active:text-slate-300",
            )}
            aria-current={isHome ? "page" : undefined}
          >
            <IconSlot>
              <Home strokeWidth={isHome ? 2.25 : 2} aria-hidden />
            </IconSlot>
            <span className="w-full truncate text-center font-ui text-[10px] font-medium leading-none tracking-tight">
              Home
            </span>
          </Link>
        </li>
        <li className="min-w-0">
          <Link
            href="/notifications"
            className={cn(
              itemBase,
              isNotifications ? "text-accent" : "text-slate-500 active:text-slate-300",
            )}
            aria-current={isNotifications ? "page" : undefined}
          >
            <IconSlot badge={<NavBadge count={unreadCount} />}>
              <Bell strokeWidth={isNotifications ? 2.25 : 2} aria-hidden />
            </IconSlot>
            <span className="w-full truncate text-center font-ui text-[10px] font-medium leading-none tracking-tight">
              Inbox
            </span>
          </Link>
        </li>
        <li className="min-w-0">
          <Link
            href="/collections"
            className={cn(
              itemBase,
              isCategories ? "text-accent" : "text-slate-500 active:text-slate-300",
            )}
            aria-current={isCategories ? "page" : undefined}
          >
            <IconSlot>
              <LayoutGrid strokeWidth={isCategories ? 2.25 : 2} aria-hidden />
            </IconSlot>
            <span className="w-full truncate text-center font-ui text-[10px] font-medium leading-none tracking-tight">
              Categories
            </span>
          </Link>
        </li>
        <li className="min-w-0">
          <button
            type="button"
            onClick={openCart}
            className={cn(itemBase, "text-slate-500 active:text-slate-300")}
          >
            <IconSlot badge={<NavBadge count={displayCart} />}>
              <ShoppingCart strokeWidth={2} aria-hidden />
            </IconSlot>
            <span className="w-full truncate text-center font-ui text-[10px] font-medium leading-none tracking-tight">
              Cart
            </span>
          </button>
        </li>
        <li className="min-w-0">
          <Link
            href="/account/login"
            className={cn(
              itemBase,
              isAccount ? "text-accent" : "text-slate-500 active:text-slate-300",
            )}
            aria-current={isAccount ? "page" : undefined}
          >
            <IconSlot>
              <CircleUserRound strokeWidth={isAccount ? 2.25 : 2} aria-hidden />
            </IconSlot>
            <span className="w-full truncate text-center font-ui text-[10px] font-medium leading-none tracking-tight">
              Account
            </span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
