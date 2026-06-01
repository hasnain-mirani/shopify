import { NextRequest, NextResponse } from "next/server";
import { getNextAppApiBase } from "@/lib/backend-url";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const { uid } = await params;
    const base = getNextAppApiBase(request);
    const res = await fetch(`${base}/users/${encodeURIComponent(uid)}`, {
      method: "DELETE",
    });

    let data;
    try {
      data = await res.json();
    } catch {
      const text = await res.text();
      return NextResponse.json(
        { error: `Backend returned non-JSON (${res.status}): ${text.substring(0, 100)}` },
        { status: res.status || 500 },
      );
    }

    if (!res.ok) return NextResponse.json({ error: data?.error || "Backend error" }, { status: res.status });
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
