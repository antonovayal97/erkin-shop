import { getAllCategories } from "@/lib/categories";
import { Header } from "./Header";

export async function ShopHeader() {
  const categories = await getAllCategories();
  return <Header categories={categories} />;
}
