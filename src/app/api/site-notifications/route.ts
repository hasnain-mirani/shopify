import { NextResponse } from "next/server";
import { getProxyApiBase } from "@/lib/backend-url";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "20";
    const email = (searchParams.get("email") || "").trim();
    const qs = new URLSearchParams({ limit });
    if (email) qs.set("email", email);

    const base = getProxyApiBase();
    const res = await fetch(`${base}/site-notifications?${qs.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ notifications: [] });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ notifications: [] });
  }
}
