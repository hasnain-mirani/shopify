"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { api, formatApiErrorForUser } from "@/lib/api-client";
import { ADMIN_PRODUCT_TAG } from "@/lib/admin-data";
import {
  type ProductFormState,
  type ProductOption,
  type ProductVariant,
} from "../../new/actions";

export async function updateProductAction(
  _prevState: ProductFormState | null,
  formData: FormData,
): Promise<ProductFormState> {
  // Manual validation
  const errors: Record<string, string> = {};

  const productId = String(formData.get("productId") ?? "").trim();
  if (!productId) {
    return { error: "Product ID is required." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const descriptionHtml = String(formData.get("descriptionHtml") ?? "").trim();
  const vendor = String(formData.get("vendor") ?? "").trim();
  const productType = String(formData.get("productType") ?? "").trim();
  const rawStatus = String(formData.get("status") ?? "DRAFT").trim();
  const status = (["ACTIVE", "DRAFT", "ARCHIVED"] as const).includes(rawStatus as any)
    ? (rawStatus as "ACTIVE" | "DRAFT" | "ARCHIVED")
    : "DRAFT";
  const handle = String(formData.get("handle") ?? "").trim();
  const tags = String(formData.get("tags") ?? "").trim();
  const specifications = String(formData.get("specifications") ?? "").trim();
  const marketPrice = String(formData.get("marketPrice") ?? "").trim();
  const ourPrice = String(formData.get("ourPrice") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const compareAtPrice = String(formData.get("compareAtPrice") ?? "").trim();
  const costPerItem = String(formData.get("costPerItem") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const barcode = String(formData.get("barcode") ?? "").trim();
  const trackQuantity = formData.get("trackQuantity") === "true";
  const inventoryQuantity = String(formData.get("inventoryQuantity") ?? "0").trim();
  const continueSellingWhenOutOfStock = formData.get("continueSellingWhenOutOfStock") === "true";
  const requiresShipping = String(formData.get("requiresShipping") ?? "true") === "true";
  const weight = String(formData.get("weight") ?? "").trim();
  const weightUnit = (formData.get("weightUnit") as "kg" | "g" | "lb" | "oz") || "kg";
  const imageUrlsStr = String(formData.get("imageUrls") ?? "").trim();
  const imageUrls = imageUrlsStr ? imageUrlsStr.split(",").map((u) => u.trim()).filter(Boolean) : [];
  const featuredImageIndex = String(formData.get("featuredImageIndex") ?? "0").trim();
  const options = String(formData.get("options") ?? "[]").trim();
  const variants = String(formData.get("variants") ?? "[]").trim();
  const seoTitle = String(formData.get("seoTitle") ?? "").trim();
  const seoDescription = String(formData.get("seoDescription") ?? "").trim();

  if (!title) errors.title = "Title is required.";
  if (!price) {
    errors.price = "Price is required.";
  } else {
    const n = Number.parseFloat(price);
    if (!Number.isFinite(n) || n < 0) {
      errors.price = "Enter a non-negative number.";
    }
  }
  if (marketPrice) {
    const n = Number.parseFloat(marketPrice);
    if (!Number.isFinite(n) || n < 0) {
      errors.marketPrice = "Enter a non-negative number.";
    }
  }
  if (ourPrice) {
    const n = Number.parseFloat(ourPrice);
    if (!Number.isFinite(n) || n < 0) {
      errors.ourPrice = "Enter a non-negative number.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { error: "Please fix the errors below.", fieldErrors: errors };
  }

  let parsedOptions: ProductOption[];
  let parsedVariants: ProductVariant[];
  try {
    parsedOptions = JSON.parse(options || "[]") as ProductOption[];
    parsedVariants = JSON.parse(variants || "[]") as ProductVariant[];
  } catch {
    return {
      error: "Invalid options or variants JSON.",
      fieldErrors: { options: "Could not parse options/variants." },
    };
  }

  const featuredIdx = Number.parseInt(featuredImageIndex, 10);
  const featuredImageIndexNum = Number.isFinite(featuredIdx) && featuredIdx >= 0 ? featuredIdx : 0;

  try {
    await api.products.update(productId, {
      title,
      description,
      descriptionHtml,
      vendor,
      productType,
      status,
      handle,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      specifications,
      marketPrice: marketPrice ? Number(marketPrice) : undefined,
      ourPrice: ourPrice ? Number(ourPrice) : Number(price),
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      costPerItem: costPerItem ? Number(costPerItem) : undefined,
      sku,
      barcode,
      trackQuantity,
      inventoryQuantity: trackQuantity ? Number(inventoryQuantity) : undefined,
      continueSellingWhenOutOfStock,
      requiresShipping,
      weight: weight ? Number(weight) : undefined,
      weightUnit,
      imageUrls,
      featuredImageIndex: featuredImageIndexNum,
      options: parsedOptions,
      variants: parsedVariants,
      seoTitle,
      seoDescription,
    });

    revalidatePath("/admin/products");
    // revalidateTag(ADMIN_PRODUCT_TAG);
  } catch (e) {
    return { error: formatApiErrorForUser(e) };
  }

  return { ok: true, redirectTo: "/admin/products" };
}