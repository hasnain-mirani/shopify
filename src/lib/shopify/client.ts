import type { ShopifyConnection } from "@/types/shopify";

/**
 * Error thrown for any Shopify Storefront API failure
 * (network error, non-2xx response, or GraphQL `errors` in the payload).
 */
export class ShopifyError extends Error {
  readonly status?: number;
  readonly errors?: unknown[];
  readonly query?: string;

  constructor(
    message: string,
    options?: { status?: number; errors?: unknown[]; query?: string; cause?: unknown },
  ) {
    super(message);
    this.name = "ShopifyError";
    this.status = options?.status;
    this.errors = options?.errors;
    this.query = options?.query;
    if (options?.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

export interface ShopifyFetchOptions {
  query: string;
  variables?: Record<string, unknown>;
  tags?: string[];
  /** Seconds. Use 0 to disable caching, or omit to use defaults. */
  revalidate?: number;
}

export interface ShopifyFetchResult<T> {
  data: T;
  errors?: unknown[];
}

interface ShopifyGraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; [key: string]: unknown }>;
}

function getEndpoint(): string {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const version = process.env.SHOPIFY_STOREFRONT_API_VERSION;

  if (!domain) {
    throw new ShopifyError(
      "Missing env var NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN (e.g. your-store.myshopify.com).",
    );
  }
  if (!version) {
    throw new ShopifyError(
      "Missing env var SHOPIFY_STOREFRONT_API_VERSION (e.g. 2025-01).",
    );
  }

  return `https://${domain}/api/${version}/graphql.json`;
}

function getAccessToken(): string {
  const token =
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!token) {
    throw new ShopifyError(
      "Missing env var SHOPIFY_STOREFRONT_ACCESS_TOKEN (public Storefront API access token).",
    );
  }
  return token;
}

/**
 * Typed wrapper around the Shopify Storefront GraphQL API.
 *
 * Integrates with Next.js fetch cache via `next.tags` and `next.revalidate`,
 * so callers can tag requests for on-demand revalidation with `revalidateTag`.
 */
export async function shopifyFetch<T>({
  query,
  variables,
  tags,
  revalidate,
}: ShopifyFetchOptions): Promise<ShopifyFetchResult<T>> {
  const endpoint = getEndpoint();
  const token = getAccessToken();

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
      next: { tags, revalidate },
    });
  } catch (cause) {
    throw new ShopifyError(
      `Network error while contacting Shopify Storefront API: ${
        cause instanceof Error ? cause.message : String(cause)
      }`,
      { cause, query },
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ShopifyError(
      `Shopify Storefront API responded with ${response.status} ${response.statusText}: ${body}`,
      { status: response.status, query },
    );
  }

  let payload: ShopifyGraphQLResponse<T>;
  try {
    payload = (await response.json()) as ShopifyGraphQLResponse<T>;
  } catch (cause) {
    throw new ShopifyError("Failed to parse Shopify Storefront API response as JSON.", {
      status: response.status,
      cause,
      query,
    });
  }

  if (payload.errors && payload.errors.length > 0) {
    const message = payload.errors
      .map((e) => (typeof e?.message === "string" ? e.message : JSON.stringify(e)))
      .join("; ");
    throw new ShopifyError(`Shopify GraphQL error: ${message}`, {
      status: response.status,
      errors: payload.errors,
      query,
    });
  }

  if (!payload.data) {
    throw new ShopifyError("Shopify Storefront API response contained no `data` field.", {
      status: response.status,
      query,
    });
  }

  return { data: payload.data, errors: payload.errors };
}

/**
 * Flatten a GraphQL `{ edges: [{ node }] }` (or `{ nodes }`) connection
 * into a plain array of `T`. Returns `[]` if the input is nullish.
 */
export function removeEdgesAndNodes<T>(
  connection:
    | ShopifyConnection<T>
    | { edges?: Array<{ node: T }> | null; nodes?: T[] | null }
    | null
    | undefined,
): T[] {
  if (!connection) return [];
  if (Array.isArray(connection.nodes)) return connection.nodes;
  if (Array.isArray(connection.edges)) {
    return connection.edges.map((edge) => edge.node);
  }
  return [];
}

/**
 * Format a Shopify money amount (string) using Intl.NumberFormat.
 *
 * @param amount       Decimal string like "19.99" as returned by Shopify.
 * @param currencyCode ISO 4217 code like "USD", "EUR".
 * @param locale       Optional BCP 47 locale, defaults to "en-US".
 */
export function formatMoney(
  amount: string,
  currencyCode: string,
  locale: string = "en-US",
): string {
  const value = Number.parseFloat(amount);
  const safe = Number.isFinite(value) ? value : 0;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "symbol",
    }).format(safe);
  } catch {
    return `${safe.toFixed(2)} ${currencyCode}`;
  }
}
