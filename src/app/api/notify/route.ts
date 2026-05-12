import { NextResponse } from "next/server";
import { getBackendApiBase } from "@/lib/backend-url";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const base = getBackendApiBase();
    const res = await fetch(`${base}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text || "Invalid backend response" };
    }

    if (!res.ok) {
      return NextResponse.json({ error: data.error || "Failed to send notification" }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to send notification" }, { status: 500 });
  }
}
