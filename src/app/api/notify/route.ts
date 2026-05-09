import { NextResponse } from "next/server";

const BACKEND_API_BASE = process.env.BACKEND_API_URL || "http://localhost:4000/api";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const res = await fetch(`${BACKEND_API_BASE.replace(/\/$/, "")}/notify`, {
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
