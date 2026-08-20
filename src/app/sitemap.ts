import { MetadataRoute } from "next";
import { getPayloadClient } from "@/lib/payload";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/catalog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/categories`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/search`, changeFrequency: "weekly", priority: 0.5 },
  ];

  try {
    const payload = await getPayloadClient();

    const [productsResult, categoriesResult] = await Promise.all([
      payload.find({
        collection: "products",
        where: { status: { equals: "published" } },
        limit: 1000,
        select: { slug: true, updatedAt: true },
      }),
      payload.find({
        collection: "categories",
        limit: 100,
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const productPages: MetadataRoute.Sitemap = productsResult.docs.map((doc) => ({
      url: `${baseUrl}/products/${(doc as { slug: string }).slug}`,
      lastModified: new Date((doc as { updatedAt: string }).updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categoryPages: MetadataRoute.Sitemap = categoriesResult.docs.map((doc) => ({
      url: `${baseUrl}/catalog?category=${(doc as { slug: string }).slug}`,
      lastModified: new Date((doc as { updatedAt: string }).updatedAt),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticPages, ...productPages, ...categoryPages];
  } catch {
    return staticPages;
  }
}
