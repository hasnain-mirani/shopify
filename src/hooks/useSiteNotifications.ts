"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";

export type SiteNotification = {
  id: string;
  title: string;
  body: string;
  url?: string | null;
  created_at: string;
};

function computeUnread(list: SiteNotification[]): number {
  if (list.length === 0) return 0;
  const lastRead = localStorage.getItem("last_read_notifications") || "0";
  return list.filter((n) => n.created_at > lastRead).length;
}

export function useSiteNotifications(pollMs = 60000) {
  const email = useAuthStore((s) => s.user?.email?.trim());
  const [items, setItems] = useState<SiteNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const qs = email ? `?email=${encodeURIComponent(email)}` : "";
      const res = await fetch(`/api/site-notifications${qs}`);
      if (!res.ok) return;
      const data = await res.json();
      const list = (data.notifications || []) as SiteNotification[];
      setItems(list);
      setUnreadCount(computeUnread(list));
    } catch {
      // ignore
    }
  }, [email]);

  useEffect(() => {
    void fetchNotifications();
    const id = window.setInterval(() => void fetchNotifications(), pollMs);
    return () => window.clearInterval(id);
  }, [fetchNotifications, pollMs]);

  const markAllRead = useCallback(() => {
    if (items.length === 0) {
      localStorage.setItem("last_read_notifications", new Date().toISOString());
    } else {
      localStorage.setItem("last_read_notifications", items[0].created_at);
    }
    setUnreadCount(0);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sshub-notifications-read"));
    }
  }, [items]);

  useEffect(() => {
    const onRead = () => {
      void fetchNotifications();
    };
    window.addEventListener("sshub-notifications-read", onRead);
    return () => window.removeEventListener("sshub-notifications-read", onRead);
  }, [fetchNotifications]);

  return { items, unreadCount, refetch: fetchNotifications, markAllRead };
}
