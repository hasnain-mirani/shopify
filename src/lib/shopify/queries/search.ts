import { IMAGE_FRAGMENT, PRODUCT_FRAGMENT_BUNDLE } from "./fragments";

/**
 * Full search results page (products grid) + predictive/autocomplete
 * suggestions for a search-as-you-type dropdown. Splitting the two lets
 * the UI render the dropdown instantly while the PLP loads.
 */
export const SEARCH_QUERY = /* GraphQL */ `
  query Search($query: String!, $first: Int = 24, $after: String) {
    products(
      first: $first
      after: $after
      query: $query
      sortKey: RELEVANCE
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
    predictiveSearch(query: $query, limit: 8) {
      queries {
        text
        styledText
      }
      products {
        id
        handle
        title
        vendor
        productType
        featuredImage {
          ...ImageFields
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
      }
      collections {
        id
        handle
        title
        image {
          ...ImageFields
        }
      }
      pages {
        id
        handle
        title
      }
      articles {
        id
        handle
        title
      }
    }
  }
  ${PRODUCT_FRAGMENT_BUNDLE}
`;

/**
 * Lighter-weight variant when you only need the autocomplete dropdown
 * (e.g. header search). Does not fetch the full products grid.
 */
export const PREDICTIVE_SEARCH_QUERY = /* GraphQL */ `
  query PredictiveSearch($query: String!, $limit: Int = 8) {
    predictiveSearch(query: $query, limit: $limit) {
      queries {
        text
        styledText
      }
      products {
        id
        handle
        title
        vendor
        productType
        featuredImage {
          ...ImageFields
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
      collections {
        id
        handle
        title
        image {
          ...ImageFields
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;
