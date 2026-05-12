// Load environment variables
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { init: initDb } = require("./database");
const productsRouter = require("./routes/products");
const ordersRouter = require("./routes/orders");
const cartRouter = require("./routes/cart");
const settingsRouter = require("./routes/settings");
const uploadRouter = require("./routes/upload");
const fcmTokensRouter = require("./routes/fcm-tokens");
const notifyRouter = require("./routes/notify");
const usersRouter = require("./routes/users");
const siteNotificationsRouter = require("./routes/site-notifications");
const productAiRouter = require("./routes/product-ai");

const app = express();
const PORT = process.env.PORT || 4000;
let dbInitPromise = null;

function normalizeOrigin(value) {
  return String(value || "").trim().replace(/\/$/, "");
}

function parseOriginList(raw) {
  return String(raw || "")
    .split(",")
    .map((v) => normalizeOrigin(v))
    .filter(Boolean);
}

// Allowed origins for CORS
const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  ...parseOriginList(process.env.FRONTEND_URL),   // supports comma-separated values
  ...parseOriginList(process.env.FRONTEND_URLS),  // optional dedicated list
].map(normalizeOrigin).filter(Boolean));

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    const normalized = normalizeOrigin(origin);
    if (!allowedOrigins.has(normalized)) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/cart", cartRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/fcm-tokens", fcmTokensRouter);
app.use("/api/notify", notifyRouter);
app.use("/api/users", usersRouter);
app.use("/api/site-notifications", siteNotificationsRouter);
app.use("/api/product-ai", productAiRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "Shopify Store Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      products: "/api/products",
      orders: "/api/orders",
      cart: "/api/cart",
      settings: "/api/settings",
      upload: "/api/upload",
      users: "/api/users",
      productAi: "/api/product-ai (POST …/identify-from-image, …/generate-image)",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

function ensureDbInitialized() {
  if (!dbInitPromise) {
    dbInitPromise = initDb().catch((err) => {
      dbInitPromise = null;
      throw err;
    });
  }
  return dbInitPromise;
}

// For Vercel serverless runtime
async function handler(req, res) {
  await ensureDbInitialized();
  return app(req, res);
}

module.exports = handler;
module.exports.app = app;
module.exports.handler = handler;
module.exports.ensureDbInitialized = ensureDbInitialized;

// Local/dev server entrypoint
if (require.main === module) {
  ensureDbInitialized().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Allowed origins: ${Array.from(allowedOrigins).join(', ')}`);
    });
  }).catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
}
