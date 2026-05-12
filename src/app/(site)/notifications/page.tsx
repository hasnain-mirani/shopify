"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSiteNotifications } from "@/hooks/useSiteNotifications";

export default function NotificationsPage() {
  const { items, markAllRead } = useSiteNotifications();

  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  return (
    <div className="container-shop py-8 md:py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 font-ui text-sm font-medium text-slate-400 transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to home
      </Link>

      <h1 className="font-ui text-2xl font-bold tracking-tight text-white md:text-3xl">
        Notifications
      </h1>
      <p className="mt-2 max-w-lg text-sm text-slate-400">
        Store updates, promos, and announcements from SSHUB.
      </p>

      <ul className="mt-8 space-y-2">
        {items.length === 0 ? (
          <li className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-10 text-center font-ui text-sm text-slate-500">
            No notifications yet.
          </li>
        ) : (
          items.map((n) => {
            const inner = (
              <>
                <p className="font-ui text-sm font-semibold text-accent">{n.title}</p>
                <p className="mt-1 font-ui text-sm leading-snug text-slate-300 line-clamp-3">
                  {n.body}
                </p>
                <p className="mt-2 font-ui text-[11px] text-slate-500">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </>
            );
            const cardClass =
              "block rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition-colors hover:border-accent/30 hover:bg-white/[0.06]";
            return (
              <li key={n.id}>
                {n.url ? (
                  <Link href={n.url} className={cardClass}>
                    {inner}
                  </Link>
                ) : (
                  <div className={cardClass}>{inner}</div>
                )}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
