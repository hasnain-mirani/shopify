import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { queryAll, execute, queryOne } from '@/lib/db';
import nodemailer from 'nodemailer';

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
    // Helpful for some SMTP providers when DNS/reverse lookup is strict.
    tls: { servername: host },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });
}

const DEFAULT_STORE_NAME = "SSHUB";
const DEFAULT_ADMIN_EMAIL = "hasnainmirani1122@gmail.com";

function escapeHtml(s: string | null | undefined): string {
  if (s == null || s === "") return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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
  const adminEmailRows = await queryOne("SELECT value FROM settings WHERE key = 'store_email'");
  const envList = (process.env.ADMIN_ORDER_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .filter((e) => !isPlaceholderOrSampleEmail(e));
  const dbEmail = adminEmailRows?.value
    ? String(adminEmailRows.value).trim().toLowerCase()
    : "";
  const set = new Set<string>([DEFAULT_ADMIN_EMAIL.toLowerCase(), ...envList]);
  if (dbEmail && !isPlaceholderOrSampleEmail(dbEmail)) {
    set.add(dbEmail);
  }
  return Array.from(set).join(", ");
}

async function sendOrderEmails(order: any, items: any) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("Email skipped: SMTP_USER / SMTP_PASS missing.");
      return;
    }

    const transporter = createSmtpTransport();
    const storeName = escapeHtml(process.env.STORE_DISPLAY_NAME || DEFAULT_STORE_NAME);
    const shortId = String(order.id || "").split("-")[0]?.toUpperCase() || "ORDER";
    const subtotalNum = Number(order.subtotal ?? order.total ?? 0);
    const totalNum = Number(order.total ?? subtotalNum);

    const rowsHtml = items
      .map((i: any) => {
        const qty = Number(i.quantity ?? 0);
        const unit = Number(i.price ?? 0);
        const line = qty * unit;
        const variant =
          i.variant_title && String(i.variant_title).trim() && i.variant_title !== "Default Title"
            ? `<div style="font-size:12px;color:#64748b;margin-top:4px;">${escapeHtml(i.variant_title)}</div>`
            : "";
        return `
      <tr>
        <td style="padding:14px 12px;border-bottom:1px solid #e2e8f0;vertical-align:top;">
          <div style="font-weight:600;color:#0f172a;">${escapeHtml(i.product_title)}</div>
          ${variant}
        </td>
        <td style="padding:14px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:#475569;font-size:14px;">${qty}</td>
        <td style="padding:14px 12px;border-bottom:1px solid #e2e8f0;text-align:right;color:#475569;font-size:14px;">PKR ${unit.toFixed(0)}</td>
        <td style="padding:14px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#0f172a;">PKR ${line.toFixed(0)}</td>
      </tr>`;
      })
      .join("");

    const shipBlock = `
      <p style="margin:0 0 6px 0;"><strong>Name</strong><br>${escapeHtml(order.customer_name)}</p>
      <p style="margin:0 0 6px 0;"><strong>Phone</strong><br>${escapeHtml(order.customer_phone) || "—"}</p>
      <p style="margin:0 0 6px 0;"><strong>Address</strong><br>${escapeHtml([order.address, order.city, order.postal_code, order.country].filter(Boolean).join(", "))}</p>`;

    const customerHtml = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
        <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#f59e0b 140%);padding:28px 32px;color:#fff;">
          <div style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;opacity:0.85;margin-bottom:8px;">${storeName}</div>
          <h1 style="margin:0;font-size:24px;font-weight:700;">Thanks for your order</h1>
          <p style="margin:12px 0 0;font-size:14px;opacity:0.9;">We'll email you updates as your parcel moves. Here's your confirmation.</p>
        </td></tr>
        <tr><td style="padding:24px 32px 8px;">
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="vertical-align:top;">
                <p style="margin:0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Order reference</p>
                <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#0f172a;">#${shortId}</p>
              </td>
              <td style="vertical-align:top;text-align:right;">
                <p style="margin:0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Payment</p>
                <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#0f172a;">Cash on Delivery</p>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:8px 32px;">
          <table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
            <thead>
              <tr style="background:#f8fafc;">
                <th align="left" style="padding:12px;font-size:11px;color:#64748b;text-transform:uppercase;">Item</th>
                <th align="center" style="padding:12px;font-size:11px;color:#64748b;text-transform:uppercase;">Qty</th>
                <th align="right" style="padding:12px;font-size:11px;color:#64748b;text-transform:uppercase;">Price</th>
                <th align="right" style="padding:12px;font-size:11px;color:#64748b;text-transform:uppercase;">Line</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </td></tr>
        <tr><td style="padding:16px 32px 24px;">
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr><td style="padding:6px 0;font-size:14px;color:#64748b;">Subtotal</td>
                <td align="right" style="padding:6px 0;font-size:14px;color:#0f172a;">PKR ${subtotalNum.toFixed(0)}</td></tr>
            <tr><td style="padding:6px 0;font-size:14px;color:#64748b;">Shipping</td>
                <td align="right" style="padding:6px 0;font-size:14px;color:#059669;font-weight:600;">FREE</td></tr>
            <tr><td colspan="2" style="border-top:1px solid #e2e8f0;padding-top:14px;"></td></tr>
            <tr><td style="padding:6px 0;font-size:16px;font-weight:700;color:#0f172a;">Total due (COD)</td>
                <td align="right" style="padding:6px 0;font-size:20px;font-weight:800;color:#0f172a;">PKR ${totalNum.toFixed(0)}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px 24px;">
          <div style="background:#f8fafc;border-radius:12px;padding:20px;border:1px solid #e2e8f0;">
            <p style="margin:0 0 12px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Delivery details</p>
            ${shipBlock}
          </div>
        </td></tr>
        <tr><td style="padding:24px 32px;background:#0f172a;color:#94a3b8;font-size:12px;line-height:1.6;text-align:center;">
          Questions? Reply to this email — we're happy to help.<br/>
          <span style="color:#fbbf24;font-weight:600;">${storeName}</span> · Trusted delivery across Pakistan
        </td></tr>
      </table>
      <p style="max-width:600px;margin:16px auto 0;font-size:11px;color:#94a3b8;text-align:center;">You received this because you placed an order at ${storeName}.</p>
    </td></tr></table>
</body></html>`;

    const adminHtml = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;background:#eef2ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(30,41,59,0.12);border:1px solid #cbd5e1;">
    <tr><td style="background:#4338ca;color:#fff;padding:20px 24px;">
      <div style="font-size:11px;opacity:0.9;text-transform:uppercase;letter-spacing:0.1em;">${storeName} · Admin alert</div>
      <h1 style="margin:8px 0 0;font-size:22px;">New order placed</h1>
      <p style="margin:8px 0 0;font-size:14px;opacity:0.95;">Order <strong>#${shortId}</strong> · PKR <strong>${totalNum.toFixed(0)}</strong></p>
    </td></tr>
    <tr><td style="padding:24px;">
      <h2 style="margin:0 0 12px;font-size:14px;color:#64748b;text-transform:uppercase;">Customer</h2>
      <table width="100%" style="font-size:14px;color:#0f172a;line-height:1.7;">
        <tr><td style="color:#64748b;width:120px;">Name</td><td>${escapeHtml(order.customer_name)}</td></tr>
        <tr><td style="color:#64748b;">Email</td><td>${escapeHtml(order.customer_email) || "—"}</td></tr>
        <tr><td style="color:#64748b;">Phone</td><td>${escapeHtml(order.customer_phone) || "—"}</td></tr>
      </table>
      <h2 style="margin:20px 0 12px;font-size:14px;color:#64748b;text-transform:uppercase;">Shipping</h2>
      <p style="margin:0;font-size:14px;color:#0f172a;line-height:1.7;">${escapeHtml([order.address, order.city, order.postal_code, order.country].filter(Boolean).join(", "))}</p>
      <h2 style="margin:20px 0 12px;font-size:14px;color:#64748b;text-transform:uppercase;">Items</h2>
      <table width="100%" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;font-size:13px;">
        <thead><tr style="background:#f1f5f9;"><th align="left" style="padding:10px;">Product</th><th align="center" style="padding:10px;">Qty</th><th align="right" style="padding:10px;">Line</th></tr></thead>
        <tbody>${items
          .map((i: any) => {
            const qty = Number(i.quantity ?? 0);
            const line = qty * Number(i.price ?? 0);
            return `<tr><td style="padding:10px;border-top:1px solid #e2e8f0;">${escapeHtml(i.product_title)}</td><td align="center" style="padding:10px;border-top:1px solid #e2e8f0;">${qty}</td><td align="right" style="padding:10px;border-top:1px solid #e2e8f0;">PKR ${line.toFixed(0)}</td></tr>`;
          })
          .join("")}</tbody>
      </table>
      <p style="margin:20px 0 0;font-size:16px;font-weight:700;">Total: PKR ${totalNum.toFixed(0)} · COD</p>
      <p style="margin:12px 0 0;font-size:12px;color:#64748b;">Full order ID: ${escapeHtml(order.id)}</p>
    </td></tr>
  </table>
</body></html>`;

    const adminRecipients = await resolveAdminRecipients();
    const fromDisplay = process.env.STORE_DISPLAY_NAME || DEFAULT_STORE_NAME;
    const buyerEmail = await sanitizeCustomerEmail(order.customer_email);

    if (buyerEmail) {
      await transporter.sendMail({
        from: `"${fromDisplay}" <${process.env.SMTP_USER}>`,
        to: buyerEmail,
        subject: `${fromDisplay} — Order confirmed · #${shortId}`,
        html: customerHtml,
      });
    } else {
      console.warn(
        "Order confirmation email skipped: no valid customer email (phone-only checkout or shop/placeholder address).",
      );
    }

    await transporter.sendMail({
      from: `"${fromDisplay} · Orders" <${process.env.SMTP_USER}>`,
      to: adminRecipients,
      replyTo: buyerEmail || undefined,
      subject: `[${DEFAULT_STORE_NAME}] New order #${shortId} · PKR ${totalNum.toFixed(0)}`,
      html: adminHtml,
    });
  } catch (err) {
    console.error("Email Error:", err);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const orders = await queryAll("SELECT * FROM orders ORDER BY created_at DESC LIMIT ?", [limit]);
    const result = await Promise.all(orders.map(async (o: any) => {
      const items = await queryAll("SELECT * FROM order_items WHERE order_id = ?", [o.id]);
      return { ...o, items };
    }));
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, customerEmail: customerEmailRaw, customerPhone, address, city, postalCode, country = "Pakistan", items = [] } = body;
    if (!items.length) return NextResponse.json({ error: "Empty order" }, { status: 400 });

    const customerEmail = await sanitizeCustomerEmail(customerEmailRaw);

    const id = uuid();
    const subtotal = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);

    await execute("INSERT INTO orders (id, customer_name, customer_email, customer_phone, address, city, postal_code, country, total, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, customerName, customerEmail, customerPhone, address, city, postalCode, country, subtotal, subtotal]);

    for (const item of items) {
      await execute("INSERT INTO order_items (id, order_id, variant_id, product_title, variant_title, price, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [uuid(), id, item.variantId, item.productTitle, item.variantTitle || "", item.price, item.quantity, item.imageUrl || ""]);
    }

    const order = await queryOne("SELECT * FROM orders WHERE id = ?", [id]);
    const orderItems = await queryAll("SELECT * FROM order_items WHERE order_id = ?", [id]);
    
    // Fire and forget email dispatch so checkout stays fast.
    sendOrderEmails(order, orderItems).catch((error) => {
      console.error("Order email dispatch failed:", error);
    });

    return NextResponse.json({ ...order, items: orderItems }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
