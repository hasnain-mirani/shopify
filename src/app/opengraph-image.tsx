import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SSHUB — Premium Mobile Accessories Pakistan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
        <div
          style={{
            color: "white",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-2px",
            marginBottom: "20px",
          }}
        >
          SSHUB
        </div>
        <div
          style={{
            color: "#888",
            fontSize: 32,
            textAlign: "center",
          }}
        >
          Premium Mobile Accessories in Pakistan
        </div>
        <div
          style={{
            marginTop: "40px",
            background: "#ffffff15",
            border: "1px solid #ffffff25",
            borderRadius: "12px",
            padding: "12px 32px",
            color: "#aaa",
            fontSize: 24,
          }}
        >
          sshub.store
        </div>
      </div>
    ),
    { ...size },
  );
}
