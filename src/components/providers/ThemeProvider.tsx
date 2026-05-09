"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function applyTheme(t: Theme): "light" | "dark" {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = t === "dark" || (t === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", isDark);
  return isDark ? "dark" : "light";
}

/**
 * Custom theme provider — replaces next-themes to avoid the React 19
 * "script tag in client component" warning that next-themes v0.4+ triggers.
 * The anti-flash script is placed directly in layout.tsx <head> instead.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme) || "system";
    setThemeState(saved);
    setResolvedTheme(applyTheme(saved));

    // Keep in sync with OS changes
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMqChange = () => {
      setThemeState((prev) => {
        if (prev === "system") setResolvedTheme(applyTheme("system"));
        return prev;
      });
    };
    mq.addEventListener("change", onMqChange);
    return () => mq.removeEventListener("change", onMqChange);
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem("theme", t);
    setResolvedTheme(applyTheme(t));
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          className:
            "!bg-card !text-foreground !text-sm !rounded-pill !border !border-border !px-4 !py-3 !shadow-elevated",
          success: {
            iconTheme: { primary: "#10b981", secondary: "#ffffff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
          },
        }}
      />
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
