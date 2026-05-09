import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { queryAll, queryOne, execute } from '@/lib/db';

export async function GET() {
  try {
    const users = await queryAll("SELECT id, email, display_name, created_at FROM users ORDER BY created_at DESC LIMIT 1000");
    return NextResponse.json(users);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, password, displayName } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Required fields missing" }, { status: 400 });

    const id = uuid();
    await execute("INSERT INTO users (id, email, password, display_name) VALUES (?, ?, ?, ?)", [id, email, password, displayName || ""]);
    const user = await queryOne("SELECT id, email, display_name, created_at FROM users WHERE id = ?", [id]);
    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    if (err.message.includes("UNIQUE")) return NextResponse.json({ error: "Email exists" }, { status: 400 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
