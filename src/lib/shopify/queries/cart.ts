import { CART_FRAGMENT, CART_FRAGMENT_BUNDLE } from "./fragments";

// Re-export so existing imports (e.g. from `queries/index.ts`) still resolve.
export { CART_FRAGMENT };

/**
 * Shared shape for mutation response payloads that surface `userErrors`.
 * Bubbling these up lets the UI show "Out of stock", "Invalid quantity", etc.
 */
const USER_ERRORS = /* GraphQL */ `
  userErrors {
    field
    message
    code
  }
  warnings {
    code
    message
    target
  }
`;

export const CREATE_CART_MUTATION = /* GraphQL */ `
  mutation CartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        ...CartFields
      }
      ${USER_ERRORS}
    }
  }
  ${CART_FRAGMENT_BUNDLE}
`;

export const ADD_TO_CART_MUTATION = /* GraphQL */ `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      ${USER_ERRORS}
    }
  }
  ${CART_FRAGMENT_BUNDLE}
`;

export const UPDATE_CART_MUTATION = /* GraphQL */ `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      ${USER_ERRORS}
    }
  }
  ${CART_FRAGMENT_BUNDLE}
`;

export const REMOVE_FROM_CART_MUTATION = /* GraphQL */ `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      ${USER_ERRORS}
    }
  }
  ${CART_FRAGMENT_BUNDLE}
`;

export const GET_CART_QUERY = /* GraphQL */ `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
  ${CART_FRAGMENT_BUNDLE}
`;
