import { notFound } from "next/navigation";
import { getPayloadClient } from "@/lib/payload";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductDescription } from "@/components/product/ProductDescription";
import { ProductSlider } from "@/components/product/ProductSlider";
import { lexicalToPlaintext } from "@/lib/youla/lexical";
import { getShopPhone } from "@/lib/shop-settings";
import type { Product } from "@/types";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "products",
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
    });
    return (result.docs[0] as unknown as Product) ?? null;
  } catch {
    return null;
  }
}

async function getRelatedProducts(product: Product): Promise<Product[]> {
  try {
    const payload = await getPayloadClient();
    const categoryId = typeof product.category === "string"
      ? product.category
      : product.category?.id;

    const result = await payload.find({
      collection: "products",
      where: {
        and: [
          { status: { equals: "published" } },
          { category: { equals: categoryId } },
          { id: { not_equals: product.id } },
        ],
      },
      limit: 8,
      depth: 2,
    });
    return result.docs as unknown as Product[];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  const descriptionText =
    product.seo?.description ??
    lexicalToPlaintext(product.description) ??
    product.shortDescription;

  return {
    title: product.seo?.title ?? product.name,
    description: descriptionText,
    openGraph: {
      title: product.seo?.title ?? product.name,
      description: descriptionText ?? "",
      images: product.images?.[0]?.image?.url
        ? [{ url: product.images[0].image.url }]
        : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || product.status !== "published") notFound();

  const related = await getRelatedProducts(product);
  const sellerPhone = await getShopPhone();

  return (
    <div className={`container mx-auto max-w-7xl px-4 py-4 md:py-8 md:pb-8 ${sellerPhone ? "pb-44" : "pb-28"}`}>
      <ProductDetails product={product} sellerPhone={sellerPhone} />

      {Boolean(product.description) && (
        <div className="mt-8 border-t border-border pt-6 md:mt-16 md:pt-10">
          <h2 className="mb-3 text-xl font-bold md:mb-4 md:text-2xl">Описание</h2>
          <ProductDescription description={product.description} />
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-8 border-t border-border pt-6 md:mt-16 md:pt-10">
          <h2 className="mb-4 text-xl font-bold md:mb-6 md:text-2xl">Похожие товары</h2>
          <ProductSlider products={related} />
        </div>
      )}
    </div>
  );
}
