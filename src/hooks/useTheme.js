"use client";

import { useEffect, useState } from "react";

/**
 * Light / dark theme toggle.
 *
 * Strategy:
 *   - Two themes: "light" (the default August Visum cream) and "dark"
 *     (deep ink on paper, inverted accents). The system preference is
 *     used on first visit if the user hasn't chosen yet.
 *   - Theme is persisted in localStorage under "agt_theme".
 *   - Applies as `data-theme="light" | "dark"` on `<html>` so CSS
 *     variables (defined in globals.css) can flip palettes.
 *   - Avoids a flash on first paint by inlining a tiny pre-paint script
 *     in `app/layout.jsx` that reads localStorage synchronously.
 */
const STORAGE_KEY = "agt_theme";
const THEMES = ["light", "dark"];

function isValid(t) {
  return THEMES.includes(t);
}

export function useTheme() {
  // Initial value: read from localStorage if available, else null so
  // we know to defer to system preference on the client.
  const [theme, setThemeState] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let initial = null;
    try {
      initial = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* localStorage unavailable */
    }
    if (initial && isValid(initial)) {
      setThemeState(initial);
    } else if (typeof window !== "undefined" && window.matchMedia) {
      initial = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      setThemeState(initial);
    } else {
      setThemeState("light");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || typeof document === "undefined") return;
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme, ready]);

  const setTheme = (next) => {
    if (isValid(next)) setThemeState(next);
  };

  const toggle = () => setThemeState((t) => (t === "dark" ? "light" : "dark"));

  return { theme, ready, setTheme, toggle, themes: THEMES };
}

export default useTheme;
