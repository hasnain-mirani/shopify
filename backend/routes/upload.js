const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuid } = require("uuid");

const router = express.Router();
const uploadsDir = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuid() + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.post("/", upload.single("image"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image file provided" });
    const url = "/uploads/" + req.file.filename;
    res.json({ url, filename: req.file.filename, size: req.file.size });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/multiple", upload.array("images", 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: "No image files provided" });
    const files = req.files.map((f) => ({
      url: "/uploads/" + f.filename,
      filename: f.filename,
      size: f.size,
    }));
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
