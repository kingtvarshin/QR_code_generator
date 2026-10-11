import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";
export const dynamic = "force-static";

// Satori (what ImageResponse renders through) supports flexbox div/text layouts,
// not arbitrary inline SVG, so the mark is built from plain divs rather than an
// actual <svg> QR pattern.
export default function Icon() {
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
          borderRadius: 64,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 280,
            height: 280,
            borderRadius: 32,
            background: "#ffffff",
            color: "#1e293b",
            fontSize: 150,
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
