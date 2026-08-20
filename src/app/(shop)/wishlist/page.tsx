import type { Metadata } from "next";
import { WishlistContent } from "@/components/wishlist/WishlistContent";

export const metadata: Metadata = {
  title: "Избранное",
  description: "Сохранённые товары",
};

export default function WishlistPage() {
  return <WishlistContent />;
}
