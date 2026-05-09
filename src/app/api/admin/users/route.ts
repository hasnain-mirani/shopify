import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/users`, { cache: 'no-store' });
    let data;
    try {
      data = await res.json();
    } catch {
      const text = await res.text();
      return NextResponse.json({ error: `Backend returned non-JSON (${res.status}): ${text.substring(0, 100)}` }, { status: res.status || 500 });
    }

    if (!res.ok) return NextResponse.json({ error: data?.error || "Backend error" }, { status: res.status });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      const text = await res.text();
      return NextResponse.json({ error: `Backend returned non-JSON (${res.status}): ${text.substring(0, 100)}` }, { status: res.status || 500 });
    }

    if (!res.ok) return NextResponse.json({ error: data?.error || "Backend error" }, { status: res.status });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
