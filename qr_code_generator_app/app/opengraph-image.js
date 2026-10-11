import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "#1e293b",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: 24,
            background: "#ffffff",
            color: "#1e293b",
            fontSize: 72,
            fontWeight: 700,
          }}
        >
          QR
        </div>
        <div style={{ fontSize: 64, fontWeight: 700 }}>QR Forge</div>
        <div style={{ fontSize: 28, color: "#cbd5e1" }}>
          Free QR code generator — generate, customize, download
        </div>
      </div>
    ),
    size
  );
}
