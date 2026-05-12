import { NextRequest, NextResponse } from "next/server";
import {
  getBackendApiBase,
  getBackendApiHostHint,
  getBackendProxyMisconfigMessage,
} from "@/lib/backend-url";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Browser uses NEXT_PUBLIC_API_URL=/api (same-origin). Express implements Gemini;
 * this handler forwards multipart to the backend.
 */
export async function POST(req: NextRequest) {
  const misconfig = getBackendProxyMisconfigMessage();
  if (misconfig) {
    return NextResponse.json({ error: misconfig }, { status: 502 });
  }

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
    const msg = err instanceof Error ? err.message : "Proxy failed";
    const host = getBackendApiHostHint();
    const hint =
      msg === "fetch failed" || /failed to fetch/i.test(msg)
        ? `Could not reach the API at ${host}. Local: run the backend (cd backend && npm start) and keep BACKEND_API_URL=http://127.0.0.1:4000/api. Vercel: set BACKEND_API_URL on the Next project to your live Express /api URL and redeploy.`
        : undefined;
    return NextResponse.json(
      {
        error: msg,
        ...(hint ? { hint } : {}),
      },
      { status: 502 },
    );
  }
}
