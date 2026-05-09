import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
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
      "SELECT * FROM products WHERE LOWER(handle) = LOWER(?) LIMIT 1",
      [handle],
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
