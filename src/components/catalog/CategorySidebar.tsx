import Link from "next/link";
import { buildCatalogUrl } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategorySidebarProps {
  categories: Category[];
  activeSlug?: string;
  searchParams: {
    sort?: string;
    featured?: string;
    sale?: string;
    q?: string;
  };
}

export function CategorySidebar({
  categories,
  activeSlug,
  searchParams,
}: CategorySidebarProps) {
  const baseParams = {
    sort: searchParams.sort,
    featured: searchParams.featured,
    sale: searchParams.sale,
    q: searchParams.q,
  };

  return (
    <aside className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-3">
        Категории
      </p>

      <Link
        href={buildCatalogUrl(baseParams)}
        className={cn(
          "block px-3 py-2 rounded-lg text-sm transition-colors",
          !activeSlug
            ? "bg-brand/10 text-brand font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
        )}
      >
        Все товары
      </Link>

      {categories.map((category) => (
        <Link
          key={category.id}
          href={buildCatalogUrl({ ...baseParams, category: category.slug })}
          className={cn(
            "block px-3 py-2 rounded-lg text-sm transition-colors",
            activeSlug === category.slug
              ? "bg-brand/10 text-brand font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-accent",
          )}
        >
          {category.name}
        </Link>
      ))}
    </aside>
  );
}
