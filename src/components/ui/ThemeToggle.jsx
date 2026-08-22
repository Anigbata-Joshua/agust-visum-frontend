"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

/**
 * A small light/dark mode toggle. Designed to sit in the header utility
 * row (storefront) or the merchant sidebar (merchant deck).
 *
 * `tone="light"` — for use on light backgrounds (default).
 * `tone="dark"` — for use on dark backgrounds (the merchant deck).
 */
export function ThemeToggle({ tone = "light", className }) {
  const { theme, toggle, ready } = useTheme();
  const isDark = theme === "dark";

  const palette = {
    light: "text-ink hover:bg-ink/5",
    dark: "text-off hover:bg-off/10",
  }[tone];

  return (
    <button
      onClick={toggle}
      disabled={!ready}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={cn(
        "w-10 h-10 inline-flex items-center justify-center transition-colors disabled:opacity-50",
        palette,
        className
      )}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="relative w-4 h-4">
        <Sun
          size={16}
          strokeWidth={1.5}
          className={cn(
            "absolute inset-0 transition-all duration-300",
            isDark ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
          )}
        />
        <Moon
          size={16}
          strokeWidth={1.5}
          className={cn(
            "absolute inset-0 transition-all duration-300",
            isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"
          )}
        />
      </span>
    </button>
  );
}

export default ThemeToggle;
