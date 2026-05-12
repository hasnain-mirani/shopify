"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { api, formatApiErrorForUser } from "@/lib/api-client";
import { ADMIN_PRODUCT_TAG } from "@/lib/admin-data";

export interface DeleteProductResult {
  ok: boolean;
  error?: string;
  deletedProductId?: string;
}

export async function deleteProductAction(
  productId: string,
  _productHandle?: string,
): Promise<DeleteProductResult> {
  if (!productId) {
    return { ok: false, error: "Invalid product id." };
  }

  try {
    const result = await api.products.delete(productId);

    revalidatePath("/admin/products");
    // revalidateTag(ADMIN_PRODUCT_TAG);
    return { ok: true, deletedProductId: result.deletedId };
  } catch (e) {
    return {
      ok: false,
      error: formatApiErrorForUser(e),
    };
  }
}
