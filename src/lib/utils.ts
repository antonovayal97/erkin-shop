import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number,
  options: { currency?: string; locale?: string } = {}
): string {
  const { currency = "RUB", locale = "ru-RU" } = options;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + "…";
}

export function getDiscountPercent(price: number, comparePrice: number): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

export function resolveMediaUrl(
  media?: {
    url?: string | null;
    filename?: string | null;
    sizes?: Record<string, { url?: string | null; filename?: string | null } | null>;
  } | null,
  preferredSize: "card" | "thumbnail" | "tablet" | "original" = "card",
): string | undefined {
  if (!media) return undefined;

  const toStaticUrl = (value?: string | null, filename?: string | null) => {
    if (filename) return `/media/${filename}`;

    if (!value) return undefined;
    if (value.startsWith("/media/")) return value;

    const apiMatch = value.match(/\/api\/media\/file\/([^/?#]+)/);
    if (apiMatch) return `/media/${apiMatch[1]}`;

    return value;
  };

  if (preferredSize !== "original") {
    const sized = media.sizes?.[preferredSize];
    const sizedUrl = toStaticUrl(sized?.url, sized?.filename);
    if (sizedUrl) return sizedUrl;
  }

  return toStaticUrl(media.url, media.filename);
}
