import { NextRequest, NextResponse } from "next/server";
import { getProxyApiBase } from "@/lib/backend-url";

/**
 * POST /api/admin/notify
 * Proxies to Express /api/notify (Firebase Admin).
 */
export async function POST(request: NextRequest) {
  try {
    const { title, body, url } = await request.json();
    if (!title || !body) {
      return NextResponse.json({ error: "title and body are required" }, { status: 400 });
    }

    const base = getProxyApiBase();
    const res = await fetch(`${base}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, url }),
    });

    const text = await res.text();
    let data: Record<string, unknown>;
    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      return NextResponse.json(
        { error: `Backend returned non-JSON (${res.status}): ${text.substring(0, 100)}` },
        { status: res.status || 500 },
      );
    }

    if (!res.ok) {
      return NextResponse.json({ error: data?.error || "Backend error" }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
