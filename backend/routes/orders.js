const express = require("express");
const { v4: uuid } = require("uuid");
const { queryAll, queryOne, execute } = require("../db-helpers");
const nodemailer = require("nodemailer");

const router = express.Router();

const {
  DEFAULT_ADMIN_ORDER_EMAIL: DEFAULT_ADMIN_EMAIL,
  buildOrderEmailContext,
  renderCustomerOrderEmail,
  renderAdminOrderEmail,
} = require("../lib/order-emails");

function isPlaceholderEmail(email) {
  const e = String(email || "").trim().toLowerCase();
  if (!e.includes("@")) return true;
  const d = e.split("@")[1] || "";
  return d === "example.com" || d.endsWith(".example.com");
}

/** Buyer inbox only — not settings `store_email` or *@example.com */
async function sanitizeCustomerEmail(raw, queryOne) {
  const s = String(raw || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return "";
  if (isPlaceholderEmail(s)) return "";
  const settingsRows = await queryOne("SELECT value FROM settings WHERE key = 'store_email'", []);
  const shop = String(settingsRows?.value || "").trim().toLowerCase();
  if (shop && s === shop) return "";
  return s;
}

async function resolveAdminEmail(queryOne) {
  const settingsRows = await queryOne("SELECT value FROM settings WHERE key = 'store_email'", []);
  const db = String(settingsRows?.value || "").trim().toLowerCase();
  const fromEnv = String(process.env.ADMIN_ORDER_EMAIL || "").split(",")[0].trim().toLowerCase();
  if (fromEnv && !isPlaceholderEmail(fromEnv)) return fromEnv;
  if (db && !isPlaceholderEmail(db)) return db;
  return DEFAULT_ADMIN_EMAIL;
}

async function sendOrderConfirmationEmail(order, items) {
  try {
    let transporter;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const host = process.env.SMTP_HOST || "smtp.gmail.com";
      const port = parseInt(process.env.SMTP_PORT || "587", 10);
      const secure = port === 465;
      transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        requireTLS: !secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: { servername: host },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000,
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const ctx = buildOrderEmailContext(order, items, {
      storeName: process.env.STORE_DISPLAY_NAME || "SSHUB",
    });
    const buyerEmail = await sanitizeCustomerEmail(order.customer_email, queryOne);
    const adminEmail = await resolveAdminEmail(queryOne);
    const fromUser = process.env.SMTP_USER || "noreply@sshub.store";
    const storeName = ctx.storeName;

    if (buyerEmail) {
      await transporter.sendMail({
        from: `"${storeName}" <${fromUser}>`,
        to: buyerEmail,
        subject: `${storeName} — Order placed · #${ctx.shortId}`,
        html: renderCustomerOrderEmail(ctx),
      });
    }

    await transporter.sendMail({
      from: `"${storeName} · Orders" <${fromUser}>`,
      to: adminEmail,
      replyTo: buyerEmail || undefined,
      subject: `[${storeName}] New order #${ctx.shortId} · Rs. ${ctx.total.toLocaleString("en-PK")}`,
      html: renderAdminOrderEmail(ctx),
    });

    console.log("Order confirmation emails sent.");
  } catch (err) {
    console.error("Failed to send order email:", {
      message: err.message,
      code: err.code,
      command: err.command,
      stack: err.stack,
    });
  }
}

async function sendShippingConfirmationEmail(order) {
  try {
    let transporter;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "mail.arcturuslogic.com",
        port: parseInt(process.env.SMTP_PORT || "465"),
        secure: (process.env.SMTP_PORT || "465") === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const recipient = order.customer_email;
    if (!recipient) return;

    await transporter.sendMail({
      from: `"SSHUB" <${process.env.SMTP_USER || "noreply@sshub.store"}>`,
      to: recipient,
      subject: `Your Order #${order.id.split('-')[0].toUpperCase()} has been shipped!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #1a1a1a; text-align: center;">Great news! Your order is on its way.</h2>
          <p>Hi ${order.customer_name || 'Customer'},</p>
          <p>Your order <strong>#${order.id.split('-')[0].toUpperCase()}</strong> has been shipped and is heading your way.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">Status</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #12603a; text-transform: uppercase;">Shipped</p>
          </div>

          <p>You can track your order using the link below (if available) or by logging into your account.</p>
          
          <div style="margin: 20px 0;">
            <strong>Shipping to:</strong><br/>
            ${order.customer_name}<br/>
            ${order.address || ''}<br/>
            ${order.city}, ${order.country}
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
          <p style="font-size: 12px; color: #999; text-align: center;">
            Thank you for shopping with SSHUB!
          </p>
        </div>
      `,
    });

    console.log("Shipping confirmation email sent to:", recipient);
  } catch (err) {
    console.error("Failed to send shipping email:", {
      message: err.message,
      code: err.code,
      command: err.command,
      stack: err.stack
    });
  }
}

async function sendAdminPushNotification(order) {
  try {
    const primary = await resolveAdminEmail(queryOne);
    const extras = (process.env.ADMIN_ORDER_EMAIL || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((e) => e && !isPlaceholderEmail(e));

    const emailsToNotify = [...new Set([primary.toLowerCase(), DEFAULT_ADMIN_EMAIL.toLowerCase(), ...extras])];

    const tokensSet = new Set();
    for (const em of emailsToNotify) {
      const rows = await queryAll("SELECT token FROM fcm_tokens WHERE user_email = ?", [em]);
      for (const r of rows) {
        if (r.token) tokensSet.add(r.token);
      }
    }
    const tokens = Array.from(tokensSet);

    if (tokens.length === 0) return; // Admin hasn't subscribed to notifications on any device

    let admin;
    try {
      admin = require("firebase-admin");
    } catch {
      return; // firebase-admin not installed
    }

    if (!admin.apps.length) return; // Admin SDK not initialized

    const message = {
      tokens,
      notification: {
        title: "New Order Received! 🛍️",
        body: `Order #${order.id.split('-')[0].toUpperCase()} for PKR ${order.total} was just placed.`,
      },
      webpush: {
        fcmOptions: { link: "/admin/orders" },
        notification: { icon: "/favicon.ico" },
      },
      data: { url: "/admin/orders" },
    };

    const result = await admin.messaging().sendEachForMulticast(message);
    console.log(`[FCM] Admin order notification sent: ${result.successCount} ok, ${result.failureCount} failed`);
  } catch (err) {
    console.error("[FCM] Failed to send admin push notification:", err);
  }
}

async function createUserOrderNotification(order, items) {
  try {
    const email = String(order.customer_email || "").trim().toLowerCase();
    if (!email) return;

    const itemCount = items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
    const orderShortId = String(order.id || "").split("-")[0]?.toUpperCase() || "ORDER";
    const amount = Number(order.total || order.subtotal || 0).toFixed(0);
    const title = `Order Confirmed #${orderShortId}`;
    const body = `${itemCount} item(s) | PKR ${amount} | ${order.customer_name || "Customer"}, your order is placed successfully.`;

    await execute(
      `INSERT INTO site_notifications
       (id, title, body, url, target_type, recipient_email, created_at)
       VALUES (?, ?, ?, ?, 'user', ?, NOW())`,
      [uuid(), title, body, `/checkout/success?orderId=${order.id}`, email]
    );
  } catch (err) {
    console.error("[Notifications] Failed to create user order notification:", err);
  }
}

router.get("/", async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const orders = await queryAll("SELECT * FROM orders ORDER BY created_at DESC LIMIT ?", [Number(limit)]);
    const result = await Promise.all(orders.map(async (o) => {
      const items = await queryAll("SELECT * FROM order_items WHERE order_id = ?", [o.id]);
      return { ...o, items };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const order = (await queryAll("SELECT * FROM orders WHERE id = ?", [req.params.id]))[0];
    if (!order) return res.status(404).json({ error: "Order not found" });
    const items = await queryAll("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/kpis", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const orders = await queryAll("SELECT * FROM orders WHERE created_at >= ?", [today]);
    const total = orders.reduce((sum, o) => sum + o.total, 0);
    const aov = orders.length > 0 ? total / orders.length : 0;
    res.json({
      ordersToday: orders.length,
      revenueToday: { amount: total.toFixed(2), currencyCode: "PKR" },
      averageOrderValue: { amount: aov.toFixed(2), currencyCode: "PKR" },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { financial_status, fulfillment_status } = req.body;
    
    const updates = [];
    const params = [];
    
    if (financial_status) {
      updates.push(`financial_status = $${params.length + 1}`);
      params.push(financial_status);
    }
    
    if (fulfillment_status) {
      updates.push(`fulfillment_status = $${params.length + 1}`);
      params.push(fulfillment_status);
    }
    
    if (updates.length === 0) return res.status(400).json({ error: "No status provided" });
    
    updates.push("updated_at = NOW()");
    params.push(id);
    
    await execute(`UPDATE orders SET ${updates.join(", ")} WHERE id = $${params.length}`, params);
    
    const updatedOrder = (await queryAll("SELECT * FROM orders WHERE id = ?", [id]))[0];
    
    if (fulfillment_status === "fulfilled" || fulfillment_status === "SHIPPED") {
      await sendShippingConfirmationEmail(updatedOrder);
    }
    
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { 
      customerName = "", 
      customerEmail = "", 
      customerPhone = "", 
      address = "", 
      city = "", 
      postalCode = "", 
      country = "Pakistan",
      items = [] 
    } = req.body;
    if (!items.length) return res.status(400).json({ error: "Order must have at least one item" });

    const customerEmailClean = await sanitizeCustomerEmail(customerEmail, queryOne);

    const id = uuid();
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    await execute("INSERT INTO orders (id, customer_name, customer_email, customer_phone, address, city, postal_code, country, total, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, customerName, customerEmailClean, customerPhone, address, city, postalCode, country, subtotal, subtotal]);

    for (const item of items) {
      await execute("INSERT INTO order_items (id, order_id, variant_id, product_title, variant_title, price, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [uuid(), id, item.variantId, item.productTitle, item.variantTitle || "", item.price, item.quantity, item.imageUrl || ""]);
    }

    const order = (await queryAll("SELECT * FROM orders WHERE id = ?", [id]))[0];
    const orderItems = await queryAll("SELECT * FROM order_items WHERE order_id = ?", [id]);
    
    // Send background tasks
    sendOrderConfirmationEmail(order, orderItems);
    sendAdminPushNotification(order);
    createUserOrderNotification(order, orderItems);

    res.status(201).json({ ...order, items: orderItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
