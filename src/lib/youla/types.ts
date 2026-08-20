export interface YoulaCategory {
  id: number;
  parentId: number;
  level: number;
  title: string;
  slug: string;
  order: number;
}

export interface YoulaStoreInfo {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  logoUrl?: string;
}

export interface YoulaProductListItem {
  id: string;
  name: string;
  url?: string;
  price: number;
  comparePrice?: number;
  imageUrls: string[];
  categoryId?: number;
  subcategoryId?: number;
}

export interface YoulaProductDetails extends YoulaProductListItem {
  description?: string;
  attributes?: { key: string; value: string }[];
}

export interface YoulaParseResult {
  store: YoulaStoreInfo;
  categories: YoulaCategory[];
  products: YoulaProductDetails[];
}

export interface YoulaImportStats {
  categoriesCreated: number;
  categoriesUpdated: number;
  productsCreated: number;
  productsUpdated: number;
  productsArchived: number;
  imagesUploaded: number;
  errors: string[];
}
