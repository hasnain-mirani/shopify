"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  PlusCircle,
  LogOut,
  ExternalLink,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string; size?: number }>;
  match?: (pathname: string) => boolean;
}

const NAV: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    Icon: LayoutDashboard,
    match: (p) => p === "/admin",
  },
  {
    href: "/admin/orders",
    label: "Orders",
    Icon: ShoppingBag,
    match: (p) => p.startsWith("/admin/orders"),
  },
  {
    href: "/admin/products",
    label: "Products",
    Icon: Package,
    match: (p) =>
      p.startsWith("/admin/products") && !p.startsWith("/admin/products/new"),
  },
  {
    href: "/admin/products/new",
    label: "New product",
    Icon: PlusCircle,
    match: (p) => p.startsWith("/admin/products/new"),
  },
];

interface Props {
  shopName?: string;
  storefrontUrl?: string;
}

export function AdminSidebar({ shopName = "Store", storefrontUrl = "/" }: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="px-5 py-6 border-b border-zinc-200 dark:border-zinc-800">
        <p className="font-display italic text-xl tracking-tight">{shopName}</p>
        <p className="mt-0.5 text-xs uppercase tracking-wider text-zinc-500">
          Admin
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, Icon, match }) => {
          const active = match ? match(pathname) : pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
        <Link
          href={storefrontUrl}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <ExternalLink size={18} className="shrink-0" />
          <span>View storefront</span>
        </Link>
        <Link
          href="/admin/logout"
          prefetch={false}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <LogOut size={18} className="shrink-0" />
          <span>Sign out</span>
        </Link>
      </div>
    </aside>
  );
}
