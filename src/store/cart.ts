"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantValue?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantValue?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.productId === newItem.productId &&
              i.variantValue === newItem.variantValue
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === newItem.productId &&
                i.variantValue === newItem.variantValue
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId, variantValue) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(i.productId === productId && i.variantValue === variantValue)
          ),
        }));
      },

      updateQuantity: (productId, quantity, variantValue) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantValue);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantValue === variantValue
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "cart-storage",
    }
  )
);
