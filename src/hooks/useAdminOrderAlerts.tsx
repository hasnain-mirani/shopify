"use client";

import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

const AUDIO_URL = "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";

export function useAdminOrderAlerts() {
  const lastOrderId = useRef<string | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/orders?limit=1", { cache: "no-store" });
        if (!res.ok) return;

        const data = await res.json();
        const latestOrder = data.orders?.[0];

        if (latestOrder) {
          if (lastOrderId.current === null) {
            lastOrderId.current = latestOrder.id;
          } else if (lastOrderId.current !== latestOrder.id) {
            lastOrderId.current = latestOrder.id;

            // Play sound
            try {
              const audio = new Audio(AUDIO_URL);
              audio.volume = 0.5;
              await audio.play();
            } catch (_) {}

            // Simple toast — no JSX to avoid module boundary issues
            toast.success(
              `🛍️ New order from ${latestOrder.customer_name || "Customer"} — PKR ${latestOrder.total}`,
              { duration: 8000, position: "top-right" }
            );
          }
        }
      } catch (_) {}
    }, 15000);

    return () => clearInterval(interval);
  }, []);
}
