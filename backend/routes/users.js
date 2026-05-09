const express = require("express");
const { v4: uuid } = require("uuid");
const { queryAll, queryOne, execute } = require("../db-helpers");

const router = express.Router();

// Helper to hash passwords (simple implementation - use bcrypt in production)
function hashPassword(password) {
  // In production, use bcrypt or similar
  return password; // TODO: Implement proper password hashing
}

// GET /api/users
router.get("/", async (req, res) => {
  try {
    const users = await queryAll("SELECT id, email, display_name, created_at FROM users ORDER BY created_at DESC LIMIT 1000");
    res.json(users);
  } catch (err) {
    console.error("[Users GET]", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users
router.post("/", async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const id = uuid();
    const hashedPassword = hashPassword(password);

    await execute("INSERT INTO users (id, email, password, display_name) VALUES (?, ?, ?, ?)",
      [id, email, hashedPassword, displayName || ""]);

    const user = await queryOne("SELECT id, email, display_name, created_at FROM users WHERE id = ?", [id]);
    res.status(201).json(user);
  } catch (err) {
    console.error("[Users POST]", err);
    if (err.message && err.message.includes("UNIQUE")) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:uid
router.delete("/:uid", async (req, res) => {
  try {
    await execute("DELETE FROM users WHERE id = ?", [req.params.uid]);
    res.json({ ok: true });
  } catch (err) {
    console.error("[Users DELETE]", err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
