/** Primary inbox for new-order admin alerts */
export const DEFAULT_ADMIN_ORDER_EMAIL = "sardarahmadofficial139@gmail.com";

export type OrderEmailItem = {
  product_title: string;
  variant_title?: string | null;
  price: number | string;
  quantity: number | string;
  image_url?: string | null;
};

export type OrderEmailOrder = {
  id: string;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  subtotal?: number | string | null;
  total?: number | string | null;
  created_at?: string | null;
};

export type OrderEmailContext = {
  storeName: string;
  siteUrl: string;
  shortId: string;
  order: OrderEmailOrder;
  items: OrderEmailItem[];
  subtotal: number;
  total: number;
  placedAt: string;
};

export function escapeHtml(s: string | null | undefined): string {
  if (s == null || s === "") return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildOrderEmailContext(
  order: OrderEmailOrder,
  items: OrderEmailItem[],
  options?: { storeName?: string; siteUrl?: string },
): OrderEmailContext {
  const subtotal = Number(order.subtotal ?? order.total ?? 0);
  const total = Number(order.total ?? subtotal);
  const shortId = String(order.id || "").split("-")[0]?.toUpperCase() || "ORDER";
  const placedAt = order.created_at
    ? new Date(order.created_at).toLocaleString("en-PK", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" });

  return {
    storeName: options?.storeName || process.env.STORE_DISPLAY_NAME || "SSHUB",
    siteUrl: (options?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://www.sshub.store").replace(
      /\/$/,
      "",
    ),
    shortId,
    order,
    items,
    subtotal,
    total,
    placedAt,
  };
}

const BRAND = "#f85606";

function itemRowsHtml(ctx: OrderEmailContext, opts?: { showImage?: boolean }): string {
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
        opts?.showImage && i.image_url
          ? `<td style="width:72px;padding:12px 0 12px 0;vertical-align:top;">
          <img src="${escapeHtml(i.image_url)}" alt="" width="64" height="64" style="display:block;border-radius:8px;object-fit:cover;border:1px solid #eee;background:#fafafa;" />
        </td>`
          : "";
      return `
      <tr>
        ${img}
        <td style="padding:12px 8px;vertical-align:top;border-bottom:1px solid #f0f0f0;">
          <div style="font-size:14px;font-weight:600;color:#212121;line-height:1.35;">${escapeHtml(i.product_title)}</div>
          ${variant}
        </td>
        <td style="padding:12px 8px;text-align:center;vertical-align:top;border-bottom:1px solid #f0f0f0;font-size:14px;color:#424242;">×${qty}</td>
        <td style="padding:12px 8px;text-align:right;vertical-align:top;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:700;color:#212121;white-space:nowrap;">Rs. ${line.toLocaleString("en-PK")}</td>
      </tr>`;
    })
    .join("");
}

function timelineHtml(activeStep: number): string {
  const steps = ["Order placed", "Processing", "Shipped", "Delivered"];
  const cells = steps
    .map((label, i) => {
      const active = i <= activeStep;
      const dot = active ? BRAND : "#e0e0e0";
      const text = active ? "#212121" : "#9e9e9e";
      return `
      <td align="center" style="width:25%;padding:0 4px;">
        <div style="width:10px;height:10px;border-radius:50%;background:${dot};margin:0 auto 8px;"></div>
        <div style="font-size:11px;color:${text};font-weight:${active ? "600" : "400"};">${label}</div>
      </td>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;"><tr>${cells}</tr></table>`;
}

function emailShell(body: string, preheader: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Order</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<span style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f5;padding:24px 12px;">
<tr><td align="center">${body}</td></tr>
</table>
</body></html>`;
}

/** Buyer confirmation — Daraz-style layout */
export function renderCustomerOrderEmail(ctx: OrderEmailContext): string {
  const shipLines = [
    escapeHtml(ctx.order.customer_name),
    escapeHtml(ctx.order.customer_phone) || null,
    escapeHtml([ctx.order.address, ctx.order.city, ctx.order.postal_code, ctx.order.country].filter(Boolean).join(", ")),
  ]
    .filter(Boolean)
    .join("<br/>");

  const body = `
<table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
  <tr><td style="background:${BRAND};padding:20px 24px;">
    <table width="100%"><tr>
      <td><div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.02em;">${escapeHtml(ctx.storeName)}</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.9);margin-top:4px;">Order confirmation</div></td>
      <td align="right" style="vertical-align:top;">
        <div style="background:rgba(0,0,0,0.15);border-radius:6px;padding:8px 12px;display:inline-block;">
          <div style="font-size:10px;color:rgba(255,255,255,0.85);text-transform:uppercase;letter-spacing:0.08em;">Order ID</div>
          <div style="font-size:16px;font-weight:700;color:#fff;">#${ctx.shortId}</div>
        </div>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:24px;">
    <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#212121;">Hi ${escapeHtml(ctx.order.customer_name) || "there"},</p>
    <p style="margin:0 0 20px;font-size:14px;color:#616161;line-height:1.6;">Thank you for shopping with us. Your order has been received and is being prepared. You'll get updates as it moves forward.</p>
    ${timelineHtml(0)}
    <div style="background:#fff8f3;border:1px solid #ffe0cc;border-radius:8px;padding:14px 16px;margin-bottom:20px;">
      <table width="100%"><tr>
        <td style="font-size:13px;color:#616161;">Placed on</td>
        <td align="right" style="font-size:13px;font-weight:600;color:#212121;">${escapeHtml(ctx.placedAt)}</td>
      </tr><tr>
        <td style="font-size:13px;color:#616161;padding-top:8px;">Payment</td>
        <td align="right" style="font-size:13px;font-weight:600;color:${BRAND};padding-top:8px;">Cash on Delivery</td>
      </tr></table>
    </div>
    <div style="font-size:12px;font-weight:700;color:#9e9e9e;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">Your items</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${itemRowsHtml(ctx, { showImage: true })}</table>
    <table width="100%" style="margin-top:16px;border-top:2px solid #f5f5f5;padding-top:16px;">
      <tr><td style="font-size:14px;color:#757575;padding:4px 0;">Subtotal</td><td align="right" style="font-size:14px;color:#212121;padding:4px 0;">Rs. ${ctx.subtotal.toLocaleString("en-PK")}</td></tr>
      <tr><td style="font-size:14px;color:#757575;padding:4px 0;">Delivery</td><td align="right" style="font-size:14px;color:#2e7d32;font-weight:600;padding:4px 0;">FREE</td></tr>
      <tr><td style="font-size:16px;font-weight:700;color:#212121;padding:12px 0 0;">Total (pay on delivery)</td>
          <td align="right" style="font-size:20px;font-weight:800;color:${BRAND};padding:12px 0 0;">Rs. ${ctx.total.toLocaleString("en-PK")}</td></tr>
    </table>
    <div style="margin-top:24px;background:#fafafa;border-radius:8px;padding:16px;border:1px solid #eeeeee;">
      <div style="font-size:12px;font-weight:700;color:#9e9e9e;text-transform:uppercase;margin-bottom:10px;">Delivery address</div>
      <div style="font-size:14px;color:#424242;line-height:1.7;">${shipLines}</div>
    </div>
    <p style="margin:24px 0 0;font-size:13px;color:#9e9e9e;line-height:1.6;text-align:center;">Questions about your order? Reply to this email — we're here to help.</p>
  </td></tr>
  <tr><td style="background:#212121;padding:16px 24px;text-align:center;">
    <div style="font-size:12px;color:#9e9e9e;">© ${escapeHtml(ctx.storeName)} · Fast delivery across Pakistan</div>
    <div style="font-size:11px;color:#757575;margin-top:6px;"><a href="${escapeHtml(ctx.siteUrl)}" style="color:#ffb74d;text-decoration:none;">${escapeHtml(ctx.siteUrl.replace(/^https?:\/\//, ""))}</a></div>
  </td></tr>
</table>`;

  return emailShell(body, `Order #${ctx.shortId} confirmed — Rs. ${ctx.total.toLocaleString("en-PK")} COD`);
}

/** Admin new-order alert */
export function renderAdminOrderEmail(ctx: OrderEmailContext): string {
  const adminLink = `${ctx.siteUrl}/admin/orders`;

  const body = `
<table role="presentation" width="100%" style="max-width:640px;background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.1);">
  <tr><td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,${BRAND} 160%);padding:24px;">
    <div style="font-size:11px;color:rgba(255,255,255,0.75);text-transform:uppercase;letter-spacing:0.12em;">New order · Admin</div>
    <h1 style="margin:12px 0 0;font-size:26px;font-weight:800;color:#fff;">You have a new order</h1>
    <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">#${ctx.shortId} · <strong>Rs. ${ctx.total.toLocaleString("en-PK")}</strong> · Cash on Delivery</p>
  </td></tr>
  <tr><td style="padding:24px;">
    <table width="100%" style="margin-bottom:20px;"><tr>
      <td style="background:#fff3e0;border-radius:8px;padding:14px 16px;border-left:4px solid ${BRAND};">
        <div style="font-size:11px;color:#e65100;font-weight:700;text-transform:uppercase;">Action required</div>
        <div style="font-size:14px;color:#424242;margin-top:4px;">Pack and confirm this order in your admin panel.</div>
      </td>
    </tr></table>
    <div style="font-size:12px;font-weight:700;color:#9e9e9e;text-transform:uppercase;margin-bottom:12px;">Customer details</div>
    <table width="100%" style="font-size:14px;line-height:1.8;margin-bottom:20px;">
      <tr><td style="color:#757575;width:110px;vertical-align:top;">Name</td><td style="color:#212121;font-weight:600;">${escapeHtml(ctx.order.customer_name)}</td></tr>
      <tr><td style="color:#757575;vertical-align:top;">Phone</td><td style="color:#212121;"><a href="tel:${escapeHtml(ctx.order.customer_phone)}" style="color:${BRAND};text-decoration:none;">${escapeHtml(ctx.order.customer_phone) || "—"}</a></td></tr>
      <tr><td style="color:#757575;vertical-align:top;">Email</td><td style="color:#212121;">${escapeHtml(ctx.order.customer_email) || "—"}</td></tr>
      <tr><td style="color:#757575;vertical-align:top;">Address</td><td style="color:#212121;">${escapeHtml([ctx.order.address, ctx.order.city, ctx.order.postal_code, ctx.order.country].filter(Boolean).join(", "))}</td></tr>
      <tr><td style="color:#757575;vertical-align:top;">Placed</td><td style="color:#212121;">${escapeHtml(ctx.placedAt)}</td></tr>
    </table>
    <div style="font-size:12px;font-weight:700;color:#9e9e9e;text-transform:uppercase;margin-bottom:10px;">Order items (${ctx.items.length})</div>
    <table role="presentation" width="100%" cellspacing="0">${itemRowsHtml(ctx, { showImage: true })}</table>
    <table width="100%" style="margin-top:16px;">
      <tr><td style="font-size:18px;font-weight:700;color:#212121;">Order total</td>
          <td align="right" style="font-size:22px;font-weight:800;color:${BRAND};">Rs. ${ctx.total.toLocaleString("en-PK")}</td></tr>
    </table>
    <p style="margin:8px 0 0;font-size:12px;color:#9e9e9e;">Full order ID: ${escapeHtml(ctx.order.id)}</p>
    <table role="presentation" style="margin:24px auto 0;"><tr><td style="border-radius:6px;background:${BRAND};">
      <a href="${escapeHtml(adminLink)}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Open in admin</a>
    </td></tr></table>
  </td></tr>
</table>`;

  return emailShell(body, `New order #${ctx.shortId} — Rs. ${ctx.total.toLocaleString("en-PK")}`);
}
