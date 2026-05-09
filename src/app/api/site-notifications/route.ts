import { NextResponse } from "next/server";

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL;
const BACKEND_URL =
  RAW_API_URL && /^https?:\/\//.test(RAW_API_URL)
    ? RAW_API_URL.replace(/\/$/, "")
    : "http://localhost:4000/api";

export const dynamic = "force-dynamic"; // Always fetch latest notifications

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "20";
    const email = (searchParams.get("email") || "").trim();
    const qs = new URLSearchParams({ limit });
    if (email) qs.set("email", email);

    const res = await fetch(`${BACKEND_URL}/site-notifications?${qs.toString()}`, {
      cache: 'no-store' 
    });

    if (!res.ok) {
      // Keep storefront resilient even when notifications backend/table is unavailable.
      return NextResponse.json({ notifications: [] });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ notifications: [] });
  }
}
