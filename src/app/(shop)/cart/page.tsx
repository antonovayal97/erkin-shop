"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { ButtonLink } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 max-w-7xl py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
        <h1 className="text-2xl font-bold mb-2">Корзина пуста</h1>
        <p className="text-muted-foreground mb-8">Добавьте товары из каталога</p>
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
          Корзина{" "}
          <span className="text-muted-foreground font-normal text-lg">
            ({items.length} товар{items.length !== 1 ? "а" : ""})
          </span>
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          Очистить корзину
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantValue}`}
              className="flex gap-4 p-4 rounded-xl border border-border bg-card"
            >
              {/* Image */}
              <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-muted-foreground opacity-40" />
                    </div>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.slug}`}
                  className="text-sm font-medium hover:text-brand transition-colors line-clamp-2"
                >
                  {item.name}
                </Link>
                {item.variantValue && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.variantName}: {item.variantValue}
                  </p>
                )}
                <p className="text-sm font-bold mt-1">{formatPrice(item.price)}</p>
              </div>

              {/* Quantity & Remove */}
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => removeItem(item.productId, item.variantValue)}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantValue)}
                    className="px-2.5 py-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm"
                  >
                    −
                  </button>
                  <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantValue)}
                    className="px-2.5 py-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm"
                  >
                    +
                  </button>
                </div>

                <p className="text-sm font-bold">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-6 rounded-2xl border border-border bg-card space-y-4">
            <h2 className="text-lg font-semibold">Итого</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Товары</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Доставка</span>
                <span className="text-green-400">Бесплатно</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
              <span>Итого</span>
              <span>{formatPrice(total)}</span>
            </div>

            <ButtonLink size="lg" className="w-full justify-center" href="/checkout">
              Оформить заказ
              <ArrowRight className="h-5 w-5" />
            </ButtonLink>

            <ButtonLink variant="outline" size="md" className="w-full justify-center" href="/catalog">
              Продолжить покупки
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
