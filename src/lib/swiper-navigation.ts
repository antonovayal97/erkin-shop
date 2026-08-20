import type { Swiper as SwiperType } from "swiper";
import type { NavigationOptions } from "swiper/types";

export function bindSwiperNavigation(
  swiper: SwiperType,
  prevEl: HTMLElement | null,
  nextEl: HTMLElement | null,
) {
  if (!prevEl || !nextEl) return;

  const navigation = swiper.params.navigation as NavigationOptions | boolean | undefined;
  if (!navigation || typeof navigation === "boolean") return;

  navigation.prevEl = prevEl;
  navigation.nextEl = nextEl;

  if (swiper.navigation.initialized) {
    swiper.navigation.destroy();
  }

  swiper.navigation.init();
  swiper.navigation.update();
}
