import { NextRequest, NextResponse } from "next/server";
import { getBackendApiBase } from "@/lib/backend-url";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const { uid } = await params;
    const base = getBackendApiBase();
    const res = await fetch(`${base}/users/${uid}`, {
      method: "DELETE",
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
