import { NextRequest, NextResponse } from "next/server";
import { getNextAppApiBase } from "@/lib/backend-url";

function normalizeUserRow(row: Record<string, unknown>) {
  const id = String(row.id ?? row.uid ?? "");
  const created = row.created_at ?? row.creationTime ?? row.createdAt;
  return {
    uid: id,
    id,
    email: row.email ?? "",
    displayName: row.display_name ?? row.displayName ?? "",
    creationTime: created,
  };
}


export async function GET(request: NextRequest) {
  try {
    const base = getNextAppApiBase(request);
    const res = await fetch(`${base}/users`, { cache: "no-store" });
    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : [];
    } catch {
      return NextResponse.json(
        { error: `Backend returned non-JSON (${res.status}): ${text.substring(0, 200)}` },
        { status: res.status || 500 },
      );
    }

    if (!res.ok) {
      const msg =
        typeof data === "object" && data !== null && "error" in data
          ? String((data as { error: string }).error)
          : "Backend error";
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    if (!Array.isArray(data)) {
      return NextResponse.json([]);
    }

    return NextResponse.json(data.map((row) => normalizeUserRow(row as Record<string, unknown>)));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reach backend";
    return NextResponse.json(
      {
        error: `${message}. Is the API running and is DATABASE_URL set on Vercel?`,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const base = getNextAppApiBase(request);
    const res = await fetch(`${base}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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

    if (!res.ok) {
      return NextResponse.json({ error: data?.error || "Backend error" }, { status: res.status });
    }
    if (data && typeof data === "object") {
      return NextResponse.json(normalizeUserRow(data as Record<string, unknown>));
    }
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
