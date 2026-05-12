/**
 * AI-assisted product copy (Gemini + Google Search grounding) and optional
 * product image generation (Replicate).
 *
 * Env:
 *   GEMINI_API_KEY     — required for /identify-from-image
 *   GEMINI_MODEL       — optional, default gemini-2.5-flash (use a model that supports googleSearch)
 *   REPLICATE_API_TOKEN — optional, required for /generate-image
 */

const express = require("express");
const multer = require("multer");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
});

const IDENTIFY_PROMPT = `You are writing catalog copy for a Pakistani consumer-electronics store (same vibe as PriceOye.pk: clear, confident, benefit-led, PKR pricing, short sections).

Analyze the product photo and MUST use Google Search to identify the exact model, official specs, MRP/list vs street/online PKR prices in Pakistan (PriceOye, Daraz.pk, brand Pakistan pages, etc.), warranty notes if stated, and box contents.

Style rules (PriceOye-like):
- Title: Brand + model + key variant (storage/color) when known. Max 70 characters. Title Case, no SHOUTING.
- description (plain text, NOT HTML): Use this exact section order, each section title on its own line in ALL CAPS, blank line between sections:
  OVERVIEW
  (2–4 short sentences: who it is for + main hook.)

  KEY FEATURES
  • (one benefit per line, 5–10 bullets, start each line with "• ")

  SPECIFICATIONS
  (12–24 lines, "Label: value" pairs — display, chipset, RAM/storage, battery, cameras, OS, connectivity, dimensions, weight, colors, etc. Use metric where standard.)

  WHAT IS IN THE BOX
  • (items, one per line with "• ")

  WHY BUY FROM US
  (2–3 sentences: value, authenticity, delivery/warranty tone — only claims you can ground from search.)

- descriptionHtml: Retail-style HTML for the storefront. Use ONLY these tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <br>. Mirror the same sections as plain description. Use PKR amounts in <strong> where you quote prices in prose.
- specifications: Copy the SPECIFICATIONS block again as plain "Label: value" lines (one per line), suitable for a spec sheet field.
- vendor: brand name only.
- productType: ONE slug from this list only: mobiles, wireless-earbuds, smart-watches, power-banks, wall-chargers, bluetooth-speakers, tablets, laptops, trimmers-shavers, hair-dryers, hair-straighteners, home-appliances
- tags: array of 6–14 short search tags (lowercase, no #), brand, model, category, use-case.
- marketPrice: numeric string PKR only (digits and optional decimal, NO commas) = typical MRP / list / crossed price if found; else empty string.
- ourPrice: numeric string PKR only = typical current selling price in Pakistan you found; if only a range, pick a realistic mid or lower bound; NEVER empty if you can infer from search — otherwise best single number from image context.
- estimatedPrice: human string for staff, e.g. "PKR 184,999 (list) · from PKR 169,500 online" or "PKR 12,999 – 14,500".
- sku: manufacturer SKU / part code if found, else short code like BRAND-MODEL-COLOR.
- barcode: EAN/UPC if found in search, else empty string.
- weight: numeric string product weight only (no unit), else empty.
- weightUnit: one of kg, g, lb, oz (match how weight is reported).
- seoTitle: <=60 chars, compelling, include brand.
- seoDescription: 140–160 chars meta description, PKR hint OK.

Output ONLY valid JSON with keys exactly:
title, description, descriptionHtml, vendor, productType, tags, specifications, marketPrice, ourPrice, estimatedPrice, sku, barcode, weight, weightUnit, seoTitle, seoDescription
No markdown code fences, no commentary before or after the JSON.`;

function extractJsonObject(text) {
  const raw = String(text || "").trim();
  if (!raw) throw new Error("Empty model response");
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const inner = (fenced ? fenced[1] : raw).trim();
  const start = inner.indexOf("{");
  const end = inner.lastIndexOf("}");
  if (start === -1 || end < start) throw new Error("Model did not return JSON");
  return JSON.parse(inner.slice(start, end + 1));
}

function sanitizeRichHtml(html) {
  let s = String(html || "").trim();
  if (!s) return "";
  s = s.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "");
  s = s.replace(/<\s*style[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi, "");
  s = s.replace(/\s*on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  return s.slice(0, 120000);
}

function escapeHtmlText(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normNumPrice(v) {
  const s = String(v ?? "").replace(/,/g, "").trim();
  if (!s) return "";
  const m = s.match(/(\d+(?:\.\d+)?)/);
  if (!m) return "";
  const n = Number.parseFloat(m[1]);
  if (!Number.isFinite(n) || n < 0) return "";
  return String(n);
}

function firstPkrFromHumanLine(text) {
  const flat = String(text || "").replace(/,/g, " ");
  const m =
    flat.match(/(?:PKR|Rs\.?)\s*[:\-]?\s*(\d+(?:\.\d+)?)/i) ||
    flat.match(/\bPKR\s*(\d+(?:\.\d+)?)/i) ||
    flat.match(/\bfrom\s+(\d{3,}(?:\.\d+)?)\b/i);
  return m ? normNumPrice(m[1]) : "";
}

function joinTags(tags) {
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean).join(", ");
  if (tags != null && typeof tags === "object") return "";
  return String(tags || "").trim();
}

function normWeightDigits(v) {
  const s = String(v ?? "").trim();
  if (!s) return "";
  const m = s.match(/(\d+(?:\.\d+)?)/);
  return m ? m[1] : "";
}

/**
 * POST multipart/form-data field "image" — returns { title, description, estimatedPrice, sources? }
 * Uses Gemini Developer API with the Google Search tool (successor to legacy "googleSearchRetrieval").
 */
router.post("/identify-from-image", upload.single("image"), async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured on the server.",
      });
    }
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Missing image file (field name: image)." });
    }

    const mimeType = req.file.mimetype || "image/jpeg";
    if (!/^image\/(jpeg|jpg|png|webp|gif)$/i.test(mimeType)) {
      return res.status(400).json({ error: "Unsupported image type. Use JPEG, PNG, WebP, or GIF." });
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const base64 = req.file.buffer.toString("base64");

    const { GoogleGenAI } = require("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64,
          },
        },
        IDENTIFY_PROMPT,
      ],
      config: {
        temperature: 1,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    let parsed;
    try {
      parsed = extractJsonObject(text);
    } catch (parseErr) {
      console.error("[product-ai] JSON parse failed:", parseErr, "\nRaw:", text?.slice?.(0, 800));
      return res.status(502).json({
        error: "Model returned invalid JSON. Try again with a clearer product photo.",
        rawPreview: String(text || "").slice(0, 400),
      });
    }

    const title = typeof parsed.title === "string" ? parsed.title.trim().slice(0, 200) : "";
    const description = typeof parsed.description === "string" ? parsed.description.trim() : "";
    let descriptionHtml =
      typeof parsed.descriptionHtml === "string" ? sanitizeRichHtml(parsed.descriptionHtml) : "";
    if (!descriptionHtml && description) {
      descriptionHtml = `<p>${escapeHtmlText(description).replace(/\n/g, "<br/>")}</p>`;
    }

    const estimatedPriceRaw =
      typeof parsed.estimatedPrice === "string"
        ? parsed.estimatedPrice.trim()
        : parsed.estimatedPrice != null
          ? String(parsed.estimatedPrice).trim()
          : "";

    let ourPrice = normNumPrice(parsed.ourPrice);
    let marketPrice = normNumPrice(parsed.marketPrice);
    if (!ourPrice && estimatedPriceRaw) ourPrice = firstPkrFromHumanLine(estimatedPriceRaw);
    if (!ourPrice && estimatedPriceRaw) {
      const parts = estimatedPriceRaw.split(/[–—\-~]/);
      for (const p of parts) {
        const hit = firstPkrFromHumanLine(p);
        if (hit) {
          ourPrice = hit;
          break;
        }
      }
    }

    const vendor = typeof parsed.vendor === "string" ? parsed.vendor.trim().slice(0, 200) : "";
    const productType = typeof parsed.productType === "string" ? parsed.productType.trim().slice(0, 80) : "";
    const specifications =
      typeof parsed.specifications === "string" ? parsed.specifications.trim().slice(0, 20000) : "";
    const tags = joinTags(parsed.tags).slice(0, 2000);
    const sku = typeof parsed.sku === "string" ? parsed.sku.trim().slice(0, 120) : "";
    const barcode = typeof parsed.barcode === "string" ? parsed.barcode.trim().slice(0, 64) : "";
    const weight = normWeightDigits(parsed.weight).slice(0, 32);
    let weightUnit = String(parsed.weightUnit || "kg").toLowerCase();
    if (!["kg", "g", "lb", "oz"].includes(weightUnit)) weightUnit = "kg";

    let seoTitle = typeof parsed.seoTitle === "string" ? parsed.seoTitle.trim().slice(0, 200) : "";
    let seoDescription = typeof parsed.seoDescription === "string" ? parsed.seoDescription.trim().slice(0, 320) : "";
    if (!seoTitle && title) seoTitle = title.slice(0, 60);
    if (!seoDescription && description) {
      seoDescription = description.replace(/\s+/g, " ").trim().slice(0, 160);
    }

    const estimatedPrice = estimatedPriceRaw || (ourPrice ? `PKR ${ourPrice}` : "PKR —");

    if (!title || !description) {
      return res.status(502).json({ error: "Model response missing title or description." });
    }

    const meta = response.candidates?.[0]?.groundingMetadata;
    const sources =
      meta?.groundingChunks
        ?.map((c) => c?.web?.uri || c?.web?.title)
        .filter(Boolean)
        .slice(0, 8) || [];

    res.json({
      title: title.slice(0, 70),
      description,
      descriptionHtml,
      vendor,
      productType,
      tags,
      specifications,
      marketPrice,
      ourPrice,
      estimatedPrice,
      sku,
      barcode,
      weight,
      weightUnit,
      seoTitle,
      seoDescription,
      sources,
    });
  } catch (err) {
    console.error("[product-ai] identify-from-image:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Identify request failed.",
    });
  }
});

/**
 * POST JSON { productDescription: string } — returns { imageUrl } from Replicate.
 */
router.post("/generate-image", async (req, res) => {
  try {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
      return res.status(503).json({
        error: "REPLICATE_API_TOKEN is not configured on the server.",
      });
    }
    const productDescription = String(req.body?.productDescription || "").trim();
    if (!productDescription) {
      return res.status(400).json({ error: "productDescription is required." });
    }

    const Replicate = require("replicate");
    const replicate = new Replicate({ auth: token });

    const prompt = [
      "Professional studio-quality product photograph of:",
      productDescription,
      "Clean white seamless background, photorealistic, cinematic softbox lighting, 8k, sharp focus, macro detail, catalog style, no text overlay, no watermark.",
    ].join(" ");

    const output = await replicate.run("black-forest-labs/flux-schnell", {
      input: {
        prompt,
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "webp",
        output_quality: 90,
      },
    });

    let imageUrl = null;
    if (Array.isArray(output) && output[0]) imageUrl = output[0];
    else if (typeof output === "string") imageUrl = output;
    else if (output && typeof output.url === "function") imageUrl = output.url();
    else if (output && typeof output === "object" && output[0]) imageUrl = output[0];

    if (!imageUrl || typeof imageUrl !== "string") {
      console.error("[product-ai] unexpected Replicate output:", output);
      return res.status(502).json({ error: "Image generation returned no URL." });
    }

    res.json({ imageUrl });
  } catch (err) {
    console.error("[product-ai] generate-image:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Image generation failed.",
    });
  }
});

module.exports = router;
