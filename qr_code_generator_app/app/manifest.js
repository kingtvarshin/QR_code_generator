export const dynamic = "force-static";

export default function manifest() {
  return {
    name: "QR Forge — QR Code Generator",
    short_name: "QR Forge",
    description:
      "Generate, customize, and download QR codes for URLs, text, phone, SMS, email, WiFi, and contact cards — entirely in your browser.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e293b",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png" }],
  };
}
