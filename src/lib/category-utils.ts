import type { Category } from "@/types";

export function getCategoryFromProduct(
  category: Category | string | undefined,
): Category | null {
  if (!category || typeof category === "string") {
    return null;
  }
  return category;
}
