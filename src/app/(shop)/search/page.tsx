import { getPayloadClient } from "@/lib/payload";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";
import type { Metadata } from "next";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Поиск",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let products: Product[] = [];

  if (q && q.trim()) {
    try {
      const payload = await getPayloadClient();
      const result = await payload.find({
        collection: "products",
        where: {
          and: [
            { status: { equals: "published" } },
            { name: { like: q.trim() } },
          ],
        },
        limit: 24,
        depth: 2,
      });
      products = result.docs as unknown as Product[];
    } catch {
      products = [];
    }
  }

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      {/* Search form */}
      <form action="/search" method="get" className="mb-8 max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Поиск товаров..."
            autoFocus
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border bg-card text-base focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-colors"
          />
        </div>
      </form>

      {q ? (
        <>
          <p className="text-sm text-muted-foreground mb-6">
            {products.length > 0
              ? `Найдено ${products.length} товаров по запросу «${q}»`
              : `Ничего не найдено по запросу «${q}»`}
          </p>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Попробуйте другой запрос или перейдите в каталог</p>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-muted-foreground py-16">Введите запрос для поиска</p>
      )}
    </div>
  );
}
