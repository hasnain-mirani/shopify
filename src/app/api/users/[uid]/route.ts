import { NextResponse } from "next/server";
import { execute, queryOne } from "@/lib/db";

/** DELETE /api/users/:uid — matches Express and admin customer delete */
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ uid: string }> },
) {
  try {
    const { uid } = await context.params;
    if (!uid?.trim()) {
      return NextResponse.json({ error: "User id required" }, { status: 400 });
    }

    const existing = await queryOne("SELECT id FROM users WHERE id = ?", [uid]);
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await execute("DELETE FROM users WHERE id = ?", [uid]);
    return NextResponse.json({ ok: true, deletedId: uid });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
