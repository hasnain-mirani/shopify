const express = require("express");
const { execute } = require("../db-helpers");
const crypto = require("crypto");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { title, body, url } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: "Title and body are required" });
    }

    const id = crypto.randomUUID();
    
    // Insert into site_notifications table
    await execute(
      `INSERT INTO site_notifications (id, title, body, url, target_type, recipient_email, created_at)
       VALUES (?, ?, ?, ?, 'all', '', NOW())`,
      [id, title, body, url || ""]
    );

    res.json({
      ok: true,
      sent: 1,
      message: "Notification saved to database successfully",
    });
  } catch (err) {
    console.error("[Notify API]", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
