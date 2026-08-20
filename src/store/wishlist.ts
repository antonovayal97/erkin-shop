"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  image?: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: WishlistItem) => void;
  clearWishlist: () => void;
  hasItem: (productId: string) => boolean;
  getItemCount: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          if (state.items.some((item) => item.productId === newItem.productId)) {
            return state;
          }
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      toggleItem: (item) => {
        if (get().hasItem(item.productId)) {
          get().removeItem(item.productId);
          return;
        }
        get().addItem(item);
      },

      clearWishlist: () => set({ items: [] }),

      hasItem: (productId) =>
        get().items.some((item) => item.productId === productId),

      getItemCount: () => get().items.length,
    }),
    {
      name: "wishlist-storage",
    },
  ),
);
