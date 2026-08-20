"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlistStore, type WishlistItem } from "@/store/wishlist";

interface WishlistButtonProps {
  item: WishlistItem;
  variant?: "card" | "details";
  className?: string;
}

export function WishlistButton({
  item,
  variant = "card",
  className,
}: WishlistButtonProps) {
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const hasItem = useWishlistStore((s) => s.hasItem(item.productId));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const active = mounted && hasItem;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleItem(item);
      }}
      className={cn(
        variant === "card" &&
          "absolute top-2 right-2 p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0",
        variant === "card" &&
          (active
            ? "bg-destructive text-white opacity-100"
            : "bg-card/90 backdrop-blur-sm text-muted-foreground hover:text-foreground"),
        variant === "details" &&
          "p-3 rounded-xl border border-border transition-all",
        variant === "details" &&
          (active
            ? "bg-destructive border-destructive text-white"
            : "text-muted-foreground hover:text-foreground hover:border-muted-foreground"),
        className,
      )}
      aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
      aria-pressed={active}
    >
      <Heart
        className={cn(
          variant === "card" ? "h-4 w-4" : "h-5 w-5",
          active && "fill-current",
        )}
      />
    </button>
  );
}
