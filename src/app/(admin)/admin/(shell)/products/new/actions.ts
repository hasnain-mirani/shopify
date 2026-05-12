"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { api, formatApiErrorForUser } from "@/lib/api-client";
import { ADMIN_PRODUCT_TAG } from "@/lib/admin-data";

export interface ProductFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  /** Set after successful create/update — client navigates (avoids redirect digest issues with useActionState). */
  ok?: boolean;
  redirectTo?: string;
}

export interface ProductVariant {
  id?: string;
  title: string;
  price: string;
  compareAtPrice?: string;
  sku: string;
  barcode?: string;
  inventoryQuantity: string;
  weight?: string;
  weightUnit?: "kg" | "g" | "lb" | "oz";
  options: Record<string, string>;
  availableForSale: boolean;
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

function validate(formData: FormData): {
  title: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  handle: string;
  tags: string;
  specifications: string;
  marketPrice: string;
  ourPrice: string;
  price: string;
  compareAtPrice: string;
  costPerItem: string;
  sku: string;
  barcode: string;
  trackQuantity: boolean;
  inventoryQuantity: string;
  continueSellingWhenOutOfStock: boolean;
  requiresShipping: boolean;
  weight: string;
  weightUnit: "kg" | "g" | "lb" | "oz";
  imageUrls: string[];
  featuredImageIndex: string;
  options: string;
  variants: string;
  seoTitle: string;
  seoDescription: string;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const descriptionHtml = String(formData.get("descriptionHtml") ?? "").trim();
  const vendor = String(formData.get("vendor") ?? "").trim();
  const productType = String(formData.get("productType") ?? "").trim();
  const rawStatus = String(formData.get("status") ?? "ACTIVE").trim();
  const status = (["ACTIVE", "DRAFT", "ARCHIVED"] as const).includes(rawStatus as any)
    ? (rawStatus as "ACTIVE" | "DRAFT" | "ARCHIVED")
    : "ACTIVE";
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

  if (compareAtPrice) {
    const n = Number.parseFloat(compareAtPrice);
    if (!Number.isFinite(n) || n < 0) {
      errors.compareAtPrice = "Enter a non-negative number.";
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

  if (inventoryQuantity && trackQuantity) {
    const n = Number.parseInt(inventoryQuantity, 10);
    if (!Number.isFinite(n) || n < 0) {
      errors.inventoryQuantity = "Enter a non-negative number.";
    }
  }

  if (weight) {
    const n = Number.parseFloat(weight);
    if (!Number.isFinite(n) || n < 0) {
      errors.weight = "Enter a non-negative number.";
    }
  }

  return {
    title,
    description,
    descriptionHtml,
    vendor,
    productType,
    status,
    handle,
    tags,
    specifications,
    marketPrice,
    ourPrice,
    price,
    compareAtPrice,
    costPerItem,
    sku,
    barcode,
    trackQuantity,
    inventoryQuantity,
    continueSellingWhenOutOfStock,
    requiresShipping,
    weight,
    weightUnit,
    imageUrls,
    featuredImageIndex,
    options,
    variants,
    seoTitle,
    seoDescription,
    errors,
  };
}

export async function createProductAction(
  prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const input = validate(formData);
  if (Object.keys(input.errors).length > 0) {
    return { error: "Please fix the errors below.", fieldErrors: input.errors };
  }

  let options: ProductOption[];
  let variants: ProductVariant[];
  try {
    options = JSON.parse(input.options || "[]") as ProductOption[];
    variants = JSON.parse(input.variants || "[]") as ProductVariant[];
  } catch {
    return {
      error: "Invalid options or variants data. Reset options/variants and try again.",
      fieldErrors: { options: "Could not parse JSON." },
    };
  }

  const featuredIdx = Number.parseInt(input.featuredImageIndex, 10);
  const featuredImageIndex = Number.isFinite(featuredIdx) && featuredIdx >= 0 ? featuredIdx : 0;

  try {
    await api.products.create({
      title: input.title,
      description: input.description,
      descriptionHtml: input.descriptionHtml,
      vendor: input.vendor,
      productType: input.productType,
      status: input.status,
      handle: input.handle,
      tags: input.tags ? input.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      specifications: input.specifications,
      marketPrice: input.marketPrice ? Number(input.marketPrice) : undefined,
      ourPrice: input.ourPrice ? Number(input.ourPrice) : Number(input.price),
      price: Number(input.price),
      compareAtPrice: input.compareAtPrice ? Number(input.compareAtPrice) : undefined,
      costPerItem: input.costPerItem ? Number(input.costPerItem) : undefined,
      sku: input.sku,
      barcode: input.barcode,
      trackQuantity: input.trackQuantity,
      inventoryQuantity: input.trackQuantity ? Number(input.inventoryQuantity) : undefined,
      continueSellingWhenOutOfStock: input.continueSellingWhenOutOfStock,
      requiresShipping: input.requiresShipping,
      weight: input.weight ? Number(input.weight) : undefined,
      weightUnit: input.weightUnit,
      imageUrls: input.imageUrls,
      featuredImageIndex,
      options,
      variants,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
    });

    revalidatePath("/admin/products");
    // revalidateTag(ADMIN_PRODUCT_TAG);
  } catch (e) {
    return { error: formatApiErrorForUser(e) };
  }

  return { ok: true, redirectTo: "/admin/products" };
}
