import React, { createContext, useEffect, useMemo, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * ThemeProvider provides theme state (light, dark, system) and toggling helpers.
 * It reads and stores preference in localStorage and applies data-theme attribute to <html>.
 */
export const ThemeContext = createContext({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

const LOCAL_KEY = "ui.theme.preference";

/**
 * PUBLIC_INTERFACE
 * ThemeProvider component.
 * Wrap your app to enable theme switching and CSS variable tokens usage.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(LOCAL_KEY) : null;
    return saved || "system";
  });

  // Resolve to actual mode when theme = system
  const resolvedTheme = useMemo(() => {
    if (theme !== "system") return theme;
    if (typeof window === "undefined" || !window.matchMedia) return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, [theme]);

  useEffect(() => {
    // Apply data-theme to <html>
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    // Listen system changes if in system mode
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const nextResolved = mql.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", nextResolved);
    };
    mql.addEventListener?.("change", handler);
    return () => mql.removeEventListener?.("change", handler);
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light";
    });
  };

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
