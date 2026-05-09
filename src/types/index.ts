export interface Money {
  amount: string;
  currencyCode: string;
}

export interface Image {
  id?: string;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface Variant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  sku?: string | null;
  selectedOptions: Array<{ name: string; value: string }>;
  price: Money;
  compareAtPrice?: Money | null;
  image?: Image | null;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  specifications?: string;
  marketPrice?: number;
  ourPrice?: number;
  availableForSale: boolean;
  tags: string[];
  vendor?: string;
  productType?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  status?: string;
  options: Array<{ id: string; name: string; values: string[] }>;
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  compareAtPriceRange?: { minVariantPrice: Money; maxVariantPrice: Money };
  featuredImage?: Image | null;
  images: Image[];
  variants: Variant[];
  seo?: {
    title?: string;
    description?: string;
  };
  /** Optional storefront reviews for JSON-LD when available from API. */
  reviews?: { count: number; rating: number };
}

export interface CartItem {
  id: string;
  quantity: number;
  variant_id: string;
  product_title: string;
  variant_title: string;
  price: number;
  image_url: string;
}

export interface Cart {
  id: string;
  totalQuantity: number;
  items: CartItem[];
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
}

export interface OrderItem {
  id: string;
  variant_id: string;
  product_title: string;
  variant_title: string;
  price: number;
  quantity: number;
  image_url: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total: number;
  subtotal: number;
  status: string;
  financial_status: string;
  fulfillment_status: string;
  created_at: string;
  items: OrderItem[];
}

export interface AdminProductListItem {
  id: string;
  title: string;
  handle: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  totalInventory: number | null;
  vendor: string | null;
  productType: string | null;
  updatedAt: string;
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: { min: Money; max: Money };
}

export interface OrderKPIs {
  ordersToday: number;
  revenueToday: Money;
  averageOrderValue: Money;
}

export interface ShopInfo {
  id: string;
  name: string;
  email: string;
  currencyCode: string;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description?: string;
  image?: Image | null;
  seo?: {
    title?: string;
    description?: string;
  };
}

export interface ShopifyConnection<T> {
  edges?: Array<{ node: T }> | null;
  nodes?: T[] | null;
}

// Shopify-specific types for API responses
export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage?: Image | null;
    };
  };
}

export interface ShopifyCart {
  id: string;
  totalQuantity: number;
  lines: ShopifyCartLine[];
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
}

export type ShopifyImage = Image;

export interface ShopifyProduct extends Product {
  products?: Product[];
}

export type ShopifyVariant = Variant;

export interface ShopifyCollection extends Collection {
  products?: Product[];
}
