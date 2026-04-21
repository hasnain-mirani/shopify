/**
 * Shopify Admin API client.
 *
 * Uses a long-lived access token from a Custom App (prefix `shpat_`).
 *
 * ⚠️  SERVER-ONLY. Never import this file from a Client Component. Enforced
 *     by the "server-only" marker: importing from the client will fail build.
 */
import "server-only";

export class ShopifyAdminError extends Error {
  readonly status?: number;
  readonly errors?: unknown[];
  readonly userErrors?: Array<{ field?: string[]; message: string; code?: string }>;
  readonly query?: string;

  constructor(
    message: string,
    options?: {
      status?: number;
      errors?: unknown[];
      userErrors?: Array<{ field?: string[]; message: string; code?: string }>;
      query?: string;
      cause?: unknown;
    },
  ) {
    super(message);
    this.name = "ShopifyAdminError";
    this.status = options?.status;
    this.errors = options?.errors;
    this.userErrors = options?.userErrors;
    this.query = options?.query;
    if (options?.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

export interface AdminFetchOptions {
  query: string;
  variables?: Record<string, unknown>;
  tags?: string[];
  /** Seconds. `0` opts out of caching (typical for mutations). */
  revalidate?: number;
}

export interface AdminFetchResult<T> {
  data: T;
  extensions?: Record<string, unknown>;
}

interface AdminGraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; [key: string]: unknown }>;
  extensions?: Record<string, unknown>;
}

function getAdminEndpoint(): string {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const version = process.env.SHOPIFY_ADMIN_API_VERSION ?? "2026-04";
  if (!domain) {
    throw new ShopifyAdminError(
      "Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN (e.g. your-store.myshopify.com).",
    );
  }
  return `https://${domain}/admin/api/${version}/graphql.json`;
}

function getAdminToken(): string {
  const token = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
  if (!token || token === "your_admin_api_token_here") {
    throw new ShopifyAdminError(
      "SHOPIFY_ADMIN_API_ACCESS_TOKEN is not set. Create a Custom App in Shopify admin " +
        "(Settings → Apps and sales channels → Develop apps), configure Admin API scopes, " +
        "install the app, and paste the `shpat_…` token into .env.local.",
    );
  }
  return token;
}

/**
 * Typed wrapper around the Shopify Admin GraphQL API.
 *
 * Integrates with the Next.js fetch cache via `next.tags` / `next.revalidate`
 * so queries can be tagged for on-demand revalidation.
 */
export async function shopifyAdminFetch<T>({
  query,
  variables,
  tags,
  revalidate,
}: AdminFetchOptions): Promise<AdminFetchResult<T>> {
  const endpoint = getAdminEndpoint();
  const token = getAdminToken();

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

  let payload: AdminGraphQLResponse<T>;
  try {
    payload = (await response.json()) as AdminGraphQLResponse<T>;
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

  return { data: payload.data, extensions: payload.extensions };
}

/**
 * Small helper to surface `userErrors` from a mutation payload. Shopify returns
 * HTTP 200 with `userErrors` for validation failures (duplicate handle,
 * invalid price, etc.) — these aren't top-level GraphQL errors.
 */
export function throwIfUserErrors(
  userErrors: Array<{ field?: string[]; message: string; code?: string }> | null | undefined,
  query?: string,
): void {
  if (!userErrors || userErrors.length === 0) return;
  const message = userErrors
    .map((e) => `${e.field?.join(".") ?? "(root)"}: ${e.message}${e.code ? ` [${e.code}]` : ""}`)
    .join("; ");
  throw new ShopifyAdminError(`Shopify rejected the mutation: ${message}`, {
    userErrors,
    query,
  });
}

/** Unwrap a `{ edges: [{ node }] }` connection into a plain array. */
export function connectionToArray<T>(
  connection: { edges?: Array<{ node: T }> | null; nodes?: T[] | null } | null | undefined,
): T[] {
  if (!connection) return [];
  if (Array.isArray(connection.nodes)) return connection.nodes;
  if (Array.isArray(connection.edges)) return connection.edges.map((e) => e.node);
  return [];
}
