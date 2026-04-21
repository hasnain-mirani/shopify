import { IMAGE_FRAGMENT, PRODUCT_FRAGMENT_BUNDLE } from "./fragments";

/**
 * List of storefront collections for nav / landing grids.
 */
export const COLLECTIONS_QUERY = /* GraphQL */ `
  query Collections($first: Int = 12) {
    collections(first: $first, sortKey: UPDATED_AT) {
      edges {
        node {
          id
          handle
          title
          description
          updatedAt
          image {
            ...ImageFields
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

/**
 * Collection detail: metadata + paginated products using the canonical
 * `ProductFields` so rendering is uniform across PLP / search / collection.
 * The bundle already includes `ImageFields` and `SeoFields`, so we don't
 * need to append them again — doing so would duplicate the fragment names
 * and Shopify would reject the document.
 */
export const COLLECTION_PRODUCTS_QUERY = /* GraphQL */ `
  query CollectionProducts(
    $handle: String!
    $first: Int = 24
    $after: String
    $sortKey: ProductCollectionSortKeys = COLLECTION_DEFAULT
    $reverse: Boolean = false
    $filters: [ProductFilter!]
  ) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      updatedAt
      seo {
        ...SeoFields
      }
      image {
        ...ImageFields
      }
      products(
        first: $first
        after: $after
        sortKey: $sortKey
        reverse: $reverse
        filters: $filters
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
  }
  ${PRODUCT_FRAGMENT_BUNDLE}
`;
