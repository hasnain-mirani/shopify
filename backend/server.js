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

const app = express();
const PORT = process.env.PORT || 4000;
let dbInitPromise = null;

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  process.env.FRONTEND_URL, // Add your deployed frontend URL
].filter(Boolean);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
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
      users: "/api/users"
    }
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

module.exports = { app, handler, ensureDbInitialized };

// Local/dev server entrypoint
if (require.main === module) {
  ensureDbInitialized().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
    });
  }).catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
}
