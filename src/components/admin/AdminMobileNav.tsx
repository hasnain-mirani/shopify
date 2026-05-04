"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  PlusCircle,
  Megaphone,
  Home,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  exact?: boolean;
}

const ITEMS: NavItem[] = [
  { href: "/admin", label: "Home", Icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingBag },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/promo-banner", label: "Promo", Icon: Megaphone },
  { href: "/admin/landing-products", label: "Landing", Icon: Home },
];

export function AdminMobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="md:hidden sticky bottom-0 z-20 grid grid-cols-5 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      aria-label="Admin sections"
    >
      {ITEMS.map(({ href, label, Icon, exact }) => {
        const active = exact
          ? pathname === href
          : pathname.startsWith(href) &&
            !(href === "/admin/products" && pathname.startsWith("/admin/products/new"));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-2 text-[11px]",
              active
                ? "text-zinc-900 dark:text-zinc-50"
                : "text-zinc-500 dark:text-zinc-400",
            )}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
