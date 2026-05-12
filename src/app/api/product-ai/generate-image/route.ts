import { NextRequest, NextResponse } from "next/server";
import { getBackendApiBase } from "@/lib/backend-url";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const base = getBackendApiBase();
    const url = `${base}/product-ai/generate-image`;
    const body = await req.text();

    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: body || "{}",
      cache: "no-store",
    });

    const text = await res.text();
    const ct = res.headers.get("content-type") || "application/json";
    return new NextResponse(text, { status: res.status, headers: { "content-type": ct } });
  } catch (err) {
    console.error("[api/product-ai/generate-image] proxy:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Proxy failed. Start Express and set BACKEND_API_URL in .env.local.",
      },
      { status: 502 },
    );
  }
}
