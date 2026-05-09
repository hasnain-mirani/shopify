"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getFirebaseMessaging } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";
import { useAuthStore } from "@/store/auth-store";
import { NotificationToast } from "@/components/ui/NotificationToast";
import { api } from "@/lib/api-client";
import type { NotificationPayload } from "@/types/notifications";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/** Register the FCM service worker. Safe to call multiple times. */
async function ensureServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return undefined;
  try {
    const existing = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");
    if (existing) return existing;
    const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;
    console.log("[FCM] Service worker registered:", reg.scope);
    return reg;
  } catch (err) {
    console.error("[FCM] Service worker registration failed:", err);
    return undefined;
  }
}

/** Request browser permission and get an FCM token. Exported for use outside the hook. */
export async function requestNotificationPermission(user?: any): Promise<string | null> {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("[FCM] Permission denied:", permission);
      return null;
    }

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn("[FCM] Messaging not supported in this browser");
      return null;
    }

    const swReg = await ensureServiceWorker();
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (token) {
      localStorage.setItem("fcm_token", token);
      console.log("[FCM] Token saved:", token.slice(0, 20) + "...");
      // Save token to backend
      try {
        await api.notifications.saveToken(
          token,
          user?.uid || "",
          user?.email || ""
        );
      } catch (err) {
        console.error("[FCM] Failed to save token to backend:", err);
      }
    }
    return token ?? null;
  } catch (err) {
    console.error("[FCM] Error getting token:", err);
    return null;
  }
}

export function useNotifications() {
  const user = useAuthStore((s) => s.user);
  const [toast, setToast] = useState<NotificationPayload | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  const sendLocalNotification = useCallback((payload: NotificationPayload) => {
    setToast(payload);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Initialize SW and FCM listener regardless of auth state
  useEffect(() => {
    let mounted = true;

    (async () => {
      await ensureServiceWorker();

      // If permission already granted but no token, get one silently
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          const existingToken = localStorage.getItem("fcm_token");
          if (!existingToken) {
            await requestNotificationPermission(user);
          } else {
            // Ensure backend has it on mount/login
            api.notifications.saveToken(existingToken, user?.uid ?? undefined, user?.email ?? undefined).catch(console.error);
          }
        }
      }

      // Subscribe to foreground messages
      const messaging = await getFirebaseMessaging();
      if (!messaging || !mounted) return;

      unsubRef.current?.();
      const unsub = onMessage(messaging, (payload) => {
        if (!mounted) return;
        console.log("[FCM] Foreground message received:", payload);
        setToast({
          title: payload.notification?.title || "SSHUB",
          body: payload.notification?.body || "",
          icon: payload.notification?.icon,
          url: (payload.data as any)?.url,
        });
      });
      unsubRef.current = unsub;
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    return () => { unsubRef.current?.(); };
  }, []);

  return {
    requestPermissionAndGetToken: () => requestNotificationPermission(user),
    sendLocalNotification,
    toast,
    dismissToast,
    NotificationToastComponent: toast ? (
      <NotificationToast payload={toast} onDismiss={dismissToast} />
    ) : null,
  };
}
