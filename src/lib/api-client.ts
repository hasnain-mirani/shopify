import type { Product } from "@/types";
import { uploadToCloudinary, uploadMultipleToCloudinary, type CloudinaryUploadResult } from "./cloudinary";

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getApiBase(): string {
  if (/^https?:\/\//.test(RAW_API_BASE)) {
    return RAW_API_BASE.replace(/\/$/, "");
  }

  // Browser can resolve relative API paths directly.
  if (typeof window !== "undefined") {
    return RAW_API_BASE;
  }

  // Server actions/route handlers need an absolute URL for fetch().
  const serverOrigin =
    process.env.INTERNAL_API_ORIGIN ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    `http://localhost:${process.env.PORT || "3000"}`;

  if (RAW_API_BASE.startsWith("/")) {
    return `${serverOrigin}${RAW_API_BASE}`.replace(/\/$/, "");
  }

  return `${serverOrigin}/${RAW_API_BASE}`.replace(/\/$/, "");
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

  constructor(message: string, options?: { status?: number; errors?: unknown[]; cause?: unknown }) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status;
    this.errors = options?.errors;
    if (options?.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
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
    throw new ApiError(`Network error: ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
  }

  if (!response.ok) {
    let errorMsg = `API responded with ${response.status}`;
    try {
      const errData = await response.json();
      if (errData.error) errorMsg = errData.error;
    } catch { /* ignore */ }
    throw new ApiError(errorMsg, { status: response.status });
  }

  return response.json();
}

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
    get: (id: string) => apiFetch<any>(`/orders/${id}`),
    list: (limit?: number) => {
      const qs = limit ? `?limit=${limit}` : "";
      return apiFetch<any[]>(`/orders${qs}`);
    },
    getKPIs: () => apiFetch<any>("/orders/kpis"),
    updateStatus: (id: string, data: { financial_status?: string; fulfillment_status?: string }) =>
      apiFetch<any>(`/orders/${id}/status`, { method: "PUT", body: data }),
    create: (data: Record<string, unknown>) =>
      apiFetch<any>("/orders", { method: "POST", body: data }),
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

  notifications: {
    saveToken: async (token: string, userId?: string, userEmail?: string) => {
      return apiFetch<{ ok: boolean }>("/fcm-tokens", {
        method: "POST",
        body: { token, userId, userEmail },
      });
    },
  },
};
