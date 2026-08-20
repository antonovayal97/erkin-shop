"use client";

import { useRef } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { bindSwiperNavigation } from "@/lib/swiper-navigation";
import type { Category } from "@/types";

import "swiper/css";
import "swiper/css/navigation";

interface CategorySliderProps {
  categories: Category[];
}

export function CategorySlider({ categories }: CategorySliderProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const canNavigate = categories.length > 4;

  if (categories.length === 0) return null;

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
        modules={[Navigation, A11y]}
        spaceBetween={12}
        slidesPerView={1.6}
        watchOverflow
        nested
        touchStartPreventDefault={false}
        navigation={canNavigate}
        onInit={(swiper) => {
          bindSwiperNavigation(swiper, prevRef.current, nextRef.current);
        }}
        breakpoints={{
          480: { slidesPerView: 2.4, spaceBetween: 12 },
          640: { slidesPerView: 3, spaceBetween: 12 },
          768: { slidesPerView: 4, spaceBetween: 12 },
          1024: { slidesPerView: 6, spaceBetween: 12 },
        }}
      >
        {categories.map((category) => (
          <SwiperSlide key={category.id} className="!h-auto">
            <Link
              href={`/catalog?category=${category.slug}`}
              className="group flex h-full min-h-14 items-center justify-center rounded-xl border border-border bg-card p-4 text-center transition-all duration-200 hover:border-brand/40 hover:bg-brand/5"
            >
              <p className="text-sm font-medium transition-colors group-hover:text-brand">
                {category.name}
              </p>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
