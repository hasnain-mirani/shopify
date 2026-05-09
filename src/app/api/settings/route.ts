import { NextResponse } from 'next/server';
import { queryAll, execute } from '@/lib/db';

export async function GET() {
  try {
    const rows = await queryAll("SELECT * FROM settings");
    const settings: Record<string, any> = {};
    rows.forEach((r: any) => { settings[r.key] = r.value; });
    return NextResponse.json(settings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { key, value } = await req.json();
    if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 });
    
    await execute(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      [key, String(value)]
    );
    return NextResponse.json({ key, value });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
