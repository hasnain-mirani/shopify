const express = require("express");
const { queryAll, execute } = require("../db-helpers");

const router = express.Router();

// Save or update an FCM token for a user
router.post("/", async (req, res) => {
  try {
    const { token, userId = "", userEmail = "" } = req.body;
    if (!token) return res.status(400).json({ error: "token is required" });

    await execute(
      `INSERT INTO fcm_tokens (token, user_id, user_email, updated_at)
       VALUES (?, ?, ?, NOW())
       ON CONFLICT (token) DO UPDATE SET 
         user_id = EXCLUDED.user_id,
         user_email = EXCLUDED.user_email,
         updated_at = NOW()`,
      [token, userId, userEmail]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all stored tokens (used internally by notify route)
router.get("/", async (_req, res) => {
  try {
    const tokens = await queryAll("SELECT token, user_email FROM fcm_tokens", []);
    res.json(tokens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
