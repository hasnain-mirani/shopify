import { NextResponse } from "next/server";
import { getProxyApiBase } from "@/lib/backend-url";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const base = getProxyApiBase();
    const res = await fetch(`${base}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data: Record<string, unknown> = {};
    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      data = { error: text || "Invalid backend response" };
    }

    if (!res.ok) {
      return NextResponse.json({ error: data.error || "Failed to send notification" }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send notification";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
