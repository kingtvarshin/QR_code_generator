import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "QR Forge — Free QR Code Generator",
  description:
    "Generate QR codes for URLs, text, phone numbers, SMS, email, WiFi, and contact cards. Customize colors, size, and logo, then download as PNG, JPEG, or SVG.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
