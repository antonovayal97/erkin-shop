import Link from "next/link";
import { getPayloadClient } from "@/lib/payload";
import { getAllCategories, getCategoryBySlug, buildCatalogUrl } from "@/lib/categories";
import { ProductCard } from "@/components/product/ProductCard";
import { CategorySidebar } from "@/components/catalog/CategorySidebar";
import { ButtonLink } from "@/components/ui/Button";
import type { Where } from "payload";
import type { Product } from "@/types";
import type { Metadata } from "next";

interface CatalogPageProps {
  searchParams: Promise<{
    category?: string;
    featured?: string;
    sale?: string;
    sort?: string;
    page?: string;
    q?: string;
  }>;
}

async function getProducts(params: Awaited<CatalogPageProps["searchParams"]>) {
  try {
    const payload = await getPayloadClient();
    const where: Where[] = [{ status: { equals: "published" } }];

    if (params.category) {
      const category = await getCategoryBySlug(params.category);
      if (category) {
        where.push({ category: { equals: category.id } });
      }
    }

    if (params.featured === "true") {
      where.push({ featured: { equals: true } });
    }

    if (params.sale === "true") {
      where.push({ comparePrice: { exists: true } });
    }

    if (params.q) {
      where.push({ name: { like: params.q } });
    }

    const sortMap: Record<string, string> = {
      price_asc: "price",
      price_desc: "-price",
    };

    const result = await payload.find({
      collection: "products",
      where: { and: where },
      sort: sortMap[params.sort ?? "price_asc"] ?? "price",
      page: Number(params.page ?? 1),
      limit: 24,
      depth: 2,
    });

    return result;
  } catch {
    return { docs: [], totalDocs: 0, totalPages: 1, page: 1 };
  }
}

const sortOptions: Array<{ value: string; label: string }> = [
  { value: "price_asc", label: "Дешевле" },
  { value: "price_desc", label: "Дороже" },
];

export async function generateMetadata({
  searchParams,
}: CatalogPageProps): Promise<Metadata> {
  const params = await searchParams;

  if (params.category) {
    const category = await getCategoryBySlug(params.category);
    if (category) {
      return {
        title: category.seo?.title ?? category.name,
        description:
          category.seo?.description ??
          category.description ??
          `Товары в категории «${category.name}»`,
      };
    }
  }

  if (params.sale === "true") {
    return {
      title: "Скидки",
      description: "Товары со скидкой в нашем магазине",
    };
  }

  if (params.featured === "true") {
    return {
      title: "Хиты продаж",
      description: "Популярные товары нашего магазина",
    };
  }

  return {
    title: "Каталог",
    description: "Все товары нашего магазина",
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const [productsResult, categories, activeCategory] = await Promise.all([
    getProducts(params),
    getAllCategories(),
    params.category ? getCategoryBySlug(params.category) : Promise.resolve(null),
  ]);

  const products = productsResult.docs as unknown as Product[];

  const pageTitle = activeCategory
    ? activeCategory.name
    : params.sale === "true"
      ? "Скидки"
      : params.featured === "true"
        ? "Хиты продаж"
        : params.q
          ? `Поиск: ${params.q}`
          : "Каталог";

  const pageDescription =
    activeCategory?.description ??
    (params.sale === "true"
      ? "Лучшие предложения со скидкой"
      : params.featured === "true"
        ? "Популярные товары"
        : null);

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {categories.length > 0 && (
          <div className="hidden lg:block lg:w-56 flex-shrink-0">
            <CategorySidebar
              categories={categories}
              activeSlug={params.category}
              searchParams={params}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
              {pageDescription && (
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  {pageDescription}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-0.5">
                {productsResult.totalDocs} товаров
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {sortOptions.map((opt) => (
                <Link
                  key={opt.value}
                  href={buildCatalogUrl({ ...params, sort: opt.value, page: undefined })}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    (params.sort ?? "price_asc") === opt.value
                      ? "bg-secondary text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {productsResult.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: productsResult.totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <Link
                        key={p}
                        href={buildCatalogUrl({ ...params, page: String(p) })}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors ${
                          Number(productsResult.page) === p
                            ? "bg-primary text-primary-foreground font-medium"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {p}
                      </Link>
                    ),
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-xl font-semibold">Товары не найдены</p>
              <p className="text-sm text-muted-foreground mt-2 mb-6">
                Попробуйте выбрать другую категорию или сбросить фильтры
              </p>
              <ButtonLink variant="outline" href="/catalog">
                Сбросить фильтры
              </ButtonLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
