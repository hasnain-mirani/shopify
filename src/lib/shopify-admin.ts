/**
 * Error thrown for any Shopify Admin API failure
 * (network error, non-2xx response, or GraphQL `errors` in the payload).
 */
export class ShopifyAdminError extends Error {
  readonly status?: number;
  readonly errors?: unknown[];
  readonly query?: string;

  constructor(
    message: string,
    options?: { status?: number; errors?: unknown[]; query?: string; cause?: unknown },
  ) {
    super(message);
    this.name = "ShopifyAdminError";
    this.status = options?.status;
    this.errors = options?.errors;
    this.query = options?.query;
    if (options?.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

export interface ShopifyAdminFetchOptions {
  query: string;
  variables?: Record<string, unknown>;
  tags?: string[];
  /** Seconds. Use 0 to disable caching, or omit to use defaults. */
  revalidate?: number;
}

export interface ShopifyAdminFetchResult<T> {
  data: T;
  errors?: unknown[];
}

interface ShopifyAdminGraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; [key: string]: unknown }>;
  userErrors?: Array<{ field: string[]; message: string }>;
}

function getAdminEndpoint(): string {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const version = process.env.SHOPIFY_ADMIN_API_VERSION;

  if (!domain) {
    throw new ShopifyAdminError(
      "Missing env var NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN (e.g. your-store.myshopify.com).",
    );
  }
  if (!version) {
    throw new ShopifyAdminError(
      "Missing env var SHOPIFY_ADMIN_API_VERSION (e.g. 2026-04).",
    );
  }

  return `https://${domain}/admin/api/${version}/graphql.json`;
}

function getAdminAccessToken(): string {
  const token = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

  if (!token) {
    throw new ShopifyAdminError(
      "Missing env var SHOPIFY_ADMIN_API_ACCESS_TOKEN (private Admin API access token).",
    );
  }
  return token;
}

/**
 * Typed wrapper around the Shopify Admin GraphQL API.
 *
 * Integrates with Next.js fetch cache via `next.tags` and `next.revalidate`,
 * so callers can tag requests for on-demand revalidation with `revalidateTag`.
 *
 * IMPORTANT: This function must only be called from server-side code
 * (Server Actions, Route Handlers, or Server Components). It is marked
 * with "use server" to prevent client-side usage.
 */
export async function shopifyAdminFetch<T>({
  query,
  variables,
  tags,
  revalidate,
}: ShopifyAdminFetchOptions): Promise<ShopifyAdminFetchResult<T>> {
  const endpoint = getAdminEndpoint();
  const token = getAdminAccessToken();

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
      next: { tags, revalidate },
    });
  } catch (cause) {
    throw new ShopifyAdminError(
      `Network error while contacting Shopify Admin API: ${
        cause instanceof Error ? cause.message : String(cause)
      }`,
      { cause, query },
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ShopifyAdminError(
      `Shopify Admin API responded with ${response.status} ${response.statusText}: ${body}`,
      { status: response.status, query },
    );
  }

  let payload: ShopifyAdminGraphQLResponse<T>;
  try {
    payload = (await response.json()) as ShopifyAdminGraphQLResponse<T>;
  } catch (cause) {
    throw new ShopifyAdminError("Failed to parse Shopify Admin API response as JSON.", {
      status: response.status,
      cause,
      query,
    });
  }

  if (payload.errors && payload.errors.length > 0) {
    const message = payload.errors
      .map((e) => (typeof e?.message === "string" ? e.message : JSON.stringify(e)))
      .join("; ");
    throw new ShopifyAdminError(`Shopify Admin GraphQL error: ${message}`, {
      status: response.status,
      errors: payload.errors,
      query,
    });
  }

  if (!payload.data) {
    throw new ShopifyAdminError("Shopify Admin API response contained no `data` field.", {
      status: response.status,
      query,
    });
  }

  return { data: payload.data, errors: payload.errors };
}

/**
 * Helper to throw an error if a mutation response contains userErrors.
 * This is the standard pattern for handling Shopify mutation errors.
 *
 * @param response The mutation response from Shopify
 * @param errorKey The key to check for userErrors (e.g., "userErrors", "mediaUserErrors")
 */
export function throwIfUserErrors<T extends { userErrors?: Array<{ message: string }> }>(
  response: T,
  errorKey: keyof T = "userErrors" as keyof T,
): void {
  const errors = response[errorKey] as Array<{ message: string }> | undefined;
  if (errors && errors.length > 0) {
    const messages = errors.map((e) => e.message).join(", ");
    throw new ShopifyAdminError(`Mutation failed: ${messages}`);
  }
}