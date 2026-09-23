import type { YoulaCategory, YoulaProductDetails, YoulaProductListItem, YoulaStoreInfo } from "./types";

const GRAPHQL_URL = "https://api-gw.youla.ru/graphql";
const PRODUCT_API_URL = "https://api.youla.io/api/v1/product";
const USER_API_URL = "https://api.youla.io/api/v1/user";
const PRODUCTS_LIST_API_URL = "https://api.youla.io/api/v1/products";
const CATEGORY_API_URL = "https://api.youla.io/api/v1/categories";
const DEFAULT_STORE_URL = "https://youla.ru/user/66572765da5c52f04a0592bf/";

const REQUEST_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; ShopImporter/1.0)",
  Accept: "application/json",
  Referer: DEFAULT_STORE_URL,
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

async function graphqlRequest<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      ...REQUEST_HEADERS,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Youla GraphQL HTTP ${response.status}`);
  }

  const payload = (await response.json()) as GraphQLResponse<T>;

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }

  if (!payload.data) {
    throw new Error("Youla GraphQL returned empty data");
  }

  return payload.data;
}

export type YoulaReferenceKind = "store" | "user";

export function extractStoreId(storeUrl: string): string {
  const match = storeUrl.match(/\/(?:store|user)\/([a-f0-9]{24})/i);
  if (!match) {
    throw new Error("Некорректная ссылка на магазин Youla");
  }
  return match[1];
}

export function extractReferenceKind(storeUrl: string): YoulaReferenceKind {
  const match = storeUrl.match(/\/(store|user)\/[a-f0-9]{24}/i);
  if (!match) {
    throw new Error("Некорректная ссылка на магазин Youla");
  }
  return match[1].toLowerCase() === "user" ? "user" : "store";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function restRequest<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: REQUEST_HEADERS });

  if (!response.ok) {
    throw new Error(`Youla REST API HTTP ${response.status} for ${url}`);
  }

  return (await response.json()) as T;
}

export async function fetchStoreInfo(storeId: string): Promise<YoulaStoreInfo> {
  const query = `
    query Store($storeId: String!, $isLoggedIn: Boolean!, $isStoreOwner: Boolean!) {
      store(filter: {id: $storeId}) {
        id
        info {
          id
          title
          subtitle
          description
          logo { url }
        }
        subscription @include(if: $isLoggedIn) { isSubscribed }
        hasDrafts @include(if: $isStoreOwner)
      }
    }
  `;

  const data = await graphqlRequest<{
    store: {
      id: string;
      info: {
        title: string;
        subtitle?: string;
        description?: string;
        logo?: { url?: string };
      };
    };
  }>(query, {
    storeId,
    isLoggedIn: false,
    isStoreOwner: false,
  });

  return {
    id: data.store.id,
    title: data.store.info.title,
    subtitle: data.store.info.subtitle,
    description: data.store.info.description,
    logoUrl: data.store.info.logo?.url,
  };
}

export async function fetchStoreCategories(storeId: string): Promise<YoulaCategory[]> {
  const query = `
    query StoreCategories($storeId: String!, $isLoggedIn: Boolean!, $isStoreOwner: Boolean!) {
      store(filter: {id: $storeId}) {
        allCategories {
          categories {
            id
            parentId
            level
            title
            slug
            order
          }
        }
        subscription @include(if: $isLoggedIn) { isSubscribed }
        hasDrafts @include(if: $isStoreOwner)
      }
    }
  `;

  const data = await graphqlRequest<{
    store: {
      allCategories: {
        categories: YoulaCategory[];
      };
    };
  }>(query, {
    storeId,
    isLoggedIn: false,
    isStoreOwner: false,
  });

  return data.store.allCategories.categories.filter((category) => {
    const title = category.title.trim().toLowerCase();
    return title !== "все категории" && title !== "все объявления категории";
  });
}

interface StoreBoardNode {
  id: string;
  name: string;
  url?: string;
  images?: { url: string }[];
  price?: {
    realPrice?: { price?: number };
    origPrice?: { price?: number };
  };
}

export async function fetchStoreProductList(storeId: string): Promise<YoulaProductListItem[]> {
  const query = `
    query StoreBoard($storeId: String!, $cursor: Cursor!) {
      store(filter: {id: $storeId}) {
        allProducts(params: {}, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              ... on Product {
                id
                name
                url
                images { url }
                price {
                  realPrice { price }
                  origPrice { price }
                }
              }
            }
          }
        }
      }
    }
  `;

  const products: YoulaProductListItem[] = [];
  let cursor = "";

  while (true) {
    const data = await graphqlRequest<{
      store: {
        allProducts: {
          pageInfo: { hasNextPage: boolean; endCursor?: string | null };
          edges: { node: StoreBoardNode }[];
        };
      };
    }>(query, { storeId, cursor });

    const batch = data.store.allProducts.edges
      .map((edge) => edge.node)
      .filter((node) => node.id && node.name);

    for (const node of batch) {
      const priceKopecks = node.price?.realPrice?.price ?? 0;
      const compareKopecks = node.price?.origPrice?.price;
      products.push({
        id: node.id,
        name: node.name.trim(),
        url: node.url,
        price: priceKopecks / 100,
        comparePrice:
          compareKopecks && compareKopecks > priceKopecks ? compareKopecks / 100 : undefined,
        imageUrls: (node.images ?? []).map((image) => image.url).filter(Boolean),
      });
    }

    if (!data.store.allProducts.pageInfo.hasNextPage) {
      break;
    }

    cursor = data.store.allProducts.pageInfo.endCursor ?? "";
  }

  return products;
}

interface YoulaProductApiResponse {
  data: {
    id: string;
    name: string;
    url?: string;
    price?: number;
    discounted_price?: number;
    description?: string;
    category?: number;
    subcategory?: number;
    images?: { url: string }[];
    fields?: { name?: string; title?: string; value?: string }[];
    attributes?: { name?: string; title?: string; value?: string }[];
  };
}

export async function fetchProductDetails(productId: string): Promise<YoulaProductDetails> {
  const response = await fetch(`${PRODUCT_API_URL}/${productId}`, {
    headers: REQUEST_HEADERS,
  });

  if (!response.ok) {
    throw new Error(`Youla product API HTTP ${response.status} for ${productId}`);
  }

  const payload = (await response.json()) as YoulaProductApiResponse;
  const product = payload.data;
  const priceKopecks = product.discounted_price ?? product.price ?? 0;
  const compareKopecks =
    product.price && product.discounted_price && product.price > product.discounted_price
      ? product.price
      : undefined;

  const attributes = [...(product.fields ?? []), ...(product.attributes ?? [])]
    .map((field) => ({
      key: (field.title || field.name || "").trim(),
      value: (field.value || "").trim(),
    }))
    .filter((field) => field.key && field.value);

  return {
    id: product.id,
    name: product.name.trim(),
    url: product.url,
    price: priceKopecks / 100,
    comparePrice: compareKopecks ? compareKopecks / 100 : undefined,
    imageUrls: (product.images ?? []).map((image) => image.url).filter(Boolean),
    categoryId: product.subcategory ?? product.category,
    subcategoryId: product.subcategory,
    description: product.description?.trim(),
    attributes,
  };
}

export async function fetchProductDetailsBatch(
  products: YoulaProductListItem[],
  onProgress?: (current: number, total: number) => void,
): Promise<YoulaProductDetails[]> {
  const detailed: YoulaProductDetails[] = [];

  for (let index = 0; index < products.length; index += 1) {
    const item = products[index];
    onProgress?.(index + 1, products.length);

    try {
      const details = await fetchProductDetails(item.id);
      detailed.push({
        ...item,
        ...details,
        imageUrls: details.imageUrls.length ? details.imageUrls : item.imageUrls,
      });
    } catch {
      detailed.push({
        ...item,
        description: item.name,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  return detailed;
}

interface YoulaUserApiResponse {
  data?: {
    id: string;
    name: string;
    image?: { url?: string } | null;
    description?: string;
  };
}

interface RestProductItem {
  id: string;
  name: string;
  url?: string;
  price?: number;
  discounted_price?: number;
  description?: string;
  category?: number;
  subcategory?: number;
  images?: { url: string }[];
  fields?: { name?: string; title?: string; value?: string }[];
  attributes?: { name?: string; title?: string; value?: string }[];
  is_published?: boolean;
  is_sold?: boolean;
  is_archived?: boolean;
  is_deleted?: boolean;
  is_blocked?: boolean;
}

function isActiveProduct(item: RestProductItem): boolean {
  return Boolean(
    item.is_published && !item.is_sold && !item.is_archived && !item.is_deleted && !item.is_blocked,
  );
}

function mapRestProduct(item: RestProductItem): YoulaProductDetails {
  const priceKopecks = item.discounted_price ?? item.price ?? 0;
  const compareKopecks =
    item.price && item.discounted_price && item.price > item.discounted_price ? item.price : undefined;
  const attributes = [...(item.fields ?? []), ...(item.attributes ?? [])]
    .map((field) => ({
      key: (field.title || field.name || "").trim(),
      value: (field.value || "").trim(),
    }))
    .filter((field) => field.key && field.value);

  return {
    id: item.id,
    name: item.name.trim(),
    url: item.url,
    price: priceKopecks / 100,
    comparePrice: compareKopecks ? compareKopecks / 100 : undefined,
    imageUrls: (item.images ?? []).map((image) => image.url).filter(Boolean),
    categoryId: item.category,
    subcategoryId: item.subcategory,
    description: item.description?.trim(),
    attributes,
  };
}

export async function fetchUserInfo(userId: string): Promise<YoulaStoreInfo> {
  const payload = await restRequest<YoulaUserApiResponse>(`${USER_API_URL}/${userId}`);
  const user = payload.data;

  if (!user?.id) {
    throw new Error("Профиль продавца Youla не найден");
  }

  return {
    id: user.id,
    title: user.name,
    description: user.description,
    logoUrl: user.image?.url,
  };
}

// Публичный REST-лист товаров продавца. Пагинация: `page` с нуля, `status=active`
// (без него выдача рандомизируется). Лимит API — 100 записей на страницу.
export async function fetchUserProductList(
  userId: string,
  onProgress?: (loaded: number) => void,
): Promise<YoulaProductDetails[]> {
  const limit = 100;
  const products = new Map<string, YoulaProductDetails>();

  for (let page = 0; ; page += 1) {
    const url = `${PRODUCTS_LIST_API_URL}?owner_id=${userId}&limit=${limit}&status=active&page=${page}`;
    const payload = await restRequest<{ data?: RestProductItem[] }>(url);
    const batch = payload.data ?? [];

    for (const item of batch) {
      if (item.id && item.name && isActiveProduct(item) && !products.has(item.id)) {
        products.set(item.id, mapRestProduct(item));
      }
    }

    onProgress?.(products.size);

    if (batch.length < limit) {
      break;
    }

    await sleep(150);
  }

  return [...products.values()];
}

interface RestCategoryApiResponse {
  data?: {
    id: number;
    name: string;
    slug?: string;
    parent_id?: number;
  };
}

// Для профиля нет магазиных категорий, поэтому собираем заголовки по
// уникальным id категорий/подкатегорий из самих товаров.
export async function fetchUserCategories(products: YoulaProductDetails[]): Promise<YoulaCategory[]> {
  const ids = new Set<number>();
  for (const product of products) {
    if (product.categoryId) ids.add(product.categoryId);
    if (product.subcategoryId) ids.add(product.subcategoryId);
  }

  const categories: YoulaCategory[] = [];

  for (const id of ids) {
    try {
      const payload = await restRequest<RestCategoryApiResponse>(`${CATEGORY_API_URL}/${id}`);
      const category = payload.data;
      if (!category || typeof category.id !== "number") {
        continue;
      }
      const parentId =
        typeof category.parent_id === "number" && category.parent_id > 0 ? category.parent_id : 0;
      categories.push({
        id: category.id,
        parentId,
        level: parentId ? 2 : 1,
        title: category.name,
        slug: category.slug ?? String(category.id),
        order: 0,
      });
      await sleep(80);
    } catch {
      // категорию без имени пропускаем: импорт откатится на категорию по умолчанию
    }
  }

  return categories;
}

export async function parseYoulaStore(
  storeUrl: string,
  onProgress?: (message: string) => void,
) {
  const referenceId = extractStoreId(storeUrl);

  // Профиль продавца (ссылка /user/...): товары — обычные объявления,
  // получаем через публичный REST API.
  if (extractReferenceKind(storeUrl) === "user") {
    onProgress?.("Загрузка информации о продавце...");
    const store = await fetchUserInfo(referenceId);

    onProgress?.("Загрузка списка товаров...");
    const products = await fetchUserProductList(referenceId, (loaded) => {
      onProgress?.(`Товаров загружено: ${loaded}`);
    });

    onProgress?.(`Загрузка категорий (${products.length})...`);
    const categories = await fetchUserCategories(products);

    return { store, categories, products };
  }

  // Магазин Youla (ссылка /store/...): основной GraphQL-путь.
  onProgress?.("Загрузка информации о магазине...");
  const store = await fetchStoreInfo(referenceId);

  onProgress?.("Загрузка категорий...");
  const categories = await fetchStoreCategories(referenceId);

  onProgress?.("Загрузка списка товаров...");
  const productList = await fetchStoreProductList(referenceId);

  onProgress?.(`Загрузка карточек товаров (${productList.length})...`);
  const products = await fetchProductDetailsBatch(productList, (current, total) => {
    onProgress?.(`Карточки товаров: ${current}/${total}`);
  });

  return { store, categories, products };
}
