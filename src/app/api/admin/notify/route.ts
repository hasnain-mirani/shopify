import { NextRequest, NextResponse } from "next/server";

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getBackendUrl(request: NextRequest): string {
  if (/^https?:\/\//.test(RAW_API_URL)) {
    return RAW_API_URL.replace(/\/$/, "");
  }

  const origin = new URL(request.url).origin;
  if (RAW_API_URL.startsWith("/")) {
    return `${origin}${RAW_API_URL}`.replace(/\/$/, "");
  }

  return `${origin}/${RAW_API_URL}`.replace(/\/$/, "");
}

/**
 * POST /api/admin/notify
 * Proxies to the backend /api/notify which uses Firebase Admin SDK
 * to broadcast to all subscribed FCM tokens.
 */
export async function POST(request: NextRequest) {
  try {
    const { title, body, url } = await request.json();
    if (!title || !body) {
      return NextResponse.json({ error: "title and body are required" }, { status: 400 });
    }

    const backendUrl = getBackendUrl(request);
    const res = await fetch(`${backendUrl}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, url }),
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: `Backend returned non-JSON (${res.status}): ${text.substring(0, 100)}` }, { status: res.status || 500 });
    }

    if (!res.ok) {
      return NextResponse.json({ error: data?.error || "Backend error" }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
