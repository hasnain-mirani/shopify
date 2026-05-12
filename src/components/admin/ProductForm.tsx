"use client";

import Image from "next/image";
import { useActionState, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AdminCard } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api, formatApiErrorForUser, API_ERROR_TOAST_STYLE } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  ADMIN_CATEGORY_OPTIONS as CATEGORY_OPTIONS,
  coerceAdminProductCategory,
  normalizeAdminCategorySlug,
} from "@/lib/admin-product-categories";
import { normalizeProductIdentifyPayload } from "@/lib/normalize-product-identify";
import { Upload, X, Loader2, Plus, Trash2, ChevronUp, Wand2, Sparkles } from "lucide-react";
import type { ProductFormState, ProductOption, ProductVariant } from "@/app/(admin)/admin/(shell)/products/new/actions";

export interface ProductFormData {
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
  featuredImageIndex: number;
  options: ProductOption[];
  variants: ProductVariant[];
  seoTitle: string;
  seoDescription: string;
}

export interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (prevState: any, formData: FormData) => Promise<any>;
  submitLabel: string;
  isPending?: boolean;
  onCancel?: () => void;
  error?: string;
  fieldErrors?: Record<string, string>;
  hiddenFields?: Record<string, string>;
}

const defaultFormData: ProductFormData = {
  title: "",
  description: "",
  descriptionHtml: "",
  vendor: "",
  productType: "",
  status: "DRAFT",
  handle: "",
  tags: "",
  specifications: "",
  marketPrice: "",
  ourPrice: "",
  price: "",
  compareAtPrice: "",
  costPerItem: "",
  sku: "",
  barcode: "",
  trackQuantity: true,
  inventoryQuantity: "0",
  continueSellingWhenOutOfStock: false,
  requiresShipping: true,
  weight: "",
  weightUnit: "kg",
  imageUrls: [],
  featuredImageIndex: 0,
  options: [],
  variants: [],
  seoTitle: "",
  seoDescription: "",
};

const CUSTOM_CATEGORY = "__custom__";

const FIELD_LABEL =
  "block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5";

function slugifyHandleFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function withDerivedPrices(data: ProductFormData): ProductFormData {
  const ourPrice = data.ourPrice || data.price || "";
  const marketPrice = data.marketPrice || data.compareAtPrice || "";
  return {
    ...data,
    ourPrice,
    marketPrice,
    price: ourPrice,
    compareAtPrice: marketPrice,
  };
}

function buildInitialFormState(initialData?: Partial<ProductFormData>): ProductFormData {
  const merged = {
    ...defaultFormData,
    ...initialData,
  } as ProductFormData;
  if (!String(merged.productType ?? "").trim()) {
    merged.productType = CATEGORY_OPTIONS[0].value;
  }
  return withDerivedPrices(merged);
}

export function ProductForm({
  initialData,
  onSubmit,
  submitLabel,
  isPending: externalIsPending,
  onCancel = () => window.history.back(),
  error: externalError,
  fieldErrors: externalFieldErrors,
  hiddenFields,
}: ProductFormProps) {
  const router = useRouter();
  const [state, formAction, internalIsPending] = useActionState(onSubmit, null as ProductFormState | null);
  const [formData, setFormData] = useState<ProductFormData>(() => buildInitialFormState(initialData));
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    const initialType = String(initialData?.productType ?? "");
    if (!initialType) return CATEGORY_OPTIONS[0].value;
    const normalized = normalizeAdminCategorySlug(initialType);
    return CATEGORY_OPTIONS.some((c) => c.value === normalized)
      ? normalized
      : CUSTOM_CATEGORY;
  });
  const [uploading, setUploading] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [identifyLoading, setIdentifyLoading] = useState(false);
  const [imageGenLoading, setImageGenLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiIdentifyInputRef = useRef<HTMLInputElement>(null);
  const error = state?.error || externalError;
  const fieldErrors = state?.fieldErrors || externalFieldErrors;
  const isPending = externalIsPending ?? internalIsPending;

  useEffect(() => {
    if (initialData) {
      const merged = buildInitialFormState(initialData);
      setFormData(merged);
      const normalized = normalizeAdminCategorySlug(String(merged.productType ?? ""));
      setSelectedCategory(
        CATEGORY_OPTIONS.some((c) => c.value === normalized)
          ? normalized
          : merged.productType
            ? CUSTOM_CATEGORY
            : CATEGORY_OPTIONS[0].value,
      );
    }
  }, [initialData]);

  useEffect(() => {
    if (state?.ok && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state?.ok, state?.redirectTo, router]);

  useEffect(() => {
    if (error) toast.error(error, { style: API_ERROR_TOAST_STYLE, duration: 6500 });
  }, [error]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const result = await api.upload.image(file);
        newUrls.push(result.url);
      }
      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...newUrls],
      }));
      toast.success(newUrls.length + " image(s) uploaded");
    } catch (err) {
      toast.error(formatApiErrorForUser(err), { style: API_ERROR_TOAST_STYLE, duration: 6500 });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function stripHtmlForSeo(html: string): string {
    return String(html || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeHtmlLite(s: string): string {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function runIdentifyFromFile(file: File) {
    setIdentifyLoading(true);
    try {
      const raw = await api.productAi.identifyFromImage(file);
      const data = normalizeProductIdentifyPayload(raw);
      if (!data.title || !data.description) {
        toast.error("AI did not return a usable title and description. Try a clearer product photo.");
        return;
      }

      const slug = slugifyHandleFromTitle(data.title);
      const coercedCat = coerceAdminProductCategory(data.productType ?? "", data.title);
      const descPlain = data.description;
      const descHtml =
        data.descriptionHtml.trim() ||
        `<p>${escapeHtmlLite(descPlain).replace(/\n/g, "<br/>")}</p>`;
      const tagsStr = data.tags;
      const ourP = data.ourPrice;
      const marketP = data.marketPrice;
      const seoTitle = data.seoTitle.trim().slice(0, 200) || data.title.slice(0, 70);
      const plainForSeo = stripHtmlForSeo(data.descriptionHtml || descPlain).slice(0, 160);
      const seoDesc =
        data.seoDescription.trim().slice(0, 320) ||
        plainForSeo ||
        descPlain.replace(/\s+/g, " ").trim().slice(0, 160);

      const wu = data.weightUnit.toLowerCase();
      const weightUnit: ProductFormData["weightUnit"] =
        wu === "kg" || wu === "g" || wu === "lb" || wu === "oz" ? wu : "kg";

      setSelectedCategory(coercedCat);

      setFormData((prev) => {
        const merged = withDerivedPrices({
          ...prev,
          title: data.title.slice(0, 200),
          description: descPlain,
          descriptionHtml: descHtml,
          vendor: data.vendor.slice(0, 200),
          productType: coercedCat,
          tags: tagsStr.slice(0, 500),
          specifications: data.specifications.slice(0, 8000),
          marketPrice: marketP || prev.marketPrice,
          ourPrice: ourP || prev.ourPrice,
          sku: data.sku.slice(0, 120) || prev.sku,
          barcode: data.barcode.slice(0, 120) || prev.barcode,
          weight: data.weight.slice(0, 32) || prev.weight,
          weightUnit,
          seoTitle,
          seoDescription: seoDesc,
          handle: prev.handle.trim() ? prev.handle : slug || prev.handle,
        });

        if (merged.variants.length === 1) {
          const v0 = merged.variants[0];
          const p = merged.ourPrice || merged.price;
          if (p && !String(v0.price ?? "").trim()) {
            return {
              ...merged,
              variants: [{ ...v0, price: p, sku: (v0.sku || merged.sku).slice(0, 120) }],
            };
          }
        }
        return merged;
      });

      toast.success(`PKR estimate: ${data.estimatedPrice}`);
      if (data.sources?.length) {
        toast.success(`Grounded from ${data.sources.length} web source(s).`, { duration: 4000 });
      }
    } catch (err) {
      toast.error(formatApiErrorForUser(err), { style: API_ERROR_TOAST_STYLE, duration: 8000 });
    } finally {
      setIdentifyLoading(false);
    }
  }

  async function identifyFromFirstGalleryImage() {
    const url = formData.imageUrls[0];
    if (!url) {
      toast.error("Upload at least one image in Media first, or pick a photo file.");
      return;
    }
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Could not read gallery image. Pick a file from your computer instead.");
      const blob = await res.blob();
      const ext = blob.type.includes("png") ? "png" : "jpg";
      const file = new File([blob], `gallery.${ext}`, { type: blob.type || "image/jpeg" });
      await runIdentifyFromFile(file);
    } catch (err) {
      toast.error(formatApiErrorForUser(err), { style: API_ERROR_TOAST_STYLE, duration: 6000 });
    }
  }

  async function generateProfessionalPhoto() {
    const desc = formData.description.trim();
    if (!desc) {
      toast.error("Add or generate a description first.");
      return;
    }
    setImageGenLoading(true);
    try {
      const { imageUrl } = await api.productAi.generateProductImage(desc);
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) throw new Error("Could not download generated image");
      const blob = await imgRes.blob();
      const file = new File([blob], "ai-product.webp", { type: blob.type || "image/webp" });
      const up = await api.upload.image(file);
      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, up.url],
      }));
      toast.success("Generated image added to Media gallery");
    } catch (err) {
      toast.error(formatApiErrorForUser(err), { style: API_ERROR_TOAST_STYLE, duration: 6500 });
    } finally {
      setImageGenLoading(false);
    }
  }

  function removeImage(index: number) {
    setFormData((prev) => {
      const newUrls = prev.imageUrls.filter((_, i) => i !== index);
      let newFeaturedIndex = prev.featuredImageIndex;
      if (prev.featuredImageIndex >= newUrls.length) {
        newFeaturedIndex = Math.max(0, newUrls.length - 1);
      }
      return {
        ...prev,
        imageUrls: newUrls,
        featuredImageIndex: newFeaturedIndex,
      };
    });
  }

  function setAsFeatured(index: number) {
    setFormData((prev) => ({ ...prev, featuredImageIndex: index }));
  }

  function addOption() {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { id: Date.now().toString(), name: "", values: [] }],
    }));
  }

  function updateOption(id: string, field: keyof ProductOption, value: any) {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt)),
    }));
  }

  function removeOption(id: string) {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((opt) => opt.id !== id),
    }));
  }

  function addOptionValue(optionId: string) {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt) => {
        if (opt.id === optionId) {
          return { ...opt, values: [...opt.values, ""] };
        }
        return opt;
      }),
    }));
  }

  function updateOptionValue(optionId: string, valueIndex: number, value: string) {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt) => {
        if (opt.id === optionId) {
          const newValues = [...opt.values];
          newValues[valueIndex] = value;
          return { ...opt, values: newValues };
        }
        return opt;
      }),
    }));
  }

  function removeOptionValue(optionId: string, valueIndex: number) {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt) => {
        if (opt.id === optionId) {
          return { ...opt, values: opt.values.filter((_, i) => i !== valueIndex) };
        }
        return opt;
      }),
    }));
  }

  function generateVariants() {
    if (formData.options.length === 0) return;

    // Generate all combinations of option values
    const combinations = formData.options.reduce((acc, option) => {
      const newAcc: Array<Record<string, string>> = [];
      acc.forEach((combination) => {
        option.values.forEach((value) => {
          newAcc.push({ ...combination, [option.name]: value });
        });
      });
      return newAcc.length > 0
        ? newAcc
        : option.values.map((value) => ({ [option.name]: value }));
    }, [] as Array<Record<string, string>>);

    const newVariants: ProductVariant[] = combinations.map((combo, i) => ({
      id: `new-${i}`,
      title: Object.values(combo).join(" / "),
      price: formData.price,
      sku: formData.sku,
      inventoryQuantity: formData.inventoryQuantity,
      options: combo,
      availableForSale: true,
    }));

    setFormData((prev) => ({
      ...prev,
      variants: newVariants,
    }));
    setShowVariants(true);
  }

  function updateVariant(index: number, field: keyof ProductVariant, value: any) {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    }));
  }

  function addVariant() {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: `new-${Date.now()}`,
          title: "",
          price: "",
          sku: "",
          inventoryQuantity: "0",
          options: {},
          availableForSale: true,
        },
      ],
    }));
  }

  function removeVariant(index: number) {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  }

  const fe = fieldErrors ?? {};
  const selectClassName =
    "w-full rounded-md border border-amber-300/30 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400";
  const textareaClassName =
    "w-full rounded-md border border-amber-300/30 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400";

  return (
    <form
      action={formAction}
      className="relative space-y-6 pb-24 lg:max-w-4xl lg:pb-8"
    >
      {/* Hidden fields */}
      <input type="hidden" name="imageUrls" value={formData.imageUrls.join(",")} />
      <input type="hidden" name="featuredImageIndex" value={formData.featuredImageIndex} />
      <input type="hidden" name="options" value={JSON.stringify(formData.options)} />
      <input type="hidden" name="variants" value={JSON.stringify(formData.variants)} />
      <input
        type="hidden"
        name="descriptionHtml"
        value={formData.descriptionHtml || formData.description}
      />
      <input
        type="hidden"
        name="requiresShipping"
        value={formData.requiresShipping ? "true" : "false"}
      />
      {hiddenFields &&
        Object.entries(hiddenFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}

      {/* Basic Info */}
      <AdminCard
        id="admin-product-basic"
        className="scroll-mt-28"
        title="Basic information"
        description="Name, story, and how this product is grouped on the storefront."
      >
        <div className="space-y-5">
          <div>
            <label className={FIELD_LABEL}>Title *</label>
            <Input
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              onBlur={() => {
                setFormData((prev) => {
                  if (prev.handle.trim() || !prev.title.trim()) return prev;
                  const base = slugifyHandleFromTitle(prev.title);
                  return base ? { ...prev, handle: base } : prev;
                });
              }}
              placeholder="e.g. AirPods Pro (2nd Gen)"
              required
            />
            {fe.title && <p className="text-red-500 text-xs mt-1">{fe.title}</p>}
          </div>

          <div>
            <label className={FIELD_LABEL}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={10}
              placeholder="Product description"
              className={textareaClassName}
            />
            <div className="mt-3 rounded-xl border border-dashed border-amber-400/40 bg-slate-950/60 p-4">
              <p className="text-sm font-medium text-slate-100">AI: PriceOye-style listing from a photo</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Sends the image to Gemini with <strong>Google Search</strong> (PKR / Pakistan retailers). Fills title,
                description + HTML, vendor, category, tags, specs, PKR prices, SKU, barcode, weight, SEO, and handle
                (if handle was empty).
              </p>
              <input
                ref={aiIdentifyInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void runIdentifyFromFile(f);
                  e.target.value = "";
                }}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  isLoading={identifyLoading}
                  leftIcon={<Wand2 className="h-4 w-4" aria-hidden />}
                  onClick={() => aiIdentifyInputRef.current?.click()}
                  className="border-amber-400/50 text-amber-100 hover:bg-amber-500/10"
                >
                  Pick photo &amp; auto-fill product (PKR)
                </Button>
                {formData.imageUrls.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    isLoading={identifyLoading}
                    leftIcon={<Sparkles className="h-4 w-4" aria-hidden />}
                    onClick={() => void identifyFromFirstGalleryImage()}
                  >
                    Use first Media image
                  </Button>
                )}
              </div>
              <div className="mt-4 border-t border-amber-400/20 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  isLoading={imageGenLoading}
                  leftIcon={<Sparkles className="h-4 w-4" aria-hidden />}
                  onClick={() => void generateProfessionalPhoto()}
                  className="border-amber-400/50 text-amber-100 hover:bg-amber-500/10"
                >
                  Generate professional photo (Replicate)
                </Button>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  Uses the description above. Needs <code className="rounded bg-slate-800 px-1">REPLICATE_API_TOKEN</code>{" "}
                  on the backend.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 sm:grid-cols-2 dark:border-zinc-700/80 dark:bg-zinc-900/40">
            <div>
              <label className={FIELD_LABEL}>Vendor</label>
              <Input
                name="vendor"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="Brand / vendor"
              />
            </div>
            <div>
              <label className={FIELD_LABEL}>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  const next = e.target.value;
                  setSelectedCategory(next);
                  if (next === CUSTOM_CATEGORY) {
                    setFormData((prev) => ({ ...prev, productType: "" }));
                  } else {
                    setFormData((prev) => ({ ...prev, productType: next }));
                  }
                }}
                className={selectClassName}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
                <option value={CUSTOM_CATEGORY}>Other (custom)</option>
              </select>
              <input type="hidden" name="productType" value={formData.productType} />
              {selectedCategory === CUSTOM_CATEGORY && (
                <Input
                  value={formData.productType}
                  onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  placeholder="Enter custom category"
                  className="mt-2"
                />
              )}
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                Used for homepage sections and <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-[10px] dark:bg-zinc-800">/collections/…</code> routing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={FIELD_LABEL}>Handle (URL slug)</label>
              <Input
                name="handle"
                value={formData.handle}
                onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                placeholder="auto-filled from title if left empty"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Leave blank to generate from the title on first save, or edit for SEO.
              </p>
            </div>
            <div>
              <label className={FIELD_LABEL}>Tags</label>
              <Input
                name="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          <div>
            <label className={FIELD_LABEL}>Specifications</label>
            <textarea
              name="specifications"
              value={formData.specifications}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              rows={8}
              placeholder={"RAM: 8GB\nStorage: 256GB\nBattery: 5000mAh"}
              className={textareaClassName}
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              One specification per line for the product detail page.
            </p>
          </div>
        </div>
      </AdminCard>

      {/* Images — early in the flow for better UX */}
      <AdminCard
        id="admin-product-media"
        className="scroll-mt-28"
        title="Media"
        description="Upload gallery images. The featured image is used on cards and listings."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="border-zinc-300 dark:border-zinc-600"
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {uploading ? "Uploading…" : "Upload images"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              PNG, JPG, WebP — you can select multiple files.
            </span>
          </div>

          {formData.imageUrls.length === 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 py-12 text-center transition hover:border-amber-400/50 hover:bg-amber-500/5 dark:border-zinc-700 dark:bg-zinc-900/30"
            >
              <Upload className="mb-2 h-8 w-8 text-zinc-400" aria-hidden />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Drop or click to add images
              </span>
              <span className="mt-1 text-xs text-zinc-500">Shown in order; set one as featured below.</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {formData.imageUrls.map((url, i) => (
                <div
                  key={url}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border-2 bg-zinc-100 transition dark:bg-zinc-800",
                    i === formData.featuredImageIndex
                      ? "border-amber-500 ring-2 ring-amber-500/30"
                      : "border-zinc-200 dark:border-zinc-700",
                  )}
                >
                  <div className="relative aspect-square w-full">
                    <Image
                      src={url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="120px"
                      loading="lazy"
                      unoptimized
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 opacity-0 transition group-hover:opacity-100">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 border-white/40 bg-white/90 text-xs text-zinc-900 hover:bg-white"
                      onClick={() => setAsFeatured(i)}
                    >
                      {i === formData.featuredImageIndex ? "Featured" : "Feature"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="h-8 px-2"
                      onClick={() => removeImage(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {i === formData.featuredImageIndex ? (
                    <div className="absolute left-2 top-2 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
                      Featured
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminCard>

      {/* Pricing */}
      <AdminCard
        id="admin-product-pricing"
        className="scroll-mt-28"
        title="Pricing"
        description="All amounts are stored and displayed in PKR."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={FIELD_LABEL}>Our price *</label>
              <Input
                name="ourPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.ourPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ourPrice: e.target.value,
                    price: e.target.value,
                  })
                }
                placeholder="0.00"
                required
              />
              <input type="hidden" name="price" value={formData.ourPrice} />
              {fe.price && <p className="text-red-500 text-xs mt-1">{fe.price}</p>}
            </div>
            <div>
              <label className={FIELD_LABEL}>Market price</label>
              <Input
                name="marketPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.marketPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    marketPrice: e.target.value,
                    compareAtPrice: e.target.value,
                  })
                }
                placeholder="0.00"
              />
              <input type="hidden" name="compareAtPrice" value={formData.marketPrice} />
              {fe.compareAtPrice && <p className="text-red-500 text-xs mt-1">{fe.compareAtPrice}</p>}
            </div>
            <div>
              <label className={FIELD_LABEL}>Cost per item</label>
              <Input
                name="costPerItem"
                type="number"
                min="0"
                step="0.01"
                value={formData.costPerItem}
                onChange={(e) => setFormData({ ...formData, costPerItem: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </AdminCard>

      {/* Inventory */}
      <AdminCard
        id="admin-product-inventory"
        className="scroll-mt-28"
        title="Inventory"
        description="Stock, identifiers, and oversell behavior."
      >
        <div className="space-y-4">
          <div>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/40">
              <input
                type="checkbox"
                name="trackQuantity"
                checked={formData.trackQuantity}
                onChange={(e) => setFormData({ ...formData, trackQuantity: e.target.checked })}
                value="true"
                className="h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Track quantity for this product
              </span>
            </label>
          </div>

          {formData.trackQuantity && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={FIELD_LABEL}>Quantity</label>
                <Input
                  name="inventoryQuantity"
                  type="number"
                  min="0"
                  value={formData.inventoryQuantity}
                  onChange={(e) => setFormData({ ...formData, inventoryQuantity: e.target.value })}
                  placeholder="0"
                />
                {fe.inventoryQuantity && <p className="text-red-500 text-xs mt-1">{fe.inventoryQuantity}</p>}
              </div>
              <div className="flex items-end pb-1">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name="continueSellingWhenOutOfStock"
                    checked={formData.continueSellingWhenOutOfStock}
                    onChange={(e) =>
                      setFormData({ ...formData, continueSellingWhenOutOfStock: e.target.checked })
                    }
                    value="true"
                    className="h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    Continue selling when out of stock
                  </span>
                </label>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={FIELD_LABEL}>SKU</label>
              <Input
                name="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="SKU-001"
              />
            </div>
            <div>
              <label className={FIELD_LABEL}>Barcode</label>
              <Input
                name="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="123456789"
              />
            </div>
          </div>
        </div>
      </AdminCard>

      {/* Shipping */}
      <AdminCard
        id="admin-product-shipping"
        className="scroll-mt-28"
        title="Shipping"
        description="Physical goods need weight for rate calculations."
      >
        <div className="space-y-4">
          <div>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/40">
              <input
                type="checkbox"
                checked={formData.requiresShipping}
                onChange={(e) => setFormData({ ...formData, requiresShipping: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Physical product (requires shipping)
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={FIELD_LABEL}>Weight</label>
              <Input
                name="weight"
                type="number"
                min="0"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="0.00"
              />
              {fe.weight && <p className="text-red-500 text-xs mt-1">{fe.weight}</p>}
            </div>
            <div>
              <label className={FIELD_LABEL}>Weight unit</label>
              <select
                name="weightUnit"
                value={formData.weightUnit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weightUnit: e.target.value as "kg" | "g" | "lb" | "oz",
                  })
                }
                className={selectClassName}
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="lb">Pounds (lb)</option>
                <option value="oz">Ounces (oz)</option>
              </select>
            </div>
          </div>
        </div>
      </AdminCard>

      {/* Options */}
      <AdminCard
        id="admin-product-options"
        className="scroll-mt-28"
        title="Options"
        description="e.g. Size, Color — used to generate variant combinations. Skip for a single-SKU product."
      >
        <div className="space-y-4">
          {formData.options.map((option) => (
            <div
              key={option.id}
              className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/30 p-4 dark:border-zinc-700 dark:bg-zinc-900/30"
            >
              <div className="flex items-center gap-2">
                <Input
                  value={option.name}
                  onChange={(e) => updateOption(option.id, "name", e.target.value)}
                  placeholder="Option name (e.g., Size, Color)"
                  className="flex-1"
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(option.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {option.values.map((value, valIndex) => (
                  <div key={valIndex} className="flex items-center gap-2">
                    <Input
                      value={value}
                      onChange={(e) => updateOptionValue(option.id, valIndex, e.target.value)}
                      placeholder="Option value"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOptionValue(option.id, valIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addOptionValue(option.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add value
                </Button>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={addOption}>
              <Plus className="mr-2 h-4 w-4" />
              Add option
            </Button>
            {formData.options.length > 0 ? (
              <Button type="button" onClick={generateVariants}>
                Generate variants from options
              </Button>
            ) : null}
          </div>
        </div>
      </AdminCard>

      {/* Variants */}
      {showVariants && formData.variants.length > 0 && (
        <AdminCard
          id="admin-product-variants"
          className="scroll-mt-28"
          title="Variants"
          description="Per-combination price, SKU, and stock."
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {formData.variants.length} variant{formData.variants.length === 1 ? "" : "s"}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowVariants(false)}
              className="text-zinc-600"
            >
              <ChevronUp className="mr-1 h-4 w-4" />
              Hide variants
            </Button>
          </div>
          <div className="space-y-4">
            {formData.variants.map((variant, index) => (
              <div
                key={variant.id}
                className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {variant.title || "Untitled variant"}
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className={FIELD_LABEL}>Price</label>
                    <Input
                      value={variant.price}
                      onChange={(e) => updateVariant(index, "price", e.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className={FIELD_LABEL}>SKU</label>
                    <Input
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, "sku", e.target.value)}
                      placeholder="SKU"
                    />
                  </div>
                  <div>
                    <label className={FIELD_LABEL}>Quantity</label>
                    <Input
                      value={variant.inventoryQuantity}
                      onChange={(e) => updateVariant(index, "inventoryQuantity", e.target.value)}
                      type="number"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={variant.availableForSale}
                      onChange={(e) => updateVariant(index, "availableForSale", e.target.checked)}
                      className="accent-primary"
                    />
                    <span className="text-sm">Available for sale</span>
                  </label>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addVariant}>
              <Plus className="h-4 w-4 mr-2" />
              Add variant
            </Button>
          </div>
        </AdminCard>
      )}

      {/* Status */}
      <AdminCard
        id="admin-product-status"
        className="scroll-mt-28"
        title="Status"
        description="Draft products are hidden from the storefront until you activate them."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(
            [
              {
                value: "ACTIVE" as const,
                label: "Active",
                hint: "Visible and purchasable",
              },
              {
                value: "DRAFT" as const,
                label: "Draft",
                hint: "Work in progress",
              },
              {
                value: "ARCHIVED" as const,
                label: "Archived",
                hint: "Hidden from catalog",
              },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className={cn(
                "relative flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-colors",
                formData.status === opt.value
                  ? "border-amber-500 bg-amber-500/5 shadow-sm ring-1 ring-amber-500/20"
                  : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900/40 dark:hover:border-zinc-600",
              )}
            >
              <input
                type="radio"
                name="status"
                value={opt.value}
                checked={formData.status === opt.value}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as ProductFormData["status"] })
                }
                className="sr-only"
              />
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {opt.label}
              </span>
              <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{opt.hint}</span>
            </label>
          ))}
        </div>
      </AdminCard>

      {/* SEO */}
      <AdminCard
        id="admin-product-seo"
        className="scroll-mt-28"
        title="Search appearance"
        description="How this product may show up in search results."
      >
        <div className="space-y-4">
          <div>
            <label className={FIELD_LABEL}>Page title</label>
            <Input
              name="seoTitle"
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              onBlur={() => {
                setFormData((prev) =>
                  !prev.seoTitle.trim() && prev.title.trim()
                    ? { ...prev, seoTitle: prev.title.trim() }
                    : prev,
                );
              }}
              placeholder="Defaults to product title if left blank"
            />
          </div>
          <div>
            <label className={FIELD_LABEL}>Meta description</label>
            <textarea
              name="seoDescription"
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              rows={3}
              placeholder="Short summary for Google and social previews (optional)"
              className={textareaClassName}
            />
          </div>
        </div>
      </AdminCard>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="hidden gap-3 lg:flex lg:pt-2">
        <Button type="submit" disabled={isPending} className="min-w-[140px]">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {submitLabel.replace("Create", "Creating").replace("Update", "Updating")}…
            </>
          ) : (
            submitLabel
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 lg:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-lg gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="flex-[2]">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}