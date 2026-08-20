import type { Payload } from "payload";
import { slugify } from "@/lib/utils";
import { textToLexical } from "./lexical";
import type { YoulaCategory, YoulaImportStats, YoulaParseResult, YoulaProductDetails } from "./types";

const SKIP_CATEGORY_TITLES = new Set(["все категории", "все объявления категории"]);

function categorySlug(category: YoulaCategory): string {
  const base = category.slug?.trim() || slugify(category.title);
  return base ? `${base}-${category.id}` : `category-${category.id}`;
}

function productSlug(name: string, youlaId: string): string {
  const base = slugify(name) || "product";
  return `${base}-${youlaId.slice(-8)}`;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

async function downloadImage(url: string): Promise<{ buffer: Buffer; mimeType: string; filename: string }> {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ShopImporter/1.0)" },
  });

  if (!response.ok) {
    throw new Error(`Image download failed: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

  return { buffer, mimeType: contentType, filename };
}

async function uploadProductImages(
  payload: Payload,
  product: YoulaProductDetails,
  stats: YoulaImportStats,
): Promise<{ image: string }[]> {
  const uploaded: { image: string }[] = [];
  const urls = product.imageUrls.slice(0, 8);

  for (const url of urls) {
    try {
      const file = await downloadImage(url);
      const media = await payload.create({
        collection: "media",
        data: {
          alt: truncate(product.name, 120),
        },
        file: {
          data: file.buffer,
          mimetype: file.mimeType,
          name: file.filename,
          size: file.buffer.length,
        },
      });
      uploaded.push({ image: String(media.id) });
      stats.imagesUploaded += 1;
    } catch (error) {
      stats.errors.push(`Изображение ${product.name}: ${error instanceof Error ? error.message : "ошибка"}`);
    }
  }

  return uploaded;
}

function pickImportCategories(categories: YoulaCategory[], products: YoulaProductDetails[]) {
  const usedIds = new Set<number>();

  for (const product of products) {
    if (product.subcategoryId) usedIds.add(product.subcategoryId);
    if (product.categoryId) usedIds.add(product.categoryId);
  }

  const byId = new Map(categories.map((category) => [category.id, category]));
  const selected = new Map<number, YoulaCategory>();

  for (const id of usedIds) {
    let current = byId.get(id);
    while (current) {
      if (!SKIP_CATEGORY_TITLES.has(current.title.trim().toLowerCase())) {
        selected.set(current.id, current);
      }
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }
  }

  return [...selected.values()].sort((a, b) => a.level - b.level || a.order - b.order);
}

export async function importYoulaData(
  payload: Payload,
  parsed: YoulaParseResult,
): Promise<YoulaImportStats> {
  const stats: YoulaImportStats = {
    categoriesCreated: 0,
    categoriesUpdated: 0,
    productsCreated: 0,
    productsUpdated: 0,
    productsArchived: 0,
    imagesUploaded: 0,
    errors: [],
  };

  const importCategories = pickImportCategories(parsed.categories, parsed.products);
  const categoryMap = new Map<number, string>();

  for (const category of importCategories) {
    const slug = categorySlug(category);

    const existing = await payload.find({
      collection: "categories",
      where: { youlaId: { equals: String(category.id) } },
      limit: 1,
    });

    const data = {
      name: category.title,
      slug,
      youlaId: String(category.id),
    };

    if (existing.docs[0]) {
      await payload.update({
        collection: "categories",
        id: existing.docs[0].id,
        data,
      });
      categoryMap.set(category.id, String(existing.docs[0].id));
      stats.categoriesUpdated += 1;
    } else {
      const created = await payload.create({
        collection: "categories",
        data,
      });
      categoryMap.set(category.id, String(created.id));
      stats.categoriesCreated += 1;
    }
  }

  const importedYoulaIds = new Set<string>();

  for (const product of parsed.products) {
    importedYoulaIds.add(product.id);

    try {
      const categoryYoulaId = product.subcategoryId ?? product.categoryId;
      let categoryId = categoryYoulaId ? categoryMap.get(categoryYoulaId) : undefined;

      if (!categoryId) {
        const fallback = await payload.find({
          collection: "categories",
          limit: 1,
          sort: "createdAt",
        });
        categoryId = fallback.docs[0] ? String(fallback.docs[0].id) : undefined;
      }

      if (!categoryId) {
        const created = await payload.create({
          collection: "categories",
          data: {
            name: "Прочее",
            slug: "other",
            youlaId: "fallback-other",
          },
        });
        categoryId = String(created.id);
        stats.categoriesCreated += 1;
      }

      const existing = await payload.find({
        collection: "products",
        where: { youlaId: { equals: product.id } },
        limit: 1,
        depth: 0,
      });

      const existingImages = (existing.docs[0]?.images as { image: number | string }[] | undefined) ?? [];
      const uploadedImages = product.imageUrls.length
        ? await uploadProductImages(payload, product, stats)
        : [];
      const images =
        uploadedImages.length > 0
          ? uploadedImages
          : existingImages.map((item) => ({
              image: String(typeof item.image === "object" ? (item.image as { id: string }).id : item.image),
            }));

      if (images.length === 0) {
        stats.errors.push(`Товар без изображений: ${product.name}`);
        continue;
      }

      const data = {
        name: product.name,
        slug: productSlug(product.name, product.id),
        shortDescription: truncate(product.description ?? product.name, 240),
        description: product.description ? textToLexical(product.description) : undefined,
        price: product.price,
        comparePrice: product.comparePrice,
        category: Number(categoryId),
        youlaId: product.id,
        youlaUrl: product.url ? `https://youla.ru${product.url}` : undefined,
        stock: 1,
        status: "published" as const,
        attributes: product.attributes,
        sku: `youla-${product.id}`,
        images: images.map((item) => ({ image: Number(item.image) })),
      };

      if (existing.docs[0]) {
        await payload.update({
          collection: "products",
          id: existing.docs[0].id,
          data,
        });
        stats.productsUpdated += 1;
      } else {
        await payload.create({
          collection: "products",
          data,
        });
        stats.productsCreated += 1;
      }
    } catch (error) {
      stats.errors.push(
        `Товар ${product.name}: ${error instanceof Error ? error.message : "ошибка импорта"}`,
      );
    }
  }

  const existingImported = await payload.find({
    collection: "products",
    where: { youlaId: { exists: true } },
    limit: 1000,
  });

  for (const product of existingImported.docs) {
    const youlaId = product.youlaId as string | undefined;
    if (youlaId && !importedYoulaIds.has(youlaId) && product.status !== "archived") {
      await payload.update({
        collection: "products",
        id: product.id,
        data: { status: "archived" },
      });
      stats.productsArchived += 1;
    }
  }

  return stats;
}
