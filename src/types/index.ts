export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  filename?: string;
  thumbnailURL?: string;
  sizes?: Record<string, { url?: string; filename?: string; width?: number; height?: number }>;
}

export interface ProductVariant {
  name: string;
  value: string;
  priceModifier?: number;
  stock?: number;
}

export interface ProductAttribute {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: unknown;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  images: { image: ProductImage }[];
  category: Category | string;
  brand?: string;
  sku?: string;
  stock: number;
  variants?: ProductVariant[];
  attributes?: ProductAttribute[];
  tags?: { tag: string }[];
  status: "draft" | "published" | "archived";
  featured?: boolean;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: ProductImage;
  parent?: Category | string;
  seo?: {
    title?: string;
    description?: string;
  };
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  slug: string;
  quantity: number;
  variantName?: string;
  variantValue?: string;
}

export interface Address {
  label?: string;
  firstName: string;
  lastName: string;
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: "customer" | "admin";
  addresses?: Address[];
  wishlist?: (Product | string)[];
}

export interface Order {
  id: string;
  orderNumber: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  customer?: User | string;
  email: string;
  phone?: string;
  items: {
    product: Product | string;
    name: string;
    price: number;
    quantity: number;
    variantName?: string;
    variantValue?: string;
  }[];
  shippingAddress: Address;
  subtotal: number;
  shipping: number;
  discount?: number;
  total: number;
  paymentStatus: "unpaid" | "paid" | "refunded";
  stripePaymentIntentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
