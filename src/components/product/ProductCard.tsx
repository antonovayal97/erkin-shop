"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { cn, formatPrice, getDiscountPercent, resolveMediaUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { WishlistButton } from "@/components/product/WishlistButton";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const inCart = useCartStore((s) =>
    s.items.some((item) => item.productId === product.id),
  );

  const mainImage = product.images?.[0]?.image;
  const secondImage = product.images?.[1]?.image;
  const mainImageUrl = resolveMediaUrl(mainImage);
  const secondImageUrl = resolveMediaUrl(secondImage);
  const discount = getDiscountPercent(product.price, product.comparePrice ?? 0);
  const inStock = product.stock > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: mainImageUrl,
      slug: product.slug,
      quantity: 1,
    });
  };

  return (
    <article className={cn("group relative", className)}>
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-card border border-border">
          {mainImageUrl ? (
            <>
              <Image
                src={mainImageUrl}
                alt={mainImage?.alt ?? product.name}
                fill
                className={cn(
                  "object-cover transition-all duration-500",
                  secondImageUrl && "group-hover:opacity-0"
                )}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {secondImageUrl && (
                <Image
                  src={secondImageUrl}
                  alt={secondImage?.alt ?? product.name}
                  fill
                  className="object-cover opacity-0 transition-all duration-500 group-hover:opacity-100"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <ShoppingCart className="h-12 w-12 opacity-20" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <Badge variant="destructive">-{discount}%</Badge>
            )}
            {product.featured && (
              <Badge variant="default">Хит</Badge>
            )}
            {!inStock && (
              <Badge variant="outline">Нет в наличии</Badge>
            )}
          </div>

          <WishlistButton
            item={{
              productId: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              comparePrice: product.comparePrice,
              image: mainImageUrl,
            }}
          />

          {/* Quick add on hover (desktop) / go to cart when already added */}
          <div className={cn(
            "absolute bottom-2 left-2 right-2 transition-all duration-200",
            inCart
              ? "translate-y-0 opacity-100"
              : "hidden md:block translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          )}>
            {inCart ? (
              <Button
                size="sm"
                variant="secondary"
                className="w-full bg-card/90 backdrop-blur-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push("/cart");
                }}
              >
                Перейти в корзину
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                className="w-full bg-card/90 backdrop-blur-sm"
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                {inStock ? "В корзину" : "Нет в наличии"}
              </Button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 space-y-1">
          {product.brand && (
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {product.brand}
            </p>
          )}
          <h3 className="text-sm font-medium text-foreground leading-tight line-clamp-2 group-hover:text-brand transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
