"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";
import { Toaster } from "react-hot-toast";

/**
 * Thin wrapper around `next-themes` so all theme config lives in one place.
 * Defaults: class-based strategy, follows system preference, no flash on load.
 *
 * Also mounts the global toast portal so any component (including Zustand
 * actions) can call `toast(...)` without wiring its own provider.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          className:
            "!bg-brand-900 !text-white !text-sm !rounded-full !px-4 !py-2.5 !shadow-lg",
          success: {
            iconTheme: { primary: "#f5e04a", secondary: "#0d2b14" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
          },
        }}
      />
    </NextThemesProvider>
  );
}

export default ThemeProvider;
