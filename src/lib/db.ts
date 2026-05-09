import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

function translateSql(sql: string): string {
  let paramCount = 0;
  return sql
    .replace(/\?/g, () => {
      paramCount++;
      return `$${paramCount}`;
    })
    .replace(/datetime\('now'\)/g, "NOW()");
}

export async function queryAll(sql: string, params: any[] = []) {
  const translatedSql = translateSql(sql);
  const res = await pool.query(translatedSql, params);
  return res.rows;
}

export async function queryOne(sql: string, params: any[] = []) {
  const rows = await queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function execute(sql: string, params: any[] = []) {
  const translatedSql = translateSql(sql);
  await pool.query(translatedSql, params);
}

export { pool };
