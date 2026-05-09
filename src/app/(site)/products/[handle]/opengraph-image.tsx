import { ImageResponse } from "next/og";
import { getProductByHandle } from "@/lib/catalog";
import { stripEmojisForSeo } from "@/lib/seo/text";

/** Node runtime: catalog client is not Edge-safe. */
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ handle: string }>;
};

export default async function Image({ params }: Props) {
  const { handle } = await params;
  const product = await getProductByHandle(handle).catch(() => null);
  const title = product
    ? stripEmojisForSeo(product.title)
    : "Product";
  const priceRaw = product?.priceRange?.minVariantPrice?.amount ?? "0";
  const firstUrl = product?.images?.[0]?.url ?? product?.featuredImage?.url;

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            background: "#0a0a0a",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px",
          }}
        >
          <div style={{ color: "white", fontSize: 48, fontWeight: 700 }}>SSHUB</div>
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
          padding: "60px",
          gap: "48px",
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
              color: "#666",
              fontSize: 22,
              marginBottom: "12px",
            }}
          >
            SSHUB.STORE
          </div>
          <div
            style={{
              color: "white",
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: "24px",
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: "#f59e0b",
              fontSize: 42,
              fontWeight: 700,
              marginBottom: "16px",
            }}
          >
            Rs {priceRaw}
          </div>
          <div style={{ color: "#555", fontSize: 22 }}>
            Fast delivery · Free returns · Authentic
          </div>
        </div>
        {firstUrl ? (
          <img
            src={firstUrl}
            width={380}
            height={380}
            alt=""
            style={{
              borderRadius: "20px",
              objectFit: "cover",
            }}
          />
        ) : null}
      </div>
    ),
    { ...size },
  );
}
