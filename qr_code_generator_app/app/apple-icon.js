import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const dynamic = "force-static";

// iOS applies its own corner mask, so this is left square (no borderRadius) unlike
// the general icon.js.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e293b",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 100,
            height: 100,
            borderRadius: 16,
            background: "#ffffff",
            color: "#1e293b",
            fontSize: 54,
            fontWeight: 700,
            fontFamily: "sans-serif",
          }}
        >
          QR
        </div>
      </div>
    ),
    size
  );
}
