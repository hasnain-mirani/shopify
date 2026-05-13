import { NextResponse } from "next/server";
import { queryOne, execute } from "@/lib/db";
import { serializeProductRow } from "../serialize-product";

export async function GET(
  _req: Request,
  context: { params: Promise<{ handle: string }> },
) {
  try {
    const { handle: raw } = await context.params;
    const handle = decodeURIComponent(raw || "").trim();
    if (!handle) {
      return NextResponse.json({ error: "Handle required" }, { status: 400 });
    }

    const p = await queryOne(
      "SELECT * FROM products WHERE LOWER(handle) = LOWER(?) OR id = ? LIMIT 1",
      [handle, handle],
    );
    if (!p) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(await serializeProductRow(p));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ handle: string }> },
) {
  try {
    const { handle: id } = await context.params;
    const existing = await queryOne("SELECT id, handle FROM products WHERE id = ?", [id]);
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const body = await req.json();
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
    } = body;

    if (!title || !title.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

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
    if (dup) return NextResponse.json({ error: "Another product already uses this handle." }, { status: 409 });

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
          const optionId = crypto.randomUUID();
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
                [crypto.randomUUID(), optionId, value, valIndex],
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
      const variantId = variant.id || crypto.randomUUID();
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
          variant.weight != null && variant.weight !== "" ? Number(variant.weight) : null,
          variant.weightUnit || weightUnit,
          variant.availableForSale !== false ? 1 : 0,
        ],
      );
    }

    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      for (const [i, url] of imageUrls.entries()) {
        await execute("INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (?, ?, ?, ?, ?)", [
          crypto.randomUUID(),
          id,
          url,
          title,
          i,
        ]);
      }
    }

    return NextResponse.json({ ok: true, id, handle });
  } catch (err: any) {
    if (err.message && err.message.includes("UNIQUE")) {
      return NextResponse.json({ error: "A product with this handle already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ handle: string }> },
) {
  try {
    const { handle: id } = await context.params;
    await execute("DELETE FROM products WHERE id = ?", [id]);
    return NextResponse.json({ ok: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
