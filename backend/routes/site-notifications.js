const express = require("express");
const { queryAll } = require("../db-helpers");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const recipientEmail = String(req.query.email || "").trim().toLowerCase();

    // Fetch global notifications + user-targeted notifications (if email provided)
    const notifications = recipientEmail
      ? await queryAll(
          `SELECT id, title, body, url, created_at
           FROM site_notifications
           WHERE target_type = 'all'
              OR (target_type = 'user' AND LOWER(recipient_email) = ?)
           ORDER BY created_at DESC
           LIMIT ?`,
          [recipientEmail, limit]
        )
      : await queryAll(
          `SELECT id, title, body, url, created_at
           FROM site_notifications
           WHERE target_type = 'all'
           ORDER BY created_at DESC
           LIMIT ?`,
          [limit]
        );

    res.json({ notifications });
  } catch (err) {
    console.error("[SiteNotifications API]", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
