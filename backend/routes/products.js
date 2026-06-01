const express = require("express");
const { v4: uuid } = require("uuid");
const { queryAll, queryOne, execute } = require("../db-helpers");

const router = express.Router();

/** Match storefront variant picker — same rules as Next `serialize-product.ts`. */
function selectedOptionsFromVariantTitle(title, optionsOrdered) {
  if (!optionsOrdered || !optionsOrdered.length) return [];
  const t = String(title || "").trim();
  if (!t) return [];

  if (optionsOrdered.length === 1) {
    const only = optionsOrdered[0];
    const byValue = only.values.find((v) => v.toLowerCase() === t.toLowerCase());
    if (byValue) return [{ name: only.name, value: byValue }];
    if (t.toLowerCase() === "default title" && only.values[0]) {
      return [{ name: only.name, value: only.values[0] }];
    }
    return [{ name: only.name, value: t }];
  }

  const parts = t.split(/\s*\/\s*/).map((s) => s.trim()).filter(Boolean);
  if (parts.length === optionsOrdered.length) {
    return optionsOrdered.map((opt, i) => ({ name: opt.name, value: parts[i] }));
  }

  const usedPartIdx = new Set();
  const out = [];
  for (const opt of optionsOrdered) {
    let hit;
    let partIdx = -1;
    for (const v of opt.values) {
      const j = parts.findIndex(
        (p, pi) => !usedPartIdx.has(pi) && p.toLowerCase() === v.toLowerCase(),
      );
      if (j !== -1) {
        hit = v;
        partIdx = j;
        break;
      }
    }
    if (hit === undefined || partIdx < 0) return [];
    usedPartIdx.add(partIdx);
    out.push({ name: opt.name, value: hit });
  }
  return out;
}

router.get("/", async (req, res) => {
  try {
    const {
      status,
      search,
      tag,
      newArrivals,
      inStock,
      sort = "updated_desc",
      limit = 50,
      offset = 0,
    } = req.query;

    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];
    if (status) { sql += " AND status = ?"; params.push(status); }
    if (search) { sql += " AND (title ILIKE ? OR handle ILIKE ?)"; params.push("%" + search + "%", "%" + search + "%"); }
    if (inStock === "1" || inStock === "true") { sql += " AND status = 'ACTIVE'"; }

    const newArrivalsOn = newArrivals === "1" || newArrivals === "true";
    if (!newArrivalsOn && tag) {
      const t = String(tag).trim();
      if (t) {
        sql += " AND tags ILIKE ?";
        params.push("%" + t + "%");
      }
    }

    const orderSql = {
      updated_desc: "updated_at DESC NULLS LAST",
      created_desc: "created_at DESC NULLS LAST",
      created_asc: "created_at ASC NULLS LAST",
      title_asc: "title ASC NULLS LAST",
    };
    sql += " ORDER BY " + (orderSql[sort] || orderSql.updated_desc);
    sql += " LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const products = await queryAll(sql, params);
    let result = await Promise.all(products.map(async (p) => {
      const images = await queryAll("SELECT * FROM product_images WHERE product_id = ? ORDER BY position", [p.id]);
      const variants = await queryAll("SELECT * FROM product_variants WHERE product_id = ? ORDER BY position", [p.id]);
      const options = await queryAll("SELECT * FROM product_options WHERE product_id = ? ORDER BY position", [p.id]);
      const tags = JSON.parse(p.tags || "[]");
      const prices = variants.map((v) => v.price);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      const comparePrices = variants
        .map((v) => v.compare_at_price)
        .filter((x) => x != null && x > 0);
      const minCompare = comparePrices.length > 0 ? Math.min(...comparePrices) : null;

      // Enrich options with their values
      const optionsWithValues = await Promise.all(options.map(async opt => {
        const values = await queryAll("SELECT * FROM product_option_values WHERE option_id = ? ORDER BY position", [opt.id]);
        return { ...opt, values: values.map(v => v.value) };
      }));

      const optionTuples = optionsWithValues.map((o) => ({ name: o.name, values: o.values }));

      return {
        id: p.id, title: p.title, handle: p.handle, description: p.description, descriptionHtml: p.description_html || p.description,
        specifications: p.specifications || "",
        vendor: p.vendor, productType: p.product_type, status: p.status, tags,
        marketPrice: p.market_price, ourPrice: p.our_price, costPerItem: p.cost_per_item, barcode: p.barcode,
        trackQuantity: p.track_quantity === 1, continueSellingWhenOutOfStock: p.continue_selling_when_out_of_stock === 1,
        requiresShipping: p.requires_shipping === 1, weight: p.weight, weightUnit: p.weight_unit,
        seoTitle: p.seo_title, seoDescription: p.seo_description,
        availableForSale: p.status === "ACTIVE",
        featuredImage: images[0] || null, images,
        options: optionsWithValues,
        compareAtPriceRange:
          minCompare != null && minCompare > minPrice
            ? {
                minVariantPrice: { amount: String(minCompare), currencyCode: "PKR" },
                maxVariantPrice: { amount: String(Math.max(...comparePrices)), currencyCode: "PKR" },
              }
            : undefined,
        variants: variants.map((v) => ({
          id: v.id, title: v.title, sku: v.sku,
          price: { amount: String(v.price), currencyCode: "PKR" },
          compareAtPrice: v.compare_at_price ? { amount: String(v.compare_at_price), currencyCode: "PKR" } : null,
          availableForSale: p.status === "ACTIVE" && v.quantity > 0 && v.available_for_sale === 1,
          quantityAvailable: v.quantity,
          selectedOptions: selectedOptionsFromVariantTitle(v.title, optionTuples),
          barcode: v.barcode, weight: v.weight, weightUnit: v.weight_unit,
        })),
        priceRange: {
          minVariantPrice: { amount: String(minPrice), currencyCode: "PKR" },
          maxVariantPrice: { amount: String(maxPrice), currencyCode: "PKR" },
        },
        createdAt: p.created_at, updatedAt: p.updated_at,
      };
    }));

    if (sort === "price_asc" || sort === "price_desc") {
      const mul = sort === "price_desc" ? -1 : 1;
      result.sort((a, b) => {
        const pa = Number.parseFloat(a.priceRange?.minVariantPrice?.amount ?? "0");
        const pb = Number.parseFloat(b.priceRange?.minVariantPrice?.amount ?? "0");
        return mul * (pa - pb);
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:handle", async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.handle || "").trim();
    const product = await queryOne(
      "SELECT * FROM products WHERE LOWER(handle) = LOWER(?) OR id = ? LIMIT 1",
      [key, key],
    );
    if (!product) return res.status(404).json({ error: "Product not found" });

    const images = await queryAll("SELECT * FROM product_images WHERE product_id = ? ORDER BY position", [product.id]);
    const variants = await queryAll("SELECT * FROM product_variants WHERE product_id = ? ORDER BY position", [product.id]);
    const options = await queryAll("SELECT * FROM product_options WHERE product_id = ? ORDER BY position", [product.id]);
    const tags = JSON.parse(product.tags || "[]");
    const prices = variants.map((v) => v.price);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    const descHtml = product.description_html || product.description.replace(/</g, "&lt;").replace(/\n/g, "<br/>");

    // Enrich options with their values
    const optionsWithValues = await Promise.all(options.map(async opt => {
      const values = await queryAll("SELECT * FROM product_option_values WHERE option_id = ? ORDER BY position", [opt.id]);
      return { id: opt.id, name: opt.name, values: values.map(v => v.value) };
    }));

    const optionTuples = optionsWithValues.map((o) => ({ name: o.name, values: o.values }));
    const comparePrices = variants
      .map((v) => v.compare_at_price)
      .filter((x) => x != null && x > 0);
    const minCompare = comparePrices.length > 0 ? Math.min(...comparePrices) : null;

    res.json({
      id: product.id, title: product.title, handle: product.handle,
      description: product.description, descriptionHtml: descHtml, specifications: product.specifications || "",
      vendor: product.vendor, productType: product.product_type, status: product.status, tags,
      marketPrice: product.market_price, ourPrice: product.our_price, costPerItem: product.cost_per_item, barcode: product.barcode,
      trackQuantity: product.track_quantity === 1, continueSellingWhenOutOfStock: product.continue_selling_when_out_of_stock === 1,
      requiresShipping: product.requires_shipping === 1, weight: product.weight, weightUnit: product.weight_unit,
      seoTitle: product.seo_title, seoDescription: product.seo_description,
      availableForSale: product.status === "ACTIVE",
      featuredImage: images[0] || null, images, options: optionsWithValues,
      compareAtPriceRange:
        minCompare != null && minCompare > minPrice
          ? {
              minVariantPrice: { amount: String(minCompare), currencyCode: "PKR" },
              maxVariantPrice: { amount: String(Math.max(...comparePrices)), currencyCode: "PKR" },
            }
          : undefined,
      variants: variants.map((v) => ({
        id: v.id, title: v.title, sku: v.sku,
        price: { amount: String(v.price), currencyCode: "PKR" },
        compareAtPrice: v.compare_at_price ? { amount: String(v.compare_at_price), currencyCode: "PKR" } : null,
        availableForSale: product.status === "ACTIVE" && v.quantity > 0 && v.available_for_sale === 1,
        quantityAvailable: v.quantity,
        selectedOptions: selectedOptionsFromVariantTitle(v.title, optionTuples),
        barcode: v.barcode, weight: v.weight, weightUnit: v.weight_unit,
      })),
      priceRange: {
        minVariantPrice: { amount: String(minPrice), currencyCode: "PKR" },
        maxVariantPrice: { amount: String(maxPrice), currencyCode: "PKR" },
      },
      seo: { title: product.seo_title || product.title, description: product.seo_description || product.description.slice(0, 160) },
      createdAt: product.created_at, updatedAt: product.updated_at,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      title,
      description = "",
      descriptionHtml = "",
      vendor = "",
      productType = "",
      status = "DRAFT",
      handle: customHandle,
      tags = [],
      specifications = "",
      marketPrice,
      ourPrice,
      price = 0,
      compareAtPrice,
      costPerItem,
      sku = "",
      barcode = "",
      trackQuantity = true,
      inventoryQuantity = 100,
      continueSellingWhenOutOfStock = false,
      requiresShipping = true,
      weight,
      weightUnit = "kg",
      imageUrls = [],
      featuredImageIndex = 0,
      options = [],
      variants = [],
      seoTitle = "",
      seoDescription = ""
    } = req.body;

    if (!title || !title.trim()) return res.status(400).json({ error: "Title is required" });

    const id = uuid();
    const handle = customHandle || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + id.slice(0, 6);

    await execute(
      `INSERT INTO products (
        id, title, handle, description, description_html, specifications, vendor, product_type, status,
        tags, market_price, our_price, cost_per_item, barcode, track_quantity,
        continue_selling_when_out_of_stock, requires_shipping, weight, weight_unit,
        seo_title, seo_description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title.trim(),
        handle,
        description,
        descriptionHtml,
        specifications,
        vendor,
        productType,
        status,
        JSON.stringify(tags),
        marketPrice ? Number(marketPrice) : null,
        ourPrice ? Number(ourPrice) : null,
        costPerItem ? Number(costPerItem) : null,
        barcode,
        trackQuantity ? 1 : 0,
        continueSellingWhenOutOfStock ? 1 : 0,
        requiresShipping ? 1 : 0,
        weight ? Number(weight) : null,
        weightUnit,
        seoTitle,
        seoDescription
      ]
    );

    // Handle options
    if (options && Array.isArray(options) && options.length > 0) {
      for (const [optIndex, option] of options.entries()) {
        if (option.name && option.values && Array.isArray(option.values)) {
          const optionId = uuid();
          await execute("INSERT INTO product_options (id, product_id, name, position) VALUES (?, ?, ?, ?)",
            [optionId, id, option.name, optIndex]);

          for (const [valIndex, value] of option.values.entries()) {
            if (value) {
              await execute("INSERT INTO product_option_values (id, option_id, value, position) VALUES (?, ?, ?, ?)",
                [uuid(), optionId, value, valIndex]);
            }
          }
        }
      }
    }

    // Handle variants
    const variantsToCreate = variants && Array.isArray(variants) && variants.length > 0
      ? variants
      : [{
          title: "Default Title",
          price: price,
          sku: sku,
          inventoryQuantity: inventoryQuantity,
          availableForSale: true
        }];

    for (const [index, variant] of variantsToCreate.entries()) {
      const variantId = variant.id || uuid();
      await execute(
        `INSERT INTO product_variants (
          id, product_id, title, sku, price, compare_at_price, quantity, position,
          barcode, weight, weight_unit, available_for_sale
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          variantId,
          id,
          variant.title || "Default Title",
          variant.sku || "",
          Number(variant.price) || Number(price) || 0,
          variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
          Number(variant.inventoryQuantity) || Number(inventoryQuantity) || 100,
          index,
          variant.barcode || "",
          variant.weight ? Number(variant.weight) : null,
          variant.weightUnit || weightUnit,
          variant.availableForSale !== false ? 1 : 0
        ]
      );
    }

    // Handle images
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      for (const [i, url] of imageUrls.entries()) {
        await execute("INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (?, ?, ?, ?, ?)",
          [uuid(), id, url, title, i]);
      }
    }

    const product = await queryOne("SELECT * FROM products WHERE id = ?", [id]);
    const images = await queryAll("SELECT * FROM product_images WHERE product_id = ?", [id]);
    const dbVariants = await queryAll("SELECT * FROM product_variants WHERE product_id = ?", [id]);
    const dbOptions = await queryAll("SELECT * FROM product_options WHERE product_id = ?", [id]);

    // Enrich options with their values
    const optionsWithValues = await Promise.all(dbOptions.map(async opt => {
      const values = await queryAll("SELECT * FROM product_option_values WHERE option_id = ?", [opt.id]);
      return { ...opt, values };
    }));

    res.status(201).json({
      ...product,
      images,
      variants: dbVariants,
      options: optionsWithValues,
      handle
    });
  } catch (err) {
    if (err.message && err.message.includes("UNIQUE")) return res.status(409).json({ error: "A product with this handle already exists" });
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await queryOne("SELECT id, handle FROM products WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "Product not found" });

    const {
      title,
      description = "",
      descriptionHtml = "",
      vendor = "",
      productType = "",
      status = "DRAFT",
      handle: customHandle,
      tags = [],
      specifications = "",
      marketPrice,
      ourPrice,
      price = 0,
      compareAtPrice,
      costPerItem,
      sku = "",
      barcode = "",
      trackQuantity = true,
      inventoryQuantity = 100,
      continueSellingWhenOutOfStock = false,
      requiresShipping = true,
      weight,
      weightUnit = "kg",
      imageUrls = [],
      options = [],
      variants = [],
      seoTitle = "",
      seoDescription = "",
    } = req.body;

    if (!title || !title.trim()) return res.status(400).json({ error: "Title is required" });

    const handle =
      (customHandle && String(customHandle).trim()) ||
      existing.handle ||
      String(title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
        "-" +
        id.slice(0, 6);

    const dup = await queryOne("SELECT id FROM products WHERE handle = ? AND id != ?", [handle, id]);
    if (dup) return res.status(409).json({ error: "Another product already uses this handle." });

    await execute("DELETE FROM product_variants WHERE product_id = ?", [id]);
    await execute(
      "DELETE FROM product_option_values WHERE option_id IN (SELECT id FROM product_options WHERE product_id = ?)",
      [id],
    );
    await execute("DELETE FROM product_options WHERE product_id = ?", [id]);
    await execute("DELETE FROM product_images WHERE product_id = ?", [id]);

    await execute(
      `UPDATE products SET
        title = ?, handle = ?, description = ?, description_html = ?, specifications = ?,
        vendor = ?, product_type = ?, status = ?, tags = ?,
        market_price = ?, our_price = ?, cost_per_item = ?, barcode = ?,
        track_quantity = ?, continue_selling_when_out_of_stock = ?, requires_shipping = ?,
        weight = ?, weight_unit = ?, seo_title = ?, seo_description = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        title.trim(),
        handle,
        description,
        descriptionHtml,
        specifications,
        vendor,
        productType,
        status,
        JSON.stringify(Array.isArray(tags) ? tags : []),
        marketPrice != null && marketPrice !== "" ? Number(marketPrice) : null,
        ourPrice != null && ourPrice !== "" ? Number(ourPrice) : null,
        costPerItem != null && costPerItem !== "" ? Number(costPerItem) : null,
        barcode,
        trackQuantity ? 1 : 0,
        continueSellingWhenOutOfStock ? 1 : 0,
        requiresShipping ? 1 : 0,
        weight != null && weight !== "" ? Number(weight) : null,
        weightUnit,
        seoTitle,
        seoDescription,
        id,
      ],
    );

    if (options && Array.isArray(options) && options.length > 0) {
      for (const [optIndex, option] of options.entries()) {
        if (option.name && option.values && Array.isArray(option.values)) {
          const optionId = uuid();
          await execute("INSERT INTO product_options (id, product_id, name, position) VALUES (?, ?, ?, ?)", [
            optionId,
            id,
            option.name,
            optIndex,
          ]);

          for (const [valIndex, value] of option.values.entries()) {
            if (value) {
              await execute(
                "INSERT INTO product_option_values (id, option_id, value, position) VALUES (?, ?, ?, ?)",
                [uuid(), optionId, value, valIndex],
              );
            }
          }
        }
      }
    }

    const variantsToCreate =
      variants && Array.isArray(variants) && variants.length > 0
        ? variants
        : [
            {
              title: "Default Title",
              price,
              sku,
              inventoryQuantity,
              availableForSale: true,
            },
          ];

    for (const [index, variant] of variantsToCreate.entries()) {
      const variantId = variant.id || uuid();
      await execute(
        `INSERT INTO product_variants (
          id, product_id, title, sku, price, compare_at_price, quantity, position,
          barcode, weight, weight_unit, available_for_sale
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          variantId,
          id,
          variant.title || "Default Title",
          variant.sku || "",
          Number(variant.price) || Number(price) || 0,
          variant.compareAtPrice != null
            ? Number(variant.compareAtPrice)
            : compareAtPrice != null && compareAtPrice !== ""
              ? Number(compareAtPrice)
              : null,
          Number(variant.inventoryQuantity) || Number(inventoryQuantity) || 0,
          index,
          variant.barcode || "",
          variant.weight != null ? Number(variant.weight) : null,
          variant.weightUnit || weightUnit,
          variant.availableForSale !== false ? 1 : 0,
        ],
      );
    }

    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      for (const [i, url] of imageUrls.entries()) {
        await execute("INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (?, ?, ?, ?, ?)", [
          uuid(),
          id,
          url,
          title,
          i,
        ]);
      }
    }

    const product = await queryOne("SELECT * FROM products WHERE id = ?", [id]);
    const images = await queryAll("SELECT * FROM product_images WHERE product_id = ? ORDER BY position", [id]);
    const dbVariants = await queryAll("SELECT * FROM product_variants WHERE product_id = ? ORDER BY position", [id]);
    const dbOptions = await queryAll("SELECT * FROM product_options WHERE product_id = ? ORDER BY position", [id]);
    const optionsWithValues = await Promise.all(
      dbOptions.map(async (opt) => {
        const values = await queryAll("SELECT * FROM product_option_values WHERE option_id = ? ORDER BY position", [
          opt.id,
        ]);
        return { ...opt, values };
      }),
    );

    res.json({
      ...product,
      images,
      variants: dbVariants,
      options: optionsWithValues,
      handle,
    });
  } catch (err) {
    if (err.message && err.message.includes("UNIQUE")) {
      return res.status(409).json({ error: "A product with this handle already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await queryOne("SELECT id FROM products WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "Product not found" });

    await execute("DELETE FROM product_variants WHERE product_id = ?", [id]);
    await execute(
      "DELETE FROM product_option_values WHERE option_id IN (SELECT id FROM product_options WHERE product_id = ?)",
      [id],
    );
    await execute("DELETE FROM product_options WHERE product_id = ?", [id]);
    await execute("DELETE FROM product_images WHERE product_id = ?", [id]);
    await execute("DELETE FROM products WHERE id = ?", [id]);
    res.json({ ok: true, deletedId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
