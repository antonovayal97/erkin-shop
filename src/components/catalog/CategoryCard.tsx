import Image from "next/image";
import Link from "next/link";
import { Tag } from "lucide-react";
import { resolveMediaUrl } from "@/lib/utils";
import type { Category, ProductImage } from "@/types";

interface CategoryCardProps {
  category: Category;
  image?: ProductImage | null;
}

export function CategoryCard({ category, image }: CategoryCardProps) {
  const imageUrl = resolveMediaUrl(image ?? category.image, "card");

  return (
    <Link
      href={`/catalog?category=${category.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card hover:border-brand/40 hover:bg-brand/5 transition-all duration-200 overflow-hidden"
    >
      <div className="relative aspect-[4/3] bg-secondary/50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <Tag className="h-10 w-10 opacity-30" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold group-hover:text-brand transition-colors">
          {category.name}
        </h3>
        {category.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  );
}
