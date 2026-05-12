import { NextRequest, NextResponse } from "next/server";
import { getBackendApiBase } from "@/lib/backend-url";

export const dynamic = "force-dynamic";

/**
 * Browser uses NEXT_PUBLIC_API_URL=/api (same-origin). Express implements Gemini;
 * this handler forwards multipart to the backend.
 */
export async function POST(req: NextRequest) {
  try {
    const base = getBackendApiBase();
    const url = `${base}/product-ai/identify-from-image`;
    const contentType = req.headers.get("content-type");
    const body = await req.arrayBuffer();

    const res = await fetch(url, {
      method: "POST",
      headers: contentType ? { "content-type": contentType } : {},
      body,
      cache: "no-store",
    });

    const text = await res.text();
    const ct = res.headers.get("content-type") || "application/json";
    return new NextResponse(text, { status: res.status, headers: { "content-type": ct } });
  } catch (err) {
    console.error("[api/product-ai/identify-from-image] proxy:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Proxy failed. Start Express (`cd backend && npm start`) and set BACKEND_API_URL in .env.local.",
      },
      { status: 502 },
    );
  }
}
