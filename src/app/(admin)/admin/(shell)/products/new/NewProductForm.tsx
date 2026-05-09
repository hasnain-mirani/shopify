"use client";

import Image from "next/image";
import { useActionState, useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { createProductAction, type ProductFormState, type ProductOption, type ProductVariant } from "./actions";
import { AdminCard } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api-client";
import { Upload, X, Loader2, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const initialState: ProductFormState = {};

export function NewProductForm() {
  const [state, formAction, pending] = useActionState(createProductAction, initialState);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [featuredImageIndex, setFeaturedImageIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [trackQuantity, setTrackQuantity] = useState(true);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [showVariants, setShowVariants] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

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
      setUploadedUrls((prev) => [...prev, ...newUrls]);
      toast.success(newUrls.length + " image(s) uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
    if (featuredImageIndex >= uploadedUrls.length - 1) {
      setFeaturedImageIndex(Math.max(0, uploadedUrls.length - 2));
    }
  }

  function setAsFeatured(index: number) {
    setFeaturedImageIndex(index);
  }

  function addOption() {
    setOptions([...options, { id: Date.now().toString(), name: "", values: [] }]);
  }

  function updateOption(id: string, field: keyof ProductOption, value: any) {
    setOptions(options.map(opt => opt.id === id ? { ...opt, [field]: value } : opt));
  }

  function removeOption(id: string) {
    setOptions(options.filter(opt => opt.id !== id));
  }

  function addOptionValue(optionId: string) {
    setOptions(options.map(opt => {
      if (opt.id === optionId) {
        return { ...opt, values: [...opt.values, ""] };
      }
      return opt;
    }));
  }

  function updateOptionValue(optionId: string, valueIndex: number, value: string) {
    setOptions(options.map(opt => {
      if (opt.id === optionId) {
        const newValues = [...opt.values];
        newValues[valueIndex] = value;
        return { ...opt, values: newValues };
      }
      return opt;
    }));
  }

  function removeOptionValue(optionId: string, valueIndex: number) {
    setOptions(options.map(opt => {
      if (opt.id === optionId) {
        return { ...opt, values: opt.values.filter((_, i) => i !== valueIndex) };
      }
      return opt;
    }));
  }

  function generateVariants() {
    if (options.length === 0) return;

    // Generate all combinations of option values
    const combinations = options.reduce((acc, option) => {
      const newAcc: Array<Record<string, string>> = [];
      acc.forEach(combination => {
        option.values.forEach(value => {
          newAcc.push({ ...combination, [option.name]: value });
        });
      });
      return newAcc.length > 0 ? newAcc : option.values.map(value => ({ [option.name]: value }));
    }, [] as Array<Record<string, string>>);

    const newVariants: ProductVariant[] = combinations.map((combo, i) => ({
      id: `new-${i}`,
      title: Object.values(combo).join(" / "),
      price: "",
      sku: "",
      inventoryQuantity: "0",
      options: combo,
      availableForSale: true,
    }));

    setVariants(newVariants);
    setShowVariants(true);
  }

  function updateVariant(index: number, field: keyof ProductVariant, value: any) {
    setVariants(variants.map((v, i) => i === index ? { ...v, [field]: value } : v));
  }

  function addVariant() {
    setVariants([...variants, {
      id: `new-${Date.now()}`,
      title: "",
      price: "",
      sku: "",
      inventoryQuantity: "0",
      options: {},
      availableForSale: true,
    }]);
  }

  function removeVariant(index: number) {
    setVariants(variants.filter((_, i) => i !== index));
  }

  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6 max-w-4xl">
      {/* Hidden fields */}
      <input type="hidden" name="imageUrls" value={uploadedUrls.join(",")} />
      <input type="hidden" name="featuredImageIndex" value={featuredImageIndex} />
      <input type="hidden" name="options" value={JSON.stringify(options)} />
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />

      {/* Basic Info */}
      <AdminCard title="Basic Information">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <Input name="title" placeholder="Product title" required />
            {fe.title && <p className="text-red-500 text-xs mt-1">{fe.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              rows={4}
              placeholder="Product description"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vendor</label>
              <Input name="vendor" placeholder="Brand / vendor" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Product Type</label>
              <Input name="productType" placeholder="Category / type" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Handle (URL slug)</label>
              <Input name="handle" placeholder="product-handle" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <Input name="tags" placeholder="tag1, tag2, tag3" />
            </div>
          </div>
        </div>
      </AdminCard>

      {/* Pricing */}
      <AdminCard title="Pricing">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price *</label>
              <Input name="price" type="number" min="0" step="0.01" placeholder="0.00" required />
              {fe.price && <p className="text-red-500 text-xs mt-1">{fe.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Compare at price</label>
              <Input name="compareAtPrice" type="number" min="0" step="0.01" placeholder="0.00" />
              {fe.compareAtPrice && <p className="text-red-500 text-xs mt-1">{fe.compareAtPrice}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cost per item</label>
              <Input name="costPerItem" type="number" min="0" step="0.01" placeholder="0.00" />
            </div>
          </div>
        </div>
      </AdminCard>

      {/* Inventory */}
      <AdminCard title="Inventory">
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="trackQuantity"
                checked={trackQuantity}
                onChange={(e) => setTrackQuantity(e.target.checked)}
                value="true"
                className="accent-primary"
              />
              <span className="text-sm font-medium">Track quantity</span>
            </label>
          </div>

          {trackQuantity && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <Input name="inventoryQuantity" type="number" min="0" placeholder="0" />
                {fe.inventoryQuantity && <p className="text-red-500 text-xs mt-1">{fe.inventoryQuantity}</p>}
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer mt-6">
                  <input
                    type="checkbox"
                    name="continueSellingWhenOutOfStock"
                    value="true"
                    className="accent-primary"
                  />
                  <span className="text-sm">Continue selling when out of stock</span>
                </label>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">SKU (Stock Keeping Unit)</label>
              <Input name="sku" placeholder="SKU-001" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Barcode (ISBN, UPC, GTIN, etc.)</label>
              <Input name="barcode" placeholder="123456789" />
            </div>
          </div>
        </div>
      </AdminCard>

      {/* Shipping */}
      <AdminCard title="Shipping">
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="requiresShipping"
                defaultChecked
                value="true"
                className="accent-primary"
              />
              <span className="text-sm font-medium">This is a physical product</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Weight</label>
              <Input name="weight" type="number" min="0" step="0.01" placeholder="0.00" />
              {fe.weight && <p className="text-red-500 text-xs mt-1">{fe.weight}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight unit</label>
              <select
                name="weightUnit"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
      <AdminCard title="Options (Size, Color, etc.)">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Add options like size or color to create variants. Leave empty for a single variant product.
          </p>

          {options.map((option, optIndex) => (
            <div key={option.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={option.name}
                  onChange={(e) => updateOption(option.id, "name", e.target.value)}
                  placeholder="Option name (e.g., Size, Color)"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(option.id)}
                >
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

          <Button
            type="button"
            variant="outline"
            onClick={addOption}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add option
          </Button>

          {options.length > 0 && (
            <Button
              type="button"
              onClick={generateVariants}
              className="ml-2"
            >
              Generate variants
            </Button>
          )}
        </div>
      </AdminCard>

      {/* Variants */}
      {showVariants && variants.length > 0 && (
        <AdminCard title="Variants">
          <div className="flex justify-end mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowVariants(!showVariants)}
            >
              {showVariants ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={variant.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{variant.title}</div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariant(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price</label>
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
                    <label className="block text-sm font-medium mb-1">SKU</label>
                    <Input
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, "sku", e.target.value)}
                      placeholder="SKU"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity</label>
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

            <Button
              type="button"
              variant="outline"
              onClick={addVariant}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add variant
            </Button>
          </div>
        </AdminCard>
      )}

      {/* Images */}
      <AdminCard title="Images">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {uploading ? "Uploading…" : "Upload Images"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {uploadedUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {uploadedUrls.map((url, i) => (
                <div
                  key={url}
                  className={`relative group rounded-lg overflow-hidden border-2 ${
                    i === featuredImageIndex ? "border-blue-500 ring-2 ring-blue-500 ring-offset-2" : "border-gray-200"
                  }`}
                >
                  <div className="relative h-32 w-full">
                    <Image
                      src={url}
                      alt={`Product image ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="120px"
                      loading="lazy"
                      unoptimized
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setAsFeatured(i)}
                    >
                      {i === featuredImageIndex ? "Featured" : "Set Featured"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeImage(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {i === featuredImageIndex && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Featured
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminCard>

      {/* Status */}
      <AdminCard title="Status">
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="status" value="ACTIVE" defaultChecked className="accent-primary" />
            <span className="text-sm">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="status" value="DRAFT" className="accent-primary" />
            <span className="text-sm">Draft</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="status" value="ARCHIVED" className="accent-primary" />
            <span className="text-sm">Archived</span>
          </label>
        </div>
      </AdminCard>

      {/* SEO */}
      <AdminCard title="Search engine listing preview">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Page title</label>
            <Input name="seoTitle" placeholder="Page title" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Meta description</label>
            <textarea
              name="seoDescription"
              rows={3}
              placeholder="A brief description for search engines"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      </AdminCard>

      {state.error && (
        <p className="text-red-500 text-sm">{state.error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
