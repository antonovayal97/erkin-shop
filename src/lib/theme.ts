export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export function parseTheme(value?: string | null): Theme {
  return value === "light" ? "light" : "dark";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.cookie = `${THEME_STORAGE_KEY}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#0a0a0a" : "#f4f4f5");
}

export function getStoredTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;

  return "dark";
}
