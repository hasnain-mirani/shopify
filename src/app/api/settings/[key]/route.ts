import { NextResponse } from "next/server";
import { execute } from "@/lib/db";

/** PUT /api/settings/:key — matches Express and api-client.settings.update */
export async function PUT(
  req: Request,
  context: { params: Promise<{ key: string }> },
) {
  try {
    const { key } = await context.params;
    const decodedKey = decodeURIComponent(key || "").trim();
    if (!decodedKey) {
      return NextResponse.json({ error: "Key required" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const value = body?.value != null ? String(body.value) : "";

    await execute(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      [decodedKey, value],
    );
    return NextResponse.json({ key: decodedKey, value });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
