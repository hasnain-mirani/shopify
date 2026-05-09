import { NextResponse } from "next/server";

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL;
const BACKEND_URL =
  RAW_API_URL && /^https?:\/\//.test(RAW_API_URL)
    ? RAW_API_URL.replace(/\/$/, "")
    : "http://localhost:4000/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/fcm-tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text || "Invalid backend response" };
    }

    if (!res.ok) {
      return NextResponse.json({ error: data.error || "Failed to save FCM token" }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save FCM token" }, { status: 500 });
  }
}
