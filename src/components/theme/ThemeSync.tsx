"use client";

import { useLayoutEffect } from "react";
import { applyTheme, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

export function ThemeSync() {
  useLayoutEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored !== "light" && stored !== "dark") return;

    const current = document.documentElement.getAttribute("data-theme");
    if (stored !== current) {
      applyTheme(stored as Theme);
    }
  }, []);

  return null;
}
