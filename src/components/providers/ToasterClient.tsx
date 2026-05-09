"use client";

import { Toaster } from "react-hot-toast";

/**
 * Isolated client component just for the toast portal.
 * Keeps ThemeProvider as a Server Component so next-themes' script injection
 * doesn't trigger the React "script tag in client component" warning.
 */
export function ToasterClient() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        className:
          "!bg-brand-900 !text-white !text-sm !rounded-full !px-4 !py-2.5 !shadow-lg",
        success: {
          iconTheme: { primary: "#f5a47c", secondary: "#1a0e2e" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
        },
      }}
    />
  );
}
