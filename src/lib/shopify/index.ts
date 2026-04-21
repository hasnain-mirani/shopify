export {
  ShopifyError,
  shopifyFetch,
  removeEdgesAndNodes,
  formatMoney,
} from "./client";
export type {
  ShopifyFetchOptions,
  ShopifyFetchResult,
} from "./client";

export {
  TAGS,
  normalizeCart,
  normalizeCollection,
  normalizeProduct,
  normalizeProducts,
} from "./normalizers";

export * from "./queries";

export {
  getProducts,
  getProductByHandle,
  getProductRecommendations,
  getCollections,
  getCollectionProducts,
  searchProducts,
} from "./actions";
export type { GetProductsParams } from "./actions";

export {
  createCart,
  addToCart,
  updateCartLines,
  removeFromCart,
  getCart,
} from "./cart-actions";

export type * from "@/types/shopify";
