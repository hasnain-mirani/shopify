const { pool } = require("./db-helpers");
const fs = require("fs");
const path = require("path");

async function init() {
  try {
    console.log("Initializing Supabase connection...");
    await pool.query("SELECT 1");
    console.log("Connected to Supabase PostgreSQL.");

    // Ensure uploads directory exists (local / Render disk). Vercel serverless FS is read-only — skip there.
    const uploadsDir = path.join(__dirname, "uploads");
    if (!process.env.VERCEL && !fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // You might want to run the DDL here if it's the first time
    // For now, I'll assume the user ran setup-supabase.js or I will run it.
  } catch (err) {
    console.error("Failed to connect to Supabase:", err.message);
    throw err;
  }
}

// Mock saveDb for compatibility
function saveDb() {}

module.exports = { init, saveDb };
