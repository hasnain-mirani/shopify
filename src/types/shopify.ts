/**
 * Shopify Storefront API type definitions.
 *
 * These interfaces intentionally model only the fields we consume in the app.
 * Extend them as additional fields are queried.
 */

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
}

export interface ShopifyEdge<T> {
  cursor?: string;
  node: T;
}

export interface ShopifyConnection<T> {
  edges: Array<ShopifyEdge<T>>;
  pageInfo?: ShopifyPageInfo;
  nodes?: T[];
}

export interface ShopifySEO {
  title?: string | null;
  description?: string | null;
}

export interface ShopifyImage {
  id?: string;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface ShopifyOption {
  id: string;
  name: string;
  values: string[];
}

export interface ShopifySelectedOption {
  name: string;
  value: string;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  sku?: string | null;
  selectedOptions: ShopifySelectedOption[];
  price: ShopifyMoney;
  compareAtPrice?: ShopifyMoney | null;
  image?: ShopifyImage | null;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  tags: string[];
  vendor?: string;
  productType?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  seo?: ShopifySEO;
  options: ShopifyOption[];
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  compareAtPriceRange?: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  featuredImage?: ShopifyImage | null;
  images: ShopifyImage[];
  variants: ShopifyVariant[];
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  updatedAt?: string;
  seo?: ShopifySEO;
  image?: ShopifyImage | null;
  products: ShopifyProduct[];
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  cost: {
    totalAmount: ShopifyMoney;
    subtotalAmount?: ShopifyMoney;
    amountPerQuantity?: ShopifyMoney;
    compareAtAmountPerQuantity?: ShopifyMoney | null;
  };
  merchandise: {
    id: string;
    title: string;
    availableForSale: boolean;
    selectedOptions: ShopifySelectedOption[];
    image?: ShopifyImage | null;
    price: ShopifyMoney;
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage?: ShopifyImage | null;
    };
  };
  attributes?: Array<{ key: string; value: string }>;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  createdAt?: string;
  updatedAt?: string;
  cost: {
    totalAmount: ShopifyMoney;
    subtotalAmount: ShopifyMoney;
    totalTaxAmount?: ShopifyMoney | null;
    totalDutyAmount?: ShopifyMoney | null;
  };
  lines: ShopifyCartLine[];
  buyerIdentity?: {
    email?: string | null;
    phone?: string | null;
    countryCode?: string | null;
  };
  attributes?: Array<{ key: string; value: string }>;
}

/**
 * Raw connection shapes as returned by the Storefront API.
 * Use `removeEdgesAndNodes` to flatten these into plain arrays.
 */
export type ShopifyProductConnection = ShopifyConnection<ShopifyProduct>;
export type ShopifyVariantConnection = ShopifyConnection<ShopifyVariant>;
export type ShopifyImageConnection = ShopifyConnection<ShopifyImage>;
export type ShopifyCollectionConnection = ShopifyConnection<ShopifyCollection>;
export type ShopifyCartLineConnection = ShopifyConnection<ShopifyCartLine>;
