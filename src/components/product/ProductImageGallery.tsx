"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, FreeMode, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { bindSwiperNavigation } from "@/lib/swiper-navigation";
import { resolveMediaUrl } from "@/lib/utils";
import type { Product } from "@/types";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";

interface ProductImageGalleryProps {
  product: Product;
}

const galleryFrameClass =
  "product-gallery-main relative mx-auto overflow-hidden rounded-xl border border-border bg-card md:rounded-2xl";

export function ProductImageGallery({ product }: ProductImageGalleryProps) {
  const [mounted, setMounted] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const mainSwiperRef = useRef<SwiperType | null>(null);
  const images = product.images ?? [];
  const hasMultiple = images.length > 1;
  const firstImageUrl = resolveMediaUrl(images[0]?.image, "tablet");

  const updateSwipers = () => {
    mainSwiperRef.current?.update();
    if (thumbsSwiper && !thumbsSwiper.destroyed) {
      thumbsSwiper.update();
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    window.addEventListener("resize", updateSwipers);
    window.addEventListener("orientationchange", updateSwipers);

    return () => {
      window.removeEventListener("resize", updateSwipers);
      window.removeEventListener("orientationchange", updateSwipers);
    };
  }, [mounted, thumbsSwiper]);

  return (
    <div className="w-full space-y-2 md:space-y-3">
      <div className={galleryFrameClass}>
        {images.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ShoppingCart className="h-16 w-16 opacity-20" />
          </div>
        ) : (
          <>
            <div className="absolute inset-0">
              {firstImageUrl ? (
                <Image
                  src={firstImageUrl}
                  alt={images[0]?.image?.alt ?? product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 280px, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <ShoppingCart className="h-16 w-16 opacity-20" />
                </div>
              )}
            </div>

            {mounted && (
              <div className="absolute inset-0 z-10 bg-card">
                {hasMultiple && (
                  <>
                    <button
                      ref={prevRef}
                      type="button"
                      className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-card/80 p-2 text-foreground backdrop-blur transition-colors hover:bg-card disabled:opacity-30 md:left-3 md:flex"
                      aria-label="Предыдущее фото"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      ref={nextRef}
                      type="button"
                      className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-card/80 p-2 text-foreground backdrop-blur transition-colors hover:bg-card disabled:opacity-30 md:right-3 md:flex"
                      aria-label="Следующее фото"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                <Swiper
                  modules={[Navigation, Thumbs, FreeMode, Pagination]}
                  thumbs={{
                    swiper:
                      thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
                  }}
                  observer
                  observeParents
                  resizeObserver
                  watchOverflow
                  autoHeight={false}
                  navigation={hasMultiple}
                  pagination={
                    hasMultiple
                      ? {
                          clickable: true,
                          dynamicBullets: images.length > 5,
                        }
                      : false
                  }
                  spaceBetween={0}
                  className="h-full w-full"
                  onSwiper={(swiper) => {
                    mainSwiperRef.current = swiper;
                  }}
                  onInit={(swiper) => {
                    bindSwiperNavigation(swiper, prevRef.current, nextRef.current);
                    swiper.update();
                  }}
                >
                  {images.map((img, idx) => {
                    const url = resolveMediaUrl(img.image, "tablet");
                    return (
                      <SwiperSlide key={idx} className="!h-full">
                        <div className="relative h-full w-full">
                          {url ? (
                            <Image
                              src={url}
                              alt={img.image?.alt ?? product.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 280px, 50vw"
                              priority={idx === 0}
                              onLoad={updateSwipers}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                              <ShoppingCart className="h-16 w-16 opacity-20" />
                            </div>
                          )}
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </div>
            )}
          </>
        )}
      </div>

      {mounted && hasMultiple && (
        <Swiper
          modules={[FreeMode, Thumbs]}
          onSwiper={setThumbsSwiper}
          observer
          observeParents
          resizeObserver
          spaceBetween={8}
          slidesPerView="auto"
          freeMode
          watchSlidesProgress
          watchOverflow
          className="product-gallery-thumbs hidden md:block"
        >
          {images.map((img, idx) => {
            const thumbUrl = resolveMediaUrl(img.image, "thumbnail");
            return (
              <SwiperSlide
                key={idx}
                style={{ width: 64, height: 64 }}
                className="cursor-pointer"
              >
                <div className="product-gallery-thumb relative h-full w-full overflow-hidden rounded-lg border-2 border-border transition-colors">
                  {thumbUrl && (
                    <Image
                      src={thumbUrl}
                      alt={img.image?.alt ?? product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
    </div>
  );
}
