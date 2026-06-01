import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { queryAll, execute, queryOne } from "@/lib/db";
import nodemailer from "nodemailer";
import { isAdminAuthenticated } from "@/lib/admin-api-auth";
import { signOrderReceiptToken } from "@/lib/order-receipt";
import { listRecentOrders } from "@/lib/orders-server";
import {
  DEFAULT_ADMIN_ORDER_EMAIL,
  buildOrderEmailContext,
  renderAdminOrderEmail,
  renderCustomerOrderEmail,
} from "@/lib/order-emails";

function createSmtpTransport() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = port === 465;

  return nodemailer.createTransport({
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
}

const DEFAULT_STORE_NAME = "SSHUB";

function isPlaceholderOrSampleEmail(email: string): boolean {
  const e = email.trim().toLowerCase();
  if (!e.includes("@")) return true;
  const domain = e.split("@")[1] || "";
  if (domain === "example.com" || domain.endsWith(".example.com")) return true;
  return false;
}

/** Real buyer inbox only — never the shop/settings placeholder (e.g. store@example.com). */
async function sanitizeCustomerEmail(raw: unknown): Promise<string> {
  const s = String(raw ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return "";
  if (isPlaceholderOrSampleEmail(s)) return "";

  const row = await queryOne("SELECT value FROM settings WHERE key = 'store_email'");
  const shop = String(row?.value ?? "").trim().toLowerCase();
  if (shop && s === shop) return "";

  return s;
}

async function resolveAdminRecipients(): Promise<string> {
  const envList = (process.env.ADMIN_ORDER_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .filter((e) => !isPlaceholderOrSampleEmail(e));

  const adminEmailRows = await queryOne("SELECT value FROM settings WHERE key = 'store_email'");
  const dbEmail = adminEmailRows?.value
    ? String(adminEmailRows.value).trim().toLowerCase()
    : "";

  const set = new Set<string>([DEFAULT_ADMIN_ORDER_EMAIL.toLowerCase(), ...envList]);
  if (dbEmail && !isPlaceholderOrSampleEmail(dbEmail)) {
    set.add(dbEmail);
  }
  return Array.from(set).join(", ");
}

async function sendOrderEmails(order: Record<string, unknown>, items: Record<string, unknown>[]) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("Email skipped: SMTP_USER / SMTP_PASS missing.");
      return;
    }

    const ctx = buildOrderEmailContext(
      order as Parameters<typeof buildOrderEmailContext>[0],
      items as Parameters<typeof buildOrderEmailContext>[1],
      { storeName: process.env.STORE_DISPLAY_NAME || DEFAULT_STORE_NAME },
    );

    const transporter = createSmtpTransport();
    const fromDisplay = process.env.STORE_DISPLAY_NAME || DEFAULT_STORE_NAME;
    const buyerEmail = await sanitizeCustomerEmail(order.customer_email);

    if (buyerEmail) {
      await transporter.sendMail({
        from: `"${fromDisplay}" <${process.env.SMTP_USER}>`,
        to: buyerEmail,
        subject: `${ctx.storeName} — Order placed · #${ctx.shortId}`,
        html: renderCustomerOrderEmail(ctx),
      });
    } else {
      console.warn(
        "Order confirmation email skipped: no valid customer email (phone-only checkout or placeholder).",
      );
    }

    const adminRecipients = await resolveAdminRecipients();
    await transporter.sendMail({
      from: `"${fromDisplay} · Orders" <${process.env.SMTP_USER}>`,
      to: adminRecipients,
      replyTo: buyerEmail || undefined,
      subject: `[${ctx.storeName}] New order #${ctx.shortId} · Rs. ${ctx.total.toLocaleString("en-PK")}`,
      html: renderAdminOrderEmail(ctx),
    });
  } catch (err) {
    console.error("Email Error:", err);
  }
}

export async function GET(req: Request) {
  try {
    const admin = await isAdminAuthenticated();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10);
    const result = await listRecentOrders(Number.isFinite(limit) ? limit : 50);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to list orders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerEmail: customerEmailRaw,
      customerPhone,
      address,
      city,
      postalCode,
      country = "Pakistan",
      items = [],
    } = body;
    if (!items.length) return NextResponse.json({ error: "Empty order" }, { status: 400 });

    const customerEmail = await sanitizeCustomerEmail(customerEmailRaw);

    const id = uuid();
    const subtotal = items.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0);

    await execute(
      "INSERT INTO orders (id, customer_name, customer_email, customer_phone, address, city, postal_code, country, total, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, customerName, customerEmail, customerPhone, address, city, postalCode, country, subtotal, subtotal],
    );

    for (const item of items) {
      await execute(
        "INSERT INTO order_items (id, order_id, variant_id, product_title, variant_title, price, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          uuid(),
          id,
          item.variantId,
          item.productTitle,
          item.variantTitle || "",
          item.price,
          item.quantity,
          item.imageUrl || "",
        ],
      );
    }

    const order = await queryOne("SELECT * FROM orders WHERE id = ?", [id]);
    const orderItems = await queryAll("SELECT * FROM order_items WHERE order_id = ?", [id]);

    sendOrderEmails(order, orderItems).catch((error) => {
      console.error("Order email dispatch failed:", error);
    });

    const receiptToken = await signOrderReceiptToken(id);
    return NextResponse.json({ ...order, items: orderItems, receiptToken }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Order failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
