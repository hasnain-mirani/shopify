"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { shopifyAdminFetch, throwIfUserErrors } from "@/lib/shopify-admin";
import {
  ADMIN_PRODUCT_CREATE_MUTATION,
  ADMIN_PRODUCT_VARIANTS_BULK_UPDATE_MUTATION,
  ADMIN_PRODUCT_CREATE_MEDIA_MUTATION,
} from "@/lib/shopify/admin-queries";
import { ADMIN_PRODUCT_TAG } from "@/lib/admin-data";
import { TAGS } from "@/lib/shopify";

export interface ProductFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

interface ProductCreateResponse {
  productCreate: {
    product: {
      id: string;
      title: string;
      handle: string;
      status: string;
      variants: { nodes: Array<{ id: string }> };
    } | null;
    userErrors: Array<{ field?: string[]; message: string }>;
  };
}

interface ProductVariantsBulkUpdateResponse {
  productVariantsBulkUpdate: {
    product: { id: string } | null;
    productVariants: Array<{ id: string; price: string; sku: string | null }>;
    userErrors: Array<{ field?: string[]; message: string; code?: string }>;
  };
}

interface ProductCreateMediaResponse {
  productCreateMedia: {
    media: Array<{ alt: string | null; mediaContentType: string; status: string }>;
    mediaUserErrors: Array<{ field?: string[]; message: string; code?: string }>;
    product: { id: string } | null;
  };
}

function validate(formData: FormData): {
  title: string;
  description: string;
  vendor: string;
  status: "ACTIVE" | "DRAFT";
  price: string;
  sku: string;
  imageUrl: string;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const vendor = String(formData.get("vendor") ?? "").trim();
  const rawStatus = String(formData.get("status") ?? "DRAFT").trim();
  const status = rawStatus === "ACTIVE" ? "ACTIVE" : "DRAFT";
  const price = String(formData.get("price") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

  if (!title) errors.title = "Title is required.";
  if (!price) {
    errors.price = "Price is required.";
  } else {
    const n = Number.parseFloat(price);
    if (!Number.isFinite(n) || n < 0) {
      errors.price = "Enter a non-negative number.";
    }
  }
  if (imageUrl && !/^https?:\/\/.+/i.test(imageUrl)) {
    errors.imageUrl = "Image URL must start with http:// or https://.";
  }

  return { title, description, vendor, status, price, sku, imageUrl, errors };
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const input = validate(formData);
  if (Object.keys(input.errors).length > 0) {
    return { error: "Please fix the errors below.", fieldErrors: input.errors };
  }

  let productId: string | undefined;
  let productHandle: string | undefined;
  let defaultVariantId: string | undefined;

  try {
    const { data } = await shopifyAdminFetch<ProductCreateResponse>({
      query: ADMIN_PRODUCT_CREATE_MUTATION,
      variables: {
        product: {
          title: input.title,
          descriptionHtml: input.description
            ? `<p>${escapeHtml(input.description).replace(/\n/g, "<br/>")}</p>`
            : "",
          vendor: input.vendor || undefined,
          status: input.status,
        },
      },
      revalidate: 0,
    });
    throwIfUserErrors(data.productCreate.userErrors, ADMIN_PRODUCT_CREATE_MUTATION);
    productId = data.productCreate.product?.id;
    productHandle = data.productCreate.product?.handle;
    defaultVariantId = data.productCreate.product?.variants.nodes[0]?.id;
    if (!productId) {
      return { error: "Shopify did not return a product id. Try again." };
    }
    if (!defaultVariantId) {
      return {
        error:
          "Product was created but no default variant was returned — cannot attach price.",
      };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create product." };
  }

  try {
    const { data } = await shopifyAdminFetch<ProductVariantsBulkUpdateResponse>({
      query: ADMIN_PRODUCT_VARIANTS_BULK_UPDATE_MUTATION,
      variables: {
        productId,
        variants: [
          {
            id: defaultVariantId,
            price: input.price,
            ...(input.sku ? { inventoryItem: { sku: input.sku } } : {}),
          },
        ],
      },
      revalidate: 0,
    });
    throwIfUserErrors(
      data.productVariantsBulkUpdate.userErrors,
      ADMIN_PRODUCT_VARIANTS_BULK_UPDATE_MUTATION,
    );
  } catch (e) {
    return {
      error:
        "Product was created but the price could not be set: " +
        (e instanceof Error ? e.message : String(e)),
    };
  }

  if (input.imageUrl) {
    try {
      const { data } = await shopifyAdminFetch<ProductCreateMediaResponse>({
        query: ADMIN_PRODUCT_CREATE_MEDIA_MUTATION,
        variables: {
          productId,
          media: [
            {
              originalSource: input.imageUrl,
              alt: input.title,
              mediaContentType: "IMAGE",
            },
          ],
        },
        revalidate: 0,
      });
      throwIfUserErrors(
        data.productCreateMedia.mediaUserErrors,
        ADMIN_PRODUCT_CREATE_MEDIA_MUTATION,
      );
    } catch (e) {
      return {
        error:
          "Product was created but the image could not be attached: " +
          (e instanceof Error ? e.message : String(e)),
      };
    }
  }

  updateTag(ADMIN_PRODUCT_TAG);
  updateTag(TAGS.products);
  if (productHandle) {
    updateTag(`${TAGS.products}:${productHandle}`);
  }

  redirect("/admin/products");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
