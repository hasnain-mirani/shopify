/**
 * GraphQL documents for the Shopify Admin API (2026-04).
 *
 * Only strings live here — execution happens via `shopifyAdminFetch` on
 * the server. Keep this file framework-agnostic so the queries can be
 * reused by server actions, route handlers, and offline jobs.
 */

/* ─── Fragments ──────────────────────────────────────────────────────── */

export const ADMIN_MONEY_FRAGMENT = /* GraphQL */ `
  fragment AdminMoney on MoneyV2 {
    amount
    currencyCode
  }
`;

export const ADMIN_ORDER_FRAGMENT = /* GraphQL */ `
  fragment AdminOrder on Order {
    id
    name
    createdAt
    processedAt
    displayFinancialStatus
    displayFulfillmentStatus
    customer {
      id
      displayName
      email
    }
    totalPriceSet {
      shopMoney {
        ...AdminMoney
      }
    }
    subtotalPriceSet {
      shopMoney {
        ...AdminMoney
      }
    }
    currentTotalPriceSet {
      shopMoney {
        ...AdminMoney
      }
    }
    lineItems(first: 5) {
      nodes {
        id
        title
        quantity
      }
    }
  }
`;

export const ADMIN_PRODUCT_LIST_FRAGMENT = /* GraphQL */ `
  fragment AdminProductListItem on Product {
    id
    title
    handle
    status
    totalInventory
    vendor
    productType
    updatedAt
    featuredMedia {
      preview {
        image {
          url
          altText
        }
      }
    }
    priceRangeV2 {
      minVariantPrice {
        ...AdminMoney
      }
      maxVariantPrice {
        ...AdminMoney
      }
    }
  }
`;

/* ─── Dashboard / KPIs ──────────────────────────────────────────────── */

export const ADMIN_SHOP_INFO_QUERY = /* GraphQL */ `
  query AdminShopInfo {
    shop {
      id
      name
      email
      myshopifyDomain
      currencyCode
    }
  }
`;

export const ADMIN_ORDER_KPIS_QUERY = /* GraphQL */ `
  ${ADMIN_MONEY_FRAGMENT}
  query AdminOrderKPIs($query: String!) {
    orders(first: 250, query: $query, sortKey: CREATED_AT, reverse: true) {
      nodes {
        id
        createdAt
        currentTotalPriceSet {
          shopMoney {
            ...AdminMoney
          }
        }
      }
    }
  }
`;

/* ─── Orders ─────────────────────────────────────────────────────────── */

export const ADMIN_RECENT_ORDERS_QUERY = /* GraphQL */ `
  ${ADMIN_MONEY_FRAGMENT}
  ${ADMIN_ORDER_FRAGMENT}
  query AdminRecentOrders($first: Int!, $query: String) {
    orders(first: $first, query: $query, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...AdminOrder
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/* ─── Products ───────────────────────────────────────────────────────── */

export const ADMIN_PRODUCTS_LIST_QUERY = /* GraphQL */ `
  ${ADMIN_MONEY_FRAGMENT}
  ${ADMIN_PRODUCT_LIST_FRAGMENT}
  query AdminProductsList($first: Int!, $query: String) {
    products(first: $first, query: $query, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...AdminProductListItem
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * 2026 Admin API uses `productCreate(product: ProductCreateInput!)` which
 * creates the product shell (title, description, vendor, status, tags).
 * Price / image / inventory are set via follow-up mutations.
 *
 * @see https://shopify.dev/docs/api/admin-graphql/2026-04/mutations/productCreate
 */
export const ADMIN_PRODUCT_CREATE_MUTATION = /* GraphQL */ `
  mutation AdminProductCreate($product: ProductCreateInput!) {
    productCreate(product: $product) {
      product {
        id
        title
        handle
        status
        variants(first: 1) {
          nodes {
            id
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Attach a price to the newly created product. Every product has a default
 * variant; `productVariantsBulkUpdate` is the 2026 successor of the deprecated
 * single-variant mutation.
 *
 * @see https://shopify.dev/docs/api/admin-graphql/2026-04/mutations/productVariantsBulkUpdate
 */
export const ADMIN_PRODUCT_VARIANTS_BULK_UPDATE_MUTATION = /* GraphQL */ `
  mutation AdminProductVariantsBulkUpdate(
    $productId: ID!
    $variants: [ProductVariantsBulkInput!]!
  ) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      product {
        id
      }
      productVariants {
        id
        price
        sku
        inventoryItem {
          id
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

/**
 * Permanently delete a product. Irreversible — Shopify has no undo for this.
 *
 * @see https://shopify.dev/docs/api/admin-graphql/2026-04/mutations/productDelete
 */
export const ADMIN_PRODUCT_DELETE_MUTATION = /* GraphQL */ `
  mutation AdminProductDelete($input: ProductDeleteInput!) {
    productDelete(input: $input) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Attach a media item (e.g. hero image) to a product.
 *
 * @see https://shopify.dev/docs/api/admin-graphql/2026-04/mutations/productCreateMedia
 */
export const ADMIN_PRODUCT_CREATE_MEDIA_MUTATION = /* GraphQL */ `
  mutation AdminProductCreateMedia(
    $productId: ID!
    $media: [CreateMediaInput!]!
  ) {
    productCreateMedia(productId: $productId, media: $media) {
      media {
        alt
        mediaContentType
        status
      }
      mediaUserErrors {
        field
        message
        code
      }
      product {
        id
      }
    }
  }
`;
