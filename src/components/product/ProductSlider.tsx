"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import { ProductCard } from "@/components/product/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { bindSwiperNavigation } from "@/lib/swiper-navigation";
import type { Product } from "@/types";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface ProductSliderProps {
  products: Product[];
  showNav?: boolean;
}

export function ProductSlider({ products, showNav = true }: ProductSliderProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const canNavigate = showNav && products.length > 2;

  if (products.length === 0) return null;

  return (
    <div className="relative">
      {canNavigate && (
        <div className="absolute -top-12 right-0 z-10 hidden gap-2 sm:flex">
          <button
            ref={prevRef}
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-30"
            aria-label="Назад"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            ref={nextRef}
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-30"
            aria-label="Вперёд"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <Swiper
        modules={[Navigation, Pagination, A11y]}
        spaceBetween={12}
        slidesPerView={1.4}
        watchOverflow
        nested
        touchStartPreventDefault={false}
        navigation={canNavigate}
        noSwipingSelector="button"
        onInit={(swiper) => {
          bindSwiperNavigation(swiper, prevRef.current, nextRef.current);
        }}
        pagination={{ clickable: true }}
        breakpoints={{
          480: { slidesPerView: 2, spaceBetween: 12 },
          768: { slidesPerView: 3, spaceBetween: 16 },
          1024: { slidesPerView: 4, spaceBetween: 24 },
        }}
        className="product-slider !pb-10"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className="!h-auto">
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
