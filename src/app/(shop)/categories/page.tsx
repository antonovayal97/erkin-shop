import { getAllCategories, getFirstProductImagesByCategory } from "@/lib/categories";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { ButtonLink } from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Категории",
  description: "Все категории товаров нашего магазина",
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();
  const productImages = await getFirstProductImagesByCategory(
    categories.map((category) => category.id),
  );

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Категории</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {categories.length} категорий
          </p>
        </div>
        <ButtonLink variant="outline" href="/catalog">
          Весь каталог
        </ButtonLink>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              image={productImages.get(String(category.id))}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-xl font-semibold">Категории пока не добавлены</p>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            Импортируйте товары с Youla или создайте категории в админ-панели
          </p>
          <ButtonLink href="/admin">Открыть Admin Panel</ButtonLink>
        </div>
      )}
    </div>
  );
}
