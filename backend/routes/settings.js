const express = require("express");
const { queryAll, execute } = require("../db-helpers");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const rows = await queryAll("SELECT * FROM settings", []);
    const settings = {};
    rows.forEach((r) => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:key", async (req, res) => {
  try {
    const { value } = req.body;
    await execute(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", 
      [req.params.key, String(value)]
    );
    res.json({ key: req.params.key, value: String(value) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
