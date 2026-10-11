import { Inter } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { getSiteUrl } from "@/lib/siteUrl";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = getSiteUrl();
const title = "QR Forge — Free QR Code Generator";
const description =
  "Generate QR codes for URLs, text, phone numbers, SMS, email, WiFi, and contact cards. Customize colors, size, and logo, then download as PNG, JPEG, or SVG. 100% in your browser — nothing is uploaded.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  // Static files in public/ rather than dynamic next/og routes — a plain static
  // file server serves these with the correct Content-Type from the .png
  // extension alone, which a server-less extensionless route can't guarantee.
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: { type: "website", title, description, url: "/", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

// The page itself has no dark styles (no `dark:` classes, no prefers-color-scheme
// rules), so a dark theme-color here would turn a phone's status bar dark over an
// otherwise all-white page — only declare the one color the page actually has.
export const viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
