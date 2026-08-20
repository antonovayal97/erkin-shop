import { getPayloadClient } from "@/lib/payload";
import type { Category, ProductImage } from "@/types";

async function getCategoryIdsWithPublishedProducts(): Promise<string[]> {
  const payload = await getPayloadClient();
  const categoryIds = new Set<string>();
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const productsResult = await payload.find({
      collection: "products",
      where: { status: { equals: "published" } },
      limit: 500,
      page,
      depth: 0,
      select: { category: true },
    });

    for (const product of productsResult.docs) {
      const category = product.category;
      if (category == null) continue;

      const id =
        typeof category === "object" && category !== null && "id" in category
          ? String(category.id)
          : String(category);

      categoryIds.add(id);
    }

    hasNextPage = productsResult.hasNextPage;
    page += 1;
  }

  return Array.from(categoryIds);
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const payload = await getPayloadClient();
    const categoryIds = await getCategoryIdsWithPublishedProducts();

    if (categoryIds.length === 0) {
      return [];
    }

    const result = await payload.find({
      collection: "categories",
      where: { id: { in: categoryIds } },
      limit: 200,
      sort: "name",
      depth: 1,
    });
    return result.docs as unknown as Category[];
  } catch {
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "categories",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    });
    return (result.docs[0] as unknown as Category) ?? null;
  } catch {
    return null;
  }
}

function normalizeCategoryId(id: unknown): string {
  return String(id);
}

function getProductCategoryId(category: unknown): string | null {
  if (category == null) return null;
  return normalizeCategoryId(
    typeof category === "object" && category !== null && "id" in category
      ? category.id
      : category,
  );
}

export async function getFirstProductImagesByCategory(
  categoryIds: Array<string | number>,
): Promise<Map<string, ProductImage | undefined>> {
  const normalizedIds = categoryIds.map(normalizeCategoryId);
  const imageByCategory = new Map<string, ProductImage | undefined>(
    normalizedIds.map((id) => [id, undefined]),
  );

  if (normalizedIds.length === 0) {
    return imageByCategory;
  }

  try {
    const payload = await getPayloadClient();
    const pending = new Set(normalizedIds);
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage && pending.size > 0) {
      const productsResult = await payload.find({
        collection: "products",
        where: { status: { equals: "published" } },
        sort: "createdAt",
        limit: 500,
        page,
        depth: 2,
      });

      for (const product of productsResult.docs) {
        const categoryId = getProductCategoryId(product.category);
        if (!categoryId || !pending.has(categoryId)) continue;

        const image = product.images?.[0]?.image;
        if (typeof image === "object" && image !== null) {
          imageByCategory.set(categoryId, image as ProductImage);
        }

        pending.delete(categoryId);
      }

      hasNextPage = productsResult.hasNextPage;
      page += 1;
    }
  } catch {
    // keep undefined entries
  }

  return imageByCategory;
}

export function buildCatalogUrl(params: {
  category?: string;
  sort?: string;
  featured?: string;
  sale?: string;
  q?: string;
  page?: string;
}): string {
  const search = new URLSearchParams();

  if (params.category) search.set("category", params.category);
  if (params.sort && params.sort !== "price_asc") search.set("sort", params.sort);
  if (params.featured === "true") search.set("featured", "true");
  if (params.sale === "true") search.set("sale", "true");
  if (params.q) search.set("q", params.q);
  if (params.page && params.page !== "1") search.set("page", params.page);

  const qs = search.toString();
  return qs ? `/catalog?${qs}` : "/catalog";
}
