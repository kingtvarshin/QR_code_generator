import { Inter } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { getSiteUrl } from "@/lib/siteUrl";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = getSiteUrl();
const title = "QR Forge — Free QR Code Generator";
const description =
  "Generate QR codes for URLs, text, phone numbers, SMS, email, WiFi, contact cards, WhatsApp, and UPI payments. Customize colors, size, and logo, then download as PNG, JPEG, or SVG. 100% in your browser — nothing is uploaded.";

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

// Covers the OS-level default before the user has made an explicit choice —
// lib/useTheme.js patches this meta tag imperatively once they toggle, since a
// manual choice should override the media-query default it was initialized from.
export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef2ff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

// Runs synchronously before first paint (a plain inline script, not next/script,
// which defers) so the page never flashes the wrong theme while React hydrates.
// suppressHydrationWarning on <html> is required because this script mutates
// documentElement's class outside React's render — without it React logs a
// (harmless) mismatch warning for a change it didn't make itself.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("qr-forge-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-br from-indigo-100 via-violet-50 to-fuchsia-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 text-slate-900 dark:text-slate-100 transition-colors duration-300`}
      >
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
