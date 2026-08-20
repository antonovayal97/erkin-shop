"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { ButtonLink } from "@/components/ui/Button";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export function WishlistContent() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 max-w-7xl py-20 text-center">
        <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
        <h1 className="text-2xl font-bold mb-2">Избранное пусто</h1>
        <p className="text-muted-foreground mb-8">
          Добавляйте товары в избранное, нажимая на сердечко
        </p>
        <ButtonLink href="/catalog">
          Перейти в каталог
          <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Избранное{" "}
          <span className="text-muted-foreground font-normal text-lg">
            ({items.length})
          </span>
        </h1>
        <button
          type="button"
          onClick={clearWishlist}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          Очистить избранное
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <article
            key={item.productId}
            className="flex flex-col rounded-xl border border-border bg-card overflow-hidden"
          >
            <Link href={`/products/${item.slug}`} className="relative aspect-square bg-muted">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 opacity-20" />
                </div>
              )}
            </Link>

            <div className="flex flex-1 flex-col p-4">
              <Link
                href={`/products/${item.slug}`}
                className="text-sm font-medium hover:text-brand transition-colors line-clamp-2"
              >
                {item.name}
              </Link>

              <div className="mt-2 flex items-center gap-2">
                <span className="text-base font-bold">{formatPrice(item.price)}</span>
                {item.comparePrice && item.comparePrice > item.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(item.comparePrice)}
                  </span>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                {cartItems.some((cartItem) => cartItem.productId === item.productId) ? (
                  <ButtonLink href="/cart" size="sm" variant="outline" className="flex-1">
                    Перейти в корзину
                    <ArrowRight className="h-4 w-4" />
                  </ButtonLink>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      addItem({
                        productId: item.productId,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        slug: item.slug,
                        quantity: 1,
                      })
                    }
                  >
                    <ShoppingCart className="h-4 w-4" />
                    В корзину
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="p-2 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                  aria-label="Удалить из избранного"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
