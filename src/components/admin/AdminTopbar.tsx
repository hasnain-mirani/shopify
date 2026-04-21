"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

/**
 * Mobile-only topbar (hidden on md+). Matches the sidebar visually so the
 * admin feels consistent on a phone.
 */
export function AdminTopbar({ shopName = "Store" }: { shopName?: string }) {
  const pathname = usePathname();
  const crumb = labelForPath(pathname);

  return (
    <header className="md:hidden sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200 bg-white px-4 h-14 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <p className="font-display italic text-base leading-none">{shopName}</p>
        <p className="text-[10px] uppercase tracking-wider text-zinc-500 leading-none mt-0.5">
          {crumb}
        </p>
      </div>
      <Link
        href="/admin/logout"
        prefetch={false}
        aria-label="Sign out"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
      >
        <LogOut size={18} />
      </Link>
    </header>
  );
}

function labelForPath(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/orders")) return "Orders";
  if (pathname.startsWith("/admin/products/new")) return "New product";
  if (pathname.startsWith("/admin/products")) return "Products";
  return "Admin";
}
