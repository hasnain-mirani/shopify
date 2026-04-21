"use server";

import { updateTag } from "next/cache";
import { ShopifyError, shopifyFetch } from "./client";
import {
  ADD_TO_CART_MUTATION,
  CREATE_CART_MUTATION,
  GET_CART_QUERY,
  REMOVE_FROM_CART_MUTATION,
  UPDATE_CART_MUTATION,
} from "./queries";
import { TAGS, normalizeCart, type RawCart } from "./normalizers";
import type { ShopifyCart } from "@/types/shopify";

interface UserError {
  field?: string[] | null;
  message: string;
  code?: string | null;
}

interface CartMutationPayload {
  cart: RawCart | null | undefined;
  userErrors?: UserError[];
}

function assertCart(
  payload: CartMutationPayload | null | undefined,
  operation: string,
): ShopifyCart {
  if (!payload) {
    throw new ShopifyError(`Shopify returned no payload for ${operation}.`);
  }
  if (payload.userErrors && payload.userErrors.length > 0) {
    const message = payload.userErrors.map((e) => e.message).join("; ");
    throw new ShopifyError(`${operation} failed: ${message}`, {
      errors: payload.userErrors,
    });
  }
  const cart = normalizeCart(payload.cart);
  if (!cart) {
    throw new ShopifyError(`${operation} returned no cart.`);
  }
  return cart;
}

export async function createCart(): Promise<ShopifyCart> {
  const { data } = await shopifyFetch<{ cartCreate: CartMutationPayload }>({
    query: CREATE_CART_MUTATION,
    variables: { input: {} },
    tags: [TAGS.cart],
    revalidate: 0,
  });

  const cart = assertCart(data.cartCreate, "cartCreate");
  updateTag(TAGS.cart);
  return cart;
}

export async function addToCart(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>,
): Promise<ShopifyCart> {
  if (!cartId) throw new ShopifyError("addToCart: cartId is required.");
  if (!lines?.length) throw new ShopifyError("addToCart: lines must be non-empty.");

  const { data } = await shopifyFetch<{ cartLinesAdd: CartMutationPayload }>({
    query: ADD_TO_CART_MUTATION,
    variables: { cartId, lines },
    tags: [TAGS.cart],
    revalidate: 0,
  });

  const cart = assertCart(data.cartLinesAdd, "cartLinesAdd");
  updateTag(TAGS.cart);
  return cart;
}

export async function updateCartLines(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>,
): Promise<ShopifyCart> {
  if (!cartId) throw new ShopifyError("updateCartLines: cartId is required.");
  if (!lines?.length) throw new ShopifyError("updateCartLines: lines must be non-empty.");

  const { data } = await shopifyFetch<{ cartLinesUpdate: CartMutationPayload }>({
    query: UPDATE_CART_MUTATION,
    variables: { cartId, lines },
    tags: [TAGS.cart],
    revalidate: 0,
  });

  const cart = assertCart(data.cartLinesUpdate, "cartLinesUpdate");
  updateTag(TAGS.cart);
  return cart;
}

export async function removeFromCart(
  cartId: string,
  lineIds: string[],
): Promise<ShopifyCart> {
  if (!cartId) throw new ShopifyError("removeFromCart: cartId is required.");
  if (!lineIds?.length) {
    throw new ShopifyError("removeFromCart: lineIds must be non-empty.");
  }

  const { data } = await shopifyFetch<{ cartLinesRemove: CartMutationPayload }>({
    query: REMOVE_FROM_CART_MUTATION,
    variables: { cartId, lineIds },
    tags: [TAGS.cart],
    revalidate: 0,
  });

  const cart = assertCart(data.cartLinesRemove, "cartLinesRemove");
  updateTag(TAGS.cart);
  return cart;
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  if (!cartId) return null;

  const { data } = await shopifyFetch<{
    cart: RawCart | null;
  }>({
    query: GET_CART_QUERY,
    variables: { cartId },
    tags: [TAGS.cart, `${TAGS.cart}:${cartId}`],
    // Cart contents change per-user; don't cache for long.
    revalidate: 0,
  });

  return normalizeCart(data.cart);
}
