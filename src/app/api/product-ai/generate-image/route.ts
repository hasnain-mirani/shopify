import { NextRequest, NextResponse } from "next/server";
import {
  getBackendApiBase,
  getBackendApiHostHint,
  getBackendProxyMisconfigMessage,
} from "@/lib/backend-url";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const misconfig = getBackendProxyMisconfigMessage();
  if (misconfig) {
    return NextResponse.json({ error: misconfig }, { status: 502 });
  }

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
    const msg = err instanceof Error ? err.message : "Proxy failed";
    const host = getBackendApiHostHint();
    const hint =
      msg === "fetch failed" || /failed to fetch/i.test(msg)
        ? `Could not reach the API at ${host}. Start the Express backend locally or set BACKEND_API_URL on Vercel (Next project) to your deployed /api base.`
        : undefined;
    return NextResponse.json(
      { error: msg, ...(hint ? { hint } : {}) },
      { status: 502 },
    );
  }
}
