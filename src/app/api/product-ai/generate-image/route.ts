import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN is not configured on the server. Add it to your Vercel environment variables." },
        { status: 503 },
      );
    }
    
    let productDescription = "";
    try {
      const body = await req.json();
      productDescription = String(body.productDescription || "").trim();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    if (!productDescription) {
      return NextResponse.json({ error: "productDescription is required." }, { status: 400 });
    }

    // Call replicate directly instead of using proxy
    const res = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Prefer": "wait" // Wait for prediction to complete instead of polling
      },
      body: JSON.stringify({
        input: {
          prompt: [
            "Professional studio-quality product photograph of:",
            productDescription,
            "Clean white seamless background, photorealistic, cinematic softbox lighting, 8k, sharp focus, macro detail, catalog style, no text overlay, no watermark.",
          ].join(" "),
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 90,
        }
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[product-ai/generate-image] Replicate API error:", res.status, errorText);
      return NextResponse.json({ error: `Image generation failed: ${res.statusText}` }, { status: 502 });
    }

    const data = await res.json();
    
    // For synchronous requests with Prefer: wait, the output is in data.output
    let imageUrl = null;
    if (Array.isArray(data.output) && data.output[0]) imageUrl = data.output[0];
    else if (typeof data.output === "string") imageUrl = data.output;
    else if (data.output && typeof data.output === "object" && data.output[0]) imageUrl = data.output[0];

    if (!imageUrl || typeof imageUrl !== "string") {
      console.error("[product-ai/generate-image] unexpected Replicate output:", data);
      return NextResponse.json({ error: "Image generation returned no URL." }, { status: 502 });
    }

    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error("[product-ai/generate-image]:", err);
    const msg = err instanceof Error ? err.message : "Image generation failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
