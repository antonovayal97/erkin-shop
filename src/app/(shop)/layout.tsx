import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import { ShopHeader } from "@/components/layout/ShopHeader";
import { Footer } from "@/components/layout/Footer";
import { ThemeSync } from "@/components/theme/ThemeSync";
import { parseTheme, THEME_STORAGE_KEY } from "@/lib/theme";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000"),
  title: {
    default: "ERKIN SHOP",
    template: "%s | ERKIN SHOP",
  },
  description: "Якутский магазин полезных вещей. Быстрая доставка, лёгкий возврат.",
  openGraph: {
    type: "website",
    siteName: "ERKIN SHOP",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const theme = parseTheme(cookieStore.get(THEME_STORAGE_KEY)?.value);

  return (
    <html
      lang="ru"
      className={inter.variable}
      data-theme={theme}
      style={{ colorScheme: theme }}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <ThemeSync />
        <ShopHeader />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
