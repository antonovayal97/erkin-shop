"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ShoppingCart, ArrowRight, X, Phone } from "lucide-react";
import { Button, ButtonAnchor, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { WishlistButton } from "@/components/product/WishlistButton";
import { useCartStore } from "@/store/cart";
import { getCategoryFromProduct } from "@/lib/category-utils";
import { shopPhoneTelHref } from "@/lib/shop";
import { formatPrice, getDiscountPercent, cn, resolveMediaUrl } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductDetailsProps {
  product: Product;
  sellerPhone?: string;
}

export function ProductDetails({ product, sellerPhone }: ProductDetailsProps) {
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const inCart = useCartStore((s) =>
    s.items.some(
      (item) =>
        item.productId === product.id &&
        item.variantValue === (selectedVariant !== null ? product.variants?.[selectedVariant]?.value : undefined),
    ),
  );

  const images = product.images ?? [];
  const discount = getDiscountPercent(product.price, product.comparePrice ?? 0);
  const variant = selectedVariant !== null ? product.variants?.[selectedVariant] : null;
  const finalPrice = product.price + (variant?.priceModifier ?? 0);
  const inStock = (variant?.stock ?? product.stock) > 0;
  const category = getCategoryFromProduct(product.category);

  const wishlistItem = {
    productId: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    comparePrice: product.comparePrice,
    image: resolveMediaUrl(images[0]?.image),
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: finalPrice,
      image: resolveMediaUrl(images[0]?.image),
      slug: product.slug,
      quantity,
      variantName: variant?.name,
      variantValue: variant?.value,
    });
  };

  const goToCartButton = (
    <ButtonLink href="/cart" size="lg" className="min-w-0 flex-1 px-3">
      <span className="truncate">Перейти в корзину</span>
      <ArrowRight className="h-5 w-5 shrink-0" />
    </ButtonLink>
  );

  const callSellerButton = sellerPhone ? (
    <ButtonAnchor href={shopPhoneTelHref(sellerPhone)} size="lg" variant="outline" className="w-full">
      <Phone className="h-5 w-5 shrink-0" />
      Позвонить продавцу
    </ButtonAnchor>
  ) : null;

  const quantityControl = (
    <div className="flex items-center overflow-hidden rounded-xl border border-border">
      <button
        type="button"
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        className="px-3 py-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:px-4 md:py-3"
      >
        −
      </button>
      <span className="min-w-[2.5rem] px-2 py-2.5 text-center text-sm font-medium md:min-w-[3rem] md:px-4 md:py-3">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => setQuantity((q) => q + 1)}
        className="px-3 py-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:px-4 md:py-3"
      >
        +
      </button>
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-10 lg:gap-16">
      <ProductImageGallery product={product} />

      <div className="space-y-4 md:space-y-6">
        {product.brand && (
          <p className="text-xs font-semibold uppercase tracking-wider text-brand md:text-sm">
            {product.brand}
          </p>
        )}

        <div>
          {category && (
            <Link
              href={`/catalog?category=${category.slug}`}
              className="text-sm font-medium text-brand hover:underline"
            >
              {category.name}
            </Link>
          )}
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{product.name}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <span className="text-2xl font-bold md:text-4xl">{formatPrice(finalPrice)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <>
              <span className="text-base text-muted-foreground line-through md:text-xl">
                {formatPrice(product.comparePrice)}
              </span>
              <Badge variant="destructive">-{discount}%</Badge>
            </>
          )}
        </div>

        <div>
          {inStock ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              В наличии
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/25 bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-destructive/20">
                <X className="h-3 w-3" strokeWidth={3} />
              </span>
              Нет в наличии
            </span>
          )}
        </div>

        {product.variants && product.variants.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold">
              {product.variants[0].name}:{" "}
              <span className="font-normal text-muted-foreground">
                {selectedVariant !== null ? product.variants[selectedVariant].value : "Не выбран"}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedVariant(idx)}
                  disabled={v.stock === 0}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
                    selectedVariant === idx
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground",
                    v.stock === 0 && "cursor-not-allowed opacity-40 line-through",
                  )}
                >
                  {v.value}
                  {v.priceModifier && v.priceModifier !== 0 && (
                    <span className="ml-1 text-xs">
                      {v.priceModifier > 0 ? "+" : ""}
                      {formatPrice(v.priceModifier)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="hidden flex-col gap-3 md:flex">
          <div className="flex items-center gap-3">
            {inCart ? (
              goToCartButton
            ) : (
              <>
                {quantityControl}
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                >
                  <ShoppingCart className="h-5 w-5" />
                  В корзину
                </Button>
              </>
            )}

            <WishlistButton variant="details" item={wishlistItem} />
          </div>
          {callSellerButton}
        </div>

        {product.attributes && product.attributes.length > 0 && (
          <div className="border-t border-border pt-4 md:pt-6">
            <h3 className="mb-3 text-sm font-semibold">Характеристики</h3>
            <dl className="space-y-2">
              {product.attributes.map((attr, idx) => (
                <div key={idx} className="flex justify-between gap-4 text-sm">
                  <dt className="shrink-0 text-muted-foreground">{attr.key}</dt>
                  <dd className="min-w-0 break-words text-right font-medium">{attr.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {inCart ? (
              goToCartButton
            ) : (
              <>
                {quantityControl}
                <Button
                  size="lg"
                  className="min-w-0 flex-1 px-3"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                >
                  <ShoppingCart className="h-5 w-5 shrink-0" />
                  <span className="truncate">В корзину</span>
                </Button>
              </>
            )}
            <WishlistButton variant="details" item={wishlistItem} className="shrink-0 p-2.5" />
          </div>
          {callSellerButton}
        </div>
      </div>
    </div>
  );
}
