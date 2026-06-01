/** Keep in sync with src/lib/order-emails.ts */
const DEFAULT_ADMIN_ORDER_EMAIL = "sardarahmadofficial139@gmail.com";

const BRAND = "#f85606";

function escapeHtml(s) {
  if (s == null || s === "") return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildOrderEmailContext(order, items, options = {}) {
  const subtotal = Number(order.subtotal ?? order.total ?? 0);
  const total = Number(order.total ?? subtotal);
  const shortId = String(order.id || "").split("-")[0]?.toUpperCase() || "ORDER";
  const placedAt = order.created_at
    ? new Date(order.created_at).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })
    : new Date().toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" });

  return {
    storeName: options.storeName || process.env.STORE_DISPLAY_NAME || "SSHUB",
    siteUrl: (options.siteUrl || process.env.FRONTEND_URL || "https://www.sshub.store").replace(/\/$/, ""),
    shortId,
    order,
    items,
    subtotal,
    total,
    placedAt,
  };
}

function itemRowsHtml(ctx, showImage) {
  return ctx.items
    .map((i) => {
      const qty = Number(i.quantity ?? 0);
      const unit = Number(i.price ?? 0);
      const line = qty * unit;
      const variant =
        i.variant_title && String(i.variant_title).trim() && i.variant_title !== "Default Title"
          ? `<div style="font-size:12px;color:#757575;margin-top:2px;">${escapeHtml(i.variant_title)}</div>`
          : "";
      const img =
        showImage && i.image_url
          ? `<td style="width:72px;padding:12px 0;vertical-align:top;"><img src="${escapeHtml(i.image_url)}" alt="" width="64" height="64" style="border-radius:8px;object-fit:cover;border:1px solid #eee;"/></td>`
          : "";
      return `<tr>${img}<td style="padding:12px 8px;vertical-align:top;border-bottom:1px solid #f0f0f0;"><div style="font-size:14px;font-weight:600;color:#212121;">${escapeHtml(i.product_title)}</div>${variant}</td><td style="padding:12px 8px;text-align:center;border-bottom:1px solid #f0f0f0;">×${qty}</td><td style="padding:12px 8px;text-align:right;font-weight:700;border-bottom:1px solid #f0f0f0;">Rs. ${line.toLocaleString("en-PK")}</td></tr>`;
    })
    .join("");
}

function emailShell(body, preheader) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:Segoe UI,Roboto,Arial,sans-serif;"><span style="display:none;">${escapeHtml(preheader)}</span><table width="100%" style="background:#f5f5f5;padding:24px 12px;"><tr><td align="center">${body}</td></tr></table></body></html>`;
}

function renderCustomerOrderEmail(ctx) {
  const shipLines = [
    escapeHtml(ctx.order.customer_name),
    escapeHtml(ctx.order.customer_phone) || null,
    escapeHtml([ctx.order.address, ctx.order.city, ctx.order.postal_code, ctx.order.country].filter(Boolean).join(", ")),
  ]
    .filter(Boolean)
    .join("<br/>");

  const body = `
<table width="100%" style="max-width:600px;background:#fff;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:${BRAND};padding:20px 24px;color:#fff;">
  <div style="font-size:22px;font-weight:800;">${escapeHtml(ctx.storeName)}</div>
  <div style="font-size:13px;opacity:0.9;margin-top:4px;">Order confirmation · #${ctx.shortId}</div>
</td></tr>
<tr><td style="padding:24px;">
  <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#212121;">Hi ${escapeHtml(ctx.order.customer_name) || "there"},</p>
  <p style="margin:0 0 20px;font-size:14px;color:#616161;line-height:1.6;">Thank you for your order. We're preparing your items and will update you when they're on the way.</p>
  <div style="background:#fff8f3;border:1px solid #ffe0cc;border-radius:8px;padding:14px 16px;margin-bottom:20px;">
    <div style="font-size:13px;color:#616161;">Placed: <strong style="color:#212121;">${escapeHtml(ctx.placedAt)}</strong></div>
    <div style="font-size:13px;color:#616161;margin-top:8px;">Payment: <strong style="color:${BRAND};">Cash on Delivery</strong></div>
  </div>
  <table width="100%">${itemRowsHtml(ctx, true)}</table>
  <table width="100%" style="margin-top:16px;border-top:2px solid #f5f5f5;padding-top:16px;">
    <tr><td style="color:#757575;">Subtotal</td><td align="right">Rs. ${ctx.subtotal.toLocaleString("en-PK")}</td></tr>
    <tr><td style="color:#757575;">Delivery</td><td align="right" style="color:#2e7d32;font-weight:600;">FREE</td></tr>
    <tr><td style="font-size:16px;font-weight:700;padding-top:12px;">Total (COD)</td><td align="right" style="font-size:20px;font-weight:800;color:${BRAND};padding-top:12px;">Rs. ${ctx.total.toLocaleString("en-PK")}</td></tr>
  </table>
  <div style="margin-top:24px;background:#fafafa;border-radius:8px;padding:16px;border:1px solid #eee;">
    <div style="font-size:12px;font-weight:700;color:#9e9e9e;text-transform:uppercase;margin-bottom:8px;">Delivery address</div>
    <div style="font-size:14px;color:#424242;line-height:1.7;">${shipLines}</div>
  </div>
</td></tr>
<tr><td style="background:#212121;padding:16px;text-align:center;font-size:12px;color:#9e9e9e;">© ${escapeHtml(ctx.storeName)}</td></tr>
</table>`;
  return emailShell(body, `Order #${ctx.shortId} confirmed`);
}

function renderAdminOrderEmail(ctx) {
  const adminLink = `${ctx.siteUrl}/admin/orders`;
  const body = `
<table width="100%" style="max-width:640px;background:#fff;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.1);">
<tr><td style="background:linear-gradient(135deg,#1a1a2e,${BRAND});padding:24px;color:#fff;">
  <div style="font-size:11px;opacity:0.8;text-transform:uppercase;">New order</div>
  <h1 style="margin:12px 0 0;font-size:24px;">Order #${ctx.shortId}</h1>
  <p style="margin:8px 0 0;">Rs. ${ctx.total.toLocaleString("en-PK")} · COD</p>
</td></tr>
<tr><td style="padding:24px;">
  <table width="100%" style="font-size:14px;line-height:1.8;margin-bottom:16px;">
    <tr><td style="color:#757575;width:100px;">Name</td><td><strong>${escapeHtml(ctx.order.customer_name)}</strong></td></tr>
    <tr><td style="color:#757575;">Phone</td><td>${escapeHtml(ctx.order.customer_phone) || "—"}</td></tr>
    <tr><td style="color:#757575;">Email</td><td>${escapeHtml(ctx.order.customer_email) || "—"}</td></tr>
    <tr><td style="color:#757575;">Address</td><td>${escapeHtml([ctx.order.address, ctx.order.city, ctx.order.postal_code, ctx.order.country].filter(Boolean).join(", "))}</td></tr>
  </table>
  <table width="100%">${itemRowsHtml(ctx, true)}</table>
  <p style="font-size:20px;font-weight:800;color:${BRAND};margin:16px 0 0;">Total: Rs. ${ctx.total.toLocaleString("en-PK")}</p>
  <p style="font-size:12px;color:#9e9e9e;">ID: ${escapeHtml(ctx.order.id)}</p>
  <p style="margin-top:20px;"><a href="${escapeHtml(adminLink)}" style="background:${BRAND};color:#fff;padding:12px 24px;text-decoration:none;font-weight:700;border-radius:6px;display:inline-block;">Open in admin</a></p>
</td></tr>
</table>`;
  return emailShell(body, `New order #${ctx.shortId}`);
}

module.exports = {
  DEFAULT_ADMIN_ORDER_EMAIL,
  escapeHtml,
  buildOrderEmailContext,
  renderCustomerOrderEmail,
  renderAdminOrderEmail,
};
