import { ImageResponse } from "next/og";
import { getProductByHandle } from "@/lib/catalog";
import { stripEmojisForSeo } from "@/lib/seo/text";

/** Node runtime: catalog uses shared API client (not Edge-safe). */
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ handle: string }>;
};

export default async function Image({ params }: Props) {
  const { handle } = await params;
  const product = await getProductByHandle(handle).catch(() => null);
  const cleanTitle = product ? stripEmojisForSeo(product.title) : "Product";
  const firstImage = product?.images?.[0] ?? product?.featuredImage;
  const amount = parseFloat(
    product?.priceRange?.minVariantPrice?.amount ?? "0",
  );
  const priceLabel = `Rs ${amount.toLocaleString("en-PK")}`;

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            background: "#0a0a0a",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px",
          }}
        >
          <div style={{ color: "white", fontSize: 56, fontWeight: 700 }}>
            SSHUB
          </div>
          <div style={{ color: "#888", fontSize: 28, marginTop: 24 }}>
            Product not found
          </div>
        </div>
      ),
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "60px",
          gap: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <div
            style={{
              color: "#888",
              fontSize: 24,
              marginBottom: "16px",
            }}
          >
            SSHUB
          </div>
          <div
            style={{
              color: "white",
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {cleanTitle}
          </div>
          <div
            style={{
              color: "#f59e0b",
              fontSize: 36,
              marginTop: "24px",
            }}
          >
            {priceLabel}
          </div>
          <div
            style={{
              color: "#666",
              fontSize: 22,
              marginTop: "12px",
            }}
          >
            Fast delivery across Pakistan
          </div>
        </div>
        {firstImage?.url ? (
          <img
            src={firstImage.url}
            width={400}
            height={400}
            alt=""
            style={{
              borderRadius: "16px",
              objectFit: "cover",
            }}
          />
        ) : null}
      </div>
    ),
    { ...size },
  );
}
