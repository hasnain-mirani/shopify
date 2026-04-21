/**
 * Shared GraphQL fragments used across product, collection, cart, and search
 * queries. Keeping one canonical shape makes response typing consistent.
 *
 * DESIGN RULE:
 *   Each `*_FRAGMENT` constant contains ONLY its own `fragment X on Y { ... }`
 *   declaration. It must NOT embed its dependency fragments via template
 *   interpolation — that causes duplicate `fragment X` declarations when two
 *   sibling fragments both pull in the same dependency.
 *
 *   Queries attach exactly the bundle they need (see `PRODUCT_FRAGMENT_BUNDLE`
 *   etc. below), which guarantees each fragment appears at most once in the
 *   final document Shopify parses.
 */

export const IMAGE_FRAGMENT = /* GraphQL */ `
  fragment ImageFields on Image {
    id
    url
    altText
    width
    height
  }
`;

export const MONEY_FRAGMENT = /* GraphQL */ `
  fragment MoneyFields on MoneyV2 {
    amount
    currencyCode
  }
`;

export const SEO_FRAGMENT = /* GraphQL */ `
  fragment SeoFields on SEO {
    title
    description
  }
`;

export const VARIANT_FRAGMENT = /* GraphQL */ `
  fragment VariantFields on ProductVariant {
    id
    title
    availableForSale
    quantityAvailable
    sku
    selectedOptions {
      name
      value
    }
    price {
      ...MoneyFields
    }
    compareAtPrice {
      ...MoneyFields
    }
    image {
      ...ImageFields
    }
  }
`;

export const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    tags
    vendor
    productType
    createdAt
    updatedAt
    publishedAt
    seo {
      ...SeoFields
    }
    options {
      id
      name
      values
    }
    priceRange {
      minVariantPrice {
        ...MoneyFields
      }
      maxVariantPrice {
        ...MoneyFields
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyFields
      }
      maxVariantPrice {
        ...MoneyFields
      }
    }
    featuredImage {
      ...ImageFields
    }
    images(first: 5) {
      edges {
        node {
          ...ImageFields
        }
      }
    }
    variants(first: 100) {
      edges {
        node {
          ...VariantFields
        }
      }
    }
  }
`;

export const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    createdAt
    updatedAt
    cost {
      subtotalAmount {
        ...MoneyFields
      }
      totalAmount {
        ...MoneyFields
      }
      totalTaxAmount {
        ...MoneyFields
      }
      totalDutyAmount {
        ...MoneyFields
      }
    }
    buyerIdentity {
      email
      phone
      countryCode
    }
    attributes {
      key
      value
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          attributes {
            key
            value
          }
          cost {
            totalAmount {
              ...MoneyFields
            }
            subtotalAmount {
              ...MoneyFields
            }
            amountPerQuantity {
              ...MoneyFields
            }
            compareAtAmountPerQuantity {
              ...MoneyFields
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              availableForSale
              selectedOptions {
                name
                value
              }
              price {
                ...MoneyFields
              }
              compareAtPrice {
                ...MoneyFields
              }
              image {
                ...ImageFields
              }
              product {
                id
                handle
                title
                featuredImage {
                  ...ImageFields
                }
                images(first: 1) {
                  edges {
                    node {
                      ...ImageFields
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/* ---------------------------------------------------------------------------
 *  Bundles — append exactly one of these to any query that uses the relevant
 *  top-level fragment. Each bundle lists every declaration it depends on,
 *  exactly once, in declaration order.
 * --------------------------------------------------------------------------*/

/** Attach to queries that spread `...ProductFields`. */
export const PRODUCT_FRAGMENT_BUNDLE = [
  IMAGE_FRAGMENT,
  MONEY_FRAGMENT,
  SEO_FRAGMENT,
  VARIANT_FRAGMENT,
  PRODUCT_FRAGMENT,
].join("\n");

/** Attach to queries that spread `...CartFields`. */
export const CART_FRAGMENT_BUNDLE = [
  IMAGE_FRAGMENT,
  MONEY_FRAGMENT,
  CART_FRAGMENT,
].join("\n");

/** Attach to queries that only need images (e.g. collection list). */
export const IMAGE_FRAGMENT_BUNDLE = IMAGE_FRAGMENT;
