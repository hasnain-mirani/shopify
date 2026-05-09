import { NextResponse } from "next/server";
import { queryAll, execute } from "@/lib/db";
import { serializeProductRow } from "./serialize-product";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    let sql = "SELECT * FROM products WHERE 1=1";
    const params: any[] = [];
    if (status) { sql += " AND status = ?"; params.push(status); }
    if (search) { sql += " AND (title LIKE ? OR handle LIKE ?)"; params.push("%" + search + "%", "%" + search + "%"); }
    sql += " ORDER BY updated_at DESC LIMIT ?";
    params.push(limit);

    const products = await queryAll(sql, params);
    const result = await Promise.all(products.map((p: Record<string, unknown>) => serializeProductRow(p)));
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title, description = "", descriptionHtml = "", vendor = "", productType = "", status = "DRAFT",
      handle: customHandle, tags = [], specifications = "", marketPrice, ourPrice, price = 0,
      compareAtPrice, costPerItem, sku = "", barcode = "", trackQuantity = true, inventoryQuantity = 100,
      continueSellingWhenOutOfStock = false, requiresShipping = true, weight, weightUnit = "kg",
      imageUrls = [], options = [], variants = [], seoTitle = "", seoDescription = ""
    } = body;

    if (!title || !title.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const id = crypto.randomUUID();
    const handle = customHandle || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + id.slice(0, 6);

    await execute(
      `INSERT INTO products (
        id, title, handle, description, description_html, specifications, vendor, product_type, status,
        tags, market_price, our_price, cost_per_item, barcode, track_quantity,
        continue_selling_when_out_of_stock, requires_shipping, weight, weight_unit,
        seo_title, seo_description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, title.trim(), handle, description, descriptionHtml, specifications, vendor, productType, status,
        JSON.stringify(tags), marketPrice ? Number(marketPrice) : null, ourPrice ? Number(ourPrice) : null,
        costPerItem ? Number(costPerItem) : null, barcode, trackQuantity ? 1 : 0,
        continueSellingWhenOutOfStock ? 1 : 0, requiresShipping ? 1 : 0, weight ? Number(weight) : null,
        weightUnit, seoTitle, seoDescription
      ]
    );

    if (options && Array.isArray(options)) {
      for (const [optIndex, option] of options.entries()) {
        const optionId = crypto.randomUUID();
        await execute("INSERT INTO product_options (id, product_id, name, position) VALUES (?, ?, ?, ?)", [optionId, id, option.name, optIndex]);
        for (const [valIndex, value] of option.values.entries()) {
          await execute("INSERT INTO product_option_values (id, option_id, value, position) VALUES (?, ?, ?, ?)", [crypto.randomUUID(), optionId, value, valIndex]);
        }
      }
    }

    const variantsToCreate = variants && Array.isArray(variants) && variants.length > 0 ? variants : [{ title: "Default Title", price, sku, inventoryQuantity, availableForSale: true }];
    for (const [index, variant] of variantsToCreate.entries()) {
      await execute(
        `INSERT INTO product_variants (id, product_id, title, sku, price, compare_at_price, quantity, position, barcode, weight, weight_unit, available_for_sale)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), id, variant.title || "Default Title", variant.sku || "", Number(variant.price) || 0, variant.compareAtPrice ? Number(variant.compareAtPrice) : null, Number(variant.inventoryQuantity) || 100, index, variant.barcode || "", variant.weight ? Number(variant.weight) : null, variant.weightUnit || "kg", variant.availableForSale !== false ? 1 : 0]
      );
    }

    if (imageUrls && Array.isArray(imageUrls)) {
      for (const [i, url] of imageUrls.entries()) {
        await execute("INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (?, ?, ?, ?, ?)", [crypto.randomUUID(), id, url, title, i]);
      }
    }

    return NextResponse.json({ ok: true, id, handle }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
