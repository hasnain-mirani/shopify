"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/api-client";

/** E.164 digits for wa.me (PK local 03… → 923…). */
function toWhatsAppDigits(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("0") && d.length >= 10) d = "92" + d.slice(1);
  return d;
}

export function WhatsAppButton() {
  const [number, setNumber] = useState("03006760473");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    api.settings
      .get()
      .then((s) => {
        if (s.whatsapp_number?.trim()) setNumber(s.whatsapp_number.trim());
      })
      .catch(() => {});
  }, []);

  const href = "https://wa.me/" + toWhatsAppDigits(number);

  /** Portal → document.body so parent flex/transform never breaks `fixed`. */
  const fab = (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="Chat on WhatsApp"
      aria-label="Chat with us on WhatsApp"
      className="wa-fab flex h-14 w-14 items-center justify-center rounded-full p-0 text-white shadow-lg transition-transform duration-300 hover:scale-110 motion-reduce:transition-none motion-reduce:hover:scale-100"
      style={{
        position: "fixed",
        right: "max(1rem, env(safe-area-inset-right, 0px))",
        bottom: "max(1.25rem, calc(0.5rem + env(safe-area-inset-bottom, 0px)))",
        left: "auto",
        top: "auto",
        zIndex: 2147483000,
        boxShadow: "0 4px 24px rgba(37, 211, 102, 0.45), 0 2px 8px rgba(0,0,0,0.35)",
      }}
    >
      <span className="wa-fab-ring" aria-hidden />
      <span className="wa-fab-ring wa-fab-ring--delay" aria-hidden />
      <span className="wa-fab-bounce relative z-[1] flex h-full w-full items-center justify-center rounded-full bg-[#25D366] transition-colors hover:bg-[#20bd5a]">
        <svg viewBox="0 0 24 24" fill="currentColor" className="relative z-[1] h-7 w-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </span>
    </a>
  );

  if (!mounted || typeof document === "undefined") return null;
  return createPortal(fab, document.body);
}
