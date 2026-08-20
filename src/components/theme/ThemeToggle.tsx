"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getStoredTheme());
    setMounted(true);

    const sync = () => setTheme(getStoredTheme());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const nextTheme: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      aria-label={nextTheme === "light" ? "Включить светлую тему" : "Включить тёмную тему"}
      onClick={() => {
        applyTheme(nextTheme);
        setTheme(nextTheme);
      }}
    >
      {mounted && theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
}
