import {
  IMAGE_FRAGMENT,
  MONEY_FRAGMENT,
  PRODUCT_FRAGMENT,
  PRODUCT_FRAGMENT_BUNDLE,
  SEO_FRAGMENT,
  VARIANT_FRAGMENT,
} from "./fragments";

/**
 * Paginated product list. Supports Shopify's ProductSortKeys + reverse order.
 * Returns the first 24 products matching the (optional) query string.
 */
export const PRODUCTS_QUERY = /* GraphQL */ `
  query Products(
    $first: Int = 24
    $after: String
    $sortKey: ProductSortKeys = BEST_SELLING
    $reverse: Boolean = false
    $query: String
  ) {
    products(
      first: $first
      after: $after
      sortKey: $sortKey
      reverse: $reverse
      query: $query
    ) {
      edges {
        cursor
        node {
          ...ProductFields
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_FRAGMENT_BUNDLE}
`;

/**
 * Product detail page query.
 * Includes `media(first: 10)` to support video / 3D model assets on PDPs.
 * `media` uses `...ImageFields` but ImageFields is already part of the
 * PRODUCT_FRAGMENT_BUNDLE, so we don't need to append it again.
 */
export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
      media(first: 10) {
        edges {
          node {
            mediaContentType
            alt
            previewImage {
              ...ImageFields
            }
            ... on MediaImage {
              id
              image {
                ...ImageFields
              }
            }
            ... on Video {
              id
              sources {
                url
                mimeType
                format
                height
                width
              }
            }
            ... on ExternalVideo {
              id
              host
              embedUrl
            }
            ... on Model3d {
              id
              sources {
                url
                mimeType
                format
              }
            }
          }
        }
      }
    }
  }
  ${PRODUCT_FRAGMENT_BUNDLE}
`;

/**
 * Related products via Shopify's built-in recommendation engine.
 */
export const PRODUCT_RECOMMENDATIONS_QUERY = /* GraphQL */ `
  query ProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      ...ProductFields
    }
  }
  ${PRODUCT_FRAGMENT_BUNDLE}
`;

/** Re-export raw fragments for ad-hoc query composition. */
export {
  PRODUCT_FRAGMENT,
  VARIANT_FRAGMENT,
  IMAGE_FRAGMENT,
  MONEY_FRAGMENT,
  SEO_FRAGMENT,
};
