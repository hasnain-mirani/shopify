const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

function translateSql(sql) {
  let paramCount = 0;
  return sql
    .replace(/\?/g, () => {
      paramCount++;
      return `$${paramCount}`;
    })
    .replace(/datetime\('now'\)/g, "NOW()")
    .replace(/INSERT OR REPLACE/g, "INSERT") // Fallback, better to handle in code or SQL
    .replace(/INSERT OR IGNORE/g, "INSERT");
}

async function queryAll(sql, params = []) {
  try {
    const translatedSql = translateSql(sql);
    const res = await pool.query(translatedSql, params);
    return res.rows;
  } catch (err) {
    console.error("Database Query Error:", { sql, translatedSql: translateSql(sql), params, error: err.message });
    throw err;
  }
}

async function queryOne(sql, params = []) {
  const rows = await queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

async function execute(sql, params = []) {
  try {
    const translatedSql = translateSql(sql);
    await pool.query(translatedSql, params);
  } catch (err) {
    console.error("Database Execute Error:", { sql, translatedSql: translateSql(sql), params, error: err.message });
    throw err;
  }
}

module.exports = { queryAll, queryOne, execute, pool };
