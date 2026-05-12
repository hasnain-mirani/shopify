import type { Product, OrderKPIs } from "@/types";
import { getSiteUrl } from "@/lib/site-url";
import { getBackendApiBase } from "@/lib/backend-url";
import { uploadToCloudinary, uploadMultipleToCloudinary, type CloudinaryUploadResult } from "./cloudinary";

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getApiBase(): string {
  if (/^https?:\/\//.test(RAW_API_BASE)) {
    return RAW_API_BASE.replace(/\/$/, "");
  }

  // Browser can resolve relative API paths directly (Next /api/* BFF).
  if (typeof window !== "undefined") {
    return RAW_API_BASE;
  }

  // Server actions / Route Handlers: never self-fetch "https://this-app.vercel.app/api" when
  // NEXT_PUBLIC_API_URL is "/api" — that breaks on Vercel (localhost, missing routes). Use Express.
  if (RAW_API_BASE.startsWith("/")) {
    return getBackendApiBase();
  }

  const serverOrigin = process.env.INTERNAL_API_ORIGIN || getSiteUrl();

  return `${serverOrigin}/${RAW_API_BASE}`.replace(/\/$/, "");
}

const HTTP_STATUS_HINTS: Record<number, string> = {
  400: "Bad request — the server could not process this request.",
  401: "Unauthorized — try signing in again.",
  403: "Forbidden — you do not have access.",
  404: "Not found.",
  409: "Conflict — this resource may already exist.",
  422: "Validation failed.",
  429: "Too many requests — wait a moment and try again.",
  502: "Bad gateway — an upstream service failed.",
  503: "Service unavailable — try again later.",
};

function headlineFromErrorBody(status: number, parsed: unknown, rawText: string): string {
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const o = parsed as Record<string, unknown>;
    for (const key of ["error", "message", "detail", "title"]) {
      const v = o[key];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  if (typeof parsed === "string" && parsed.trim()) return parsed.trim();
  const stripped = rawText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (stripped.length > 0) return stripped.slice(0, 200) + (stripped.length > 200 ? "…" : "");
  return HTTP_STATUS_HINTS[status] || `Request failed (HTTP ${status}).`;
}

function detailLinesFromErrorBody(parsed: unknown): string[] {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return [];
  const o = parsed as Record<string, unknown>;
  const out: string[] = [];

  if (typeof o.rawPreview === "string" && o.rawPreview.trim()) {
    out.push(`Model output preview: ${o.rawPreview.trim().slice(0, 240)}${o.rawPreview.length > 240 ? "…" : ""}`);
  }

  const errs = o.errors;
  if (Array.isArray(errs)) {
    for (const e of errs) {
      if (typeof e === "string" && e.trim()) out.push(e.trim());
      else if (e && typeof e === "object") {
        const rec = e as Record<string, unknown>;
        const msg = rec.message ?? rec.msg ?? rec.error;
        const path = rec.path ?? rec.field ?? rec.param;
        if (typeof msg === "string" && msg.trim()) {
          out.push(typeof path === "string" && path.trim() ? `${path.trim()}: ${msg.trim()}` : msg.trim());
        }
      }
    }
  } else if (errs && typeof errs === "object") {
    for (const [k, v] of Object.entries(errs as Record<string, unknown>)) {
      if (v == null) continue;
      if (Array.isArray(v)) out.push(`${k}: ${v.map(String).join(", ")}`);
      else out.push(`${k}: ${String(v)}`);
    }
  }

  return out.slice(0, 10);
}

/**
 * Normalize raw backend product data to match the expected Product interface.
 * The custom backend may not return all fields, so we add sensible defaults.
 */
function normalizeProduct(raw: any): Product {
  if (!raw || typeof raw !== 'object') {
    return {
      id: "",
      handle: "",
      title: "",
      description: "",
      availableForSale: false,
      tags: [],
      options: [],
      priceRange: {
        minVariantPrice: { amount: "0", currencyCode: "USD" },
        maxVariantPrice: { amount: "0", currencyCode: "USD" },
      },
      images: [],
      variants: [],
    };
  }

  return {
    id: raw.id || raw._id || "",
    handle: raw.handle || raw.slug || "",
    title: raw.title || raw.name || "",
    description: raw.description || "",
    descriptionHtml: raw.descriptionHtml || raw.description || "",
    specifications: raw.specifications || "",
    marketPrice: Number.isFinite(Number(raw.marketPrice)) ? Number(raw.marketPrice) : undefined,
    ourPrice: Number.isFinite(Number(raw.ourPrice)) ? Number(raw.ourPrice) : undefined,
    availableForSale: raw.availableForSale ?? raw.inStock ?? true,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    vendor: raw.vendor || raw.brand || undefined,
    productType: raw.productType || raw.category || undefined,
    createdAt: raw.createdAt || raw.created_at || undefined,
    updatedAt: raw.updatedAt || raw.updated_at || undefined,
    publishedAt: raw.publishedAt || raw.createdAt || raw.created_at || undefined,
    status: raw.status || undefined,
    options: Array.isArray(raw.options) ? raw.options : [],
    priceRange: raw.priceRange || {
      minVariantPrice: raw.price || { amount: "0", currencyCode: "USD" },
      maxVariantPrice: raw.price || { amount: "0", currencyCode: "USD" },
    },
    featuredImage: raw.featuredImage || raw.image || null,
    images: Array.isArray(raw.images) ? raw.images : (raw.image ? [raw.image] : []),
    variants: Array.isArray(raw.variants) ? raw.variants : [],
  };
}

export class ApiError extends Error {
  readonly status?: number;
  readonly errors?: unknown[];
  /** Extra lines shown under the main message (bullets in `toDisplayString`). */
  readonly details?: string[];

  constructor(
    message: string,
    options?: { status?: number; errors?: unknown[]; details?: string[]; cause?: unknown },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status;
    this.errors = options?.errors;
    this.details = options?.details;
    if (options?.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }

  /** One block of text: optional HTTP code + title + bullet lines — good for toasts with `whiteSpace: "pre-line"`. */
  toDisplayString(): string {
    const prefix = this.status != null ? `[${this.status}] ` : "";
    const lines = [`${prefix}${this.message}`, ...(this.details ?? []).filter(Boolean).map((d) => `• ${d}`)];
    return lines.join("\n");
  }
}

/** Use with `toast.error(..., { style: API_ERROR_TOAST_STYLE })` for readable multi-line errors. */
export const API_ERROR_TOAST_STYLE = {
  maxWidth: 440,
  whiteSpace: "pre-line" as const,
};

/** Readable API/network error for toasts and server action `error` fields. */
export function formatApiErrorForUser(err: unknown): string {
  if (err instanceof ApiError) return err.toDisplayString();
  if (err instanceof Error) return err.message;
  if (typeof err === "string" && err.trim()) return err.trim();
  return "Something went wrong. Please try again.";
}

interface FetchOptions {
  method?: string;
  body?: unknown;
  tags?: string[];
  revalidate?: number;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = "GET", body } = options;
  const url = `${getApiBase()}${endpoint}`;

  const headers: Record<string, string> = {};
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      next: options.tags ? { tags: options.tags, revalidate: options.revalidate } : undefined,
    });
  } catch (cause) {
    const isServer = typeof window === "undefined";
    const hint = isServer
      ? "Server could not reach the catalog API. Set BACKEND_API_URL in .env.local to your public Express base URL (e.g. https://your-backend.vercel.app/api). Do not use http://127.0.0.1 on Vercel."
      : "Could not reach the API. If the storefront is HTTPS, the API URL must be https:// as well (mixed content is blocked). Check NEXT_PUBLIC_API_URL and that the backend is running.";
    const tail = cause instanceof Error && cause.message ? ` (${cause.message})` : "";
    throw new ApiError(`${hint}${tail}`, { cause });
  }

  if (!response.ok) {
    const bodyText = await response.text();
    let parsed: unknown = null;
    try {
      parsed = bodyText.trim() ? JSON.parse(bodyText) : null;
    } catch {
      parsed = null;
    }
    const headline = headlineFromErrorBody(response.status, parsed, bodyText);
    const detailLines = detailLinesFromErrorBody(parsed);
    const errorsArr = Array.isArray((parsed as Record<string, unknown> | null)?.errors)
      ? ((parsed as Record<string, unknown>).errors as unknown[])
      : undefined;
    const contextLine = `Request: ${method} ${endpoint}`;
    const mergedDetails = [contextLine, ...detailLines].slice(0, 12);
    throw new ApiError(headline, {
      status: response.status,
      details: mergedDetails,
      errors: errorsArr,
    });
  }

  const text = await response.text();
  if (!text.trim()) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch (cause) {
    const snippet = text.replace(/\s+/g, " ").trim().slice(0, 160);
    throw new ApiError(`The API returned data that is not valid JSON for «${endpoint}».`, {
      status: response.status,
      details: snippet
        ? [`Start of response: ${snippet}${text.length > 160 ? "…" : ""}`, `Request: ${method} ${endpoint}`]
        : [`Request: ${method} ${endpoint}`],
      cause,
    });
  }
}

/** Response from POST /product-ai/identify-from-image (Express or Next proxy). */
export type ProductIdentifyFromImageResult = {
  title: string;
  description: string;
  descriptionHtml?: string;
  vendor?: string;
  productType?: string;
  tags?: string;
  specifications?: string;
  marketPrice?: string;
  ourPrice?: string;
  estimatedPrice: string;
  sku?: string;
  barcode?: string;
  weight?: string;
  weightUnit?: string;
  seoTitle?: string;
  seoDescription?: string;
  sources?: string[];
};

// Products
export const api = {
  products: {
    list: async (params?: {
      status?: string;
      search?: string;
      tag?: string;
      newArrivals?: boolean;
      inStock?: boolean;
      sort?: string;
      limit?: number;
      offset?: number;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set("status", params.status);
      if (params?.search) searchParams.set("search", params.search);
      if (params?.tag) searchParams.set("tag", params.tag);
      if (params?.newArrivals) searchParams.set("newArrivals", "1");
      if (params?.inStock) searchParams.set("inStock", "1");
      if (params?.sort) searchParams.set("sort", params.sort);
      if (params?.limit) searchParams.set("limit", String(params.limit));
      if (params?.offset != null && params.offset > 0) searchParams.set("offset", String(params.offset));
      const qs = searchParams.toString();
      const raw = await apiFetch<any[]>(`/products${qs ? `?${qs}` : ""}`);
      return raw.map(normalizeProduct);
    },
    getByHandle: async (handle: string) => {
      try {
        const raw = await apiFetch<any>(`/products/${handle}`);
        return normalizeProduct(raw);
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError?.status && apiError.status !== 404) {
          throw error;
        }
      }

      // Fallback for local API setups where /products/:handle route
      // may not be exposed via Next route handlers.
      const all = await apiFetch<any[]>(`/products?limit=250`);
      const found = all.find((p) => String(p.handle ?? "").toLowerCase() === handle.toLowerCase());
      if (!found) {
        throw new ApiError("Product not found", { status: 404 });
      }
      return normalizeProduct(found);
    },
    getById: async (id: string) => {
      // Backends differ: some expose `/products/id/:id`, others only
      // `/products/:handle`. We try id-route first, then fall back to
      // listing and matching by id/handle to keep edit routes stable.
      try {
        const raw = await apiFetch<any>(`/products/id/${id}`);
        return normalizeProduct(raw);
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError?.status && apiError.status !== 404) {
          throw error;
        }
      }

      try {
        const raw = await apiFetch<any>(`/products/${id}`);
        return normalizeProduct(raw);
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError?.status && apiError.status !== 404) {
          throw error;
        }
      }

      const all = await apiFetch<any[]>(`/products?limit=250`);
      const found = all.find((p) => String(p.id ?? p._id ?? "") === id || String(p.handle ?? "") === id);
      if (!found) {
        throw new ApiError("Product not found", { status: 404 });
      }
      return normalizeProduct(found);
    },
    create: (data: Record<string, unknown>) =>
      apiFetch<any>("/products", { method: "POST", body: data }),
    update: (id: string, data: Record<string, unknown>) =>
      apiFetch<any>(`/products/${id}`, { method: "PUT", body: data }),
    delete: (id: string) =>
      apiFetch<{ ok: boolean; deletedId: string }>(`/products/${id}`, { method: "DELETE" }),
  },

  orders: {
    /** Requires admin session cookie (same-origin). */
    get: (id: string) => apiFetch<Record<string, unknown>>(`/orders/${id}`),
    list: (limit?: number) => {
      const qs = limit ? `?limit=${limit}` : "";
      return apiFetch<Record<string, unknown>[]>(`/orders${qs}`);
    },
    /** Short-lived signed token from POST /api/orders — safe for success page. */
    getByReceipt: (token: string) =>
      apiFetch<Record<string, unknown>>(
        `/orders/receipt?token=${encodeURIComponent(token)}`,
      ),
    getKPIs: () => apiFetch<OrderKPIs>("/orders/kpis"),
    updateStatus: (id: string, data: { financial_status?: string; fulfillment_status?: string }) =>
      apiFetch<Record<string, unknown>>(`/orders/${id}/status`, { method: "PUT", body: data }),
    create: (data: Record<string, unknown>) =>
      apiFetch<Record<string, unknown> & { receiptToken?: string }>("/orders", {
        method: "POST",
        body: data,
      }),
  },

  cart: {
    get: (id: string) => apiFetch<any>(`/cart/${id}`),
    create: () => apiFetch<any>("/cart", { method: "POST" }),
    addItem: (cartId: string, data: Record<string, unknown>) =>
      apiFetch<any>(`/cart/${cartId}/items`, { method: "POST", body: data }),
    updateItem: (cartId: string, itemId: string, quantity: number) =>
      apiFetch<any>(`/cart/${cartId}/items/${itemId}`, { method: "PUT", body: { quantity } }),
    removeItem: (cartId: string, itemId: string) =>
      apiFetch<any>(`/cart/${cartId}/items/${itemId}`, { method: "DELETE" }),
  },

  settings: {
    get: () => apiFetch<Record<string, string>>("/settings"),
    update: (key: string, value: string) =>
      apiFetch<any>(`/settings/${key}`, { method: "PUT", body: { value } }),
  },

  upload: {
    image: async (file: File) => {
      const result = await uploadToCloudinary(file, { folder: "products" });
      return {
        url: result.url,
        filename: result.publicId,
        size: 0, // Cloudinary doesn't return file size in basic response
      };
    },
    multiple: async (files: File[]) => {
      const results = await uploadMultipleToCloudinary(files, { folder: "products" });
      return {
        files: results.map((r) => ({
          url: r.url,
          filename: r.publicId,
          size: 0,
        })),
      };
    },
  },

  productAi: {
    identifyFromImage: (file: File) => {
      const fd = new FormData();
      fd.append("image", file);
      return apiFetch<ProductIdentifyFromImageResult>("/product-ai/identify-from-image", { method: "POST", body: fd });
    },
    generateProductImage: (productDescription: string) =>
      apiFetch<{ imageUrl: string }>("/product-ai/generate-image", {
        method: "POST",
        body: { productDescription },
      }),
  },

  notifications: {
    saveToken: async (token: string, userId?: string, userEmail?: string) => {
      return apiFetch<{ ok: boolean }>("/fcm-tokens", {
        method: "POST",
        body: { token, userId, userEmail },
      });
    },
  },
};
