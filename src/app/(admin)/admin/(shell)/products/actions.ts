"use server";

import { updateTag } from "next/cache";
import { revalidatePath } from "next/cache";
import { shopifyAdminFetch, throwIfUserErrors } from "@/lib/shopify-admin";
import { ADMIN_PRODUCT_DELETE_MUTATION } from "@/lib/shopify/admin-queries";
import { ADMIN_PRODUCT_TAG } from "@/lib/admin-data";
import { TAGS } from "@/lib/shopify";

interface ProductDeleteResponse {
  productDelete: {
    deletedProductId: string | null;
    userErrors: Array<{ field?: string[]; message: string }>;
  };
}

export interface DeleteProductResult {
  ok: boolean;
  error?: string;
  deletedProductId?: string;
}

/**
 * Permanently delete a product by its GID (e.g. "gid://shopify/Product/123").
 *
 * Called from client components, so the signature is `(productId) => Promise`
 * rather than the form-action shape. We also take an optional handle so we
 * can invalidate the product-detail cache tag.
 */
export async function deleteProductAction(
  productId: string,
  productHandle?: string,
): Promise<DeleteProductResult> {
  if (!productId || !productId.startsWith("gid://shopify/Product/")) {
    return { ok: false, error: "Invalid product id." };
  }

  try {
    const { data } = await shopifyAdminFetch<ProductDeleteResponse>({
      query: ADMIN_PRODUCT_DELETE_MUTATION,
      variables: { input: { id: productId } },
      revalidate: 0,
    });
    throwIfUserErrors(
      data.productDelete.userErrors,
      ADMIN_PRODUCT_DELETE_MUTATION,
    );

    updateTag(ADMIN_PRODUCT_TAG);
    updateTag(TAGS.products);
    if (productHandle) {
      updateTag(`${TAGS.products}:${productHandle}`);
    }
    revalidatePath("/admin/products");

    return {
      ok: true,
      deletedProductId: data.productDelete.deletedProductId ?? productId,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to delete product.",
    };
  }
}
