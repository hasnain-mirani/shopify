import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SSHUB — Premium Mobile Accessories Pakistan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORIES = [
  "Earbuds",
  "Smartwatches",
  "Power Banks",
  "Phone Cases",
] as const;

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
            fontSize: 80,
            fontWeight: 700,
            letterSpacing: "-3px",
            marginBottom: "16px",
          }}
        >
          SSHUB
        </div>
        <div
          style={{
            color: "#888888",
            fontSize: 34,
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          Premium Mobile Accessories in Pakistan
        </div>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          {CATEGORIES.map((cat) => (
            <div
              key={cat}
              style={{
                background: "#ffffff10",
                border: "1px solid #ffffff20",
                borderRadius: "8px",
                padding: "8px 20px",
                color: "#aaaaaa",
                fontSize: 20,
              }}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
