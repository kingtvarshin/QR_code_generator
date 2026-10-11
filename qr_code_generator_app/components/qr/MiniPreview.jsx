"use client";

import { useEffect, useState } from "react";
import QrSvg from "./QrSvg";
import { scanStatusLabel } from "@/lib/useScanCheck";

const VISIBILITY_THRESHOLD = 0.3;

// Mobile only. The main preview can scroll out of view — above it while typing
// into a field further down the form (Contact, WiFi, UPI), or below it once the
// keyboard covers the bottom of the screen — so this sticky thumbnail brings the
// result back to the user instead of making them scroll to find it.
export default function MiniPreview({ previewRef, text, options, isReady, scanResult }) {
  const [mainVisible, setMainVisible] = useState(true);

  useEffect(() => {
    const target = previewRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setMainVisible(entry.intersectionRatio >= VISIBILITY_THRESHOLD), {
      threshold: [0, VISIBILITY_THRESHOLD, 1],
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [previewRef]);

  if (!isReady || mainVisible) return null;

  const status = scanStatusLabel(scanResult) ?? "QR ready";

  return (
    <button
      type="button"
      onClick={() => previewRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
      aria-label={`Show QR code. ${status}`}
      className="md:hidden fixed right-3 z-40 flex items-center gap-2 rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-200"
      style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <span className="h-14 w-14 shrink-0 [&>div]:h-full [&>div]:w-full [&_svg]:h-full [&_svg]:w-full" aria-hidden="true">
        <QrSvg text={text} options={{ ...options, width: 56, margin: 1 }} />
      </span>
      <span className="pr-1 text-sm text-slate-700 text-left leading-tight">
        {status}
        <br />
        <span className="text-blue-700">View ↑</span>
      </span>
    </button>
  );
}
