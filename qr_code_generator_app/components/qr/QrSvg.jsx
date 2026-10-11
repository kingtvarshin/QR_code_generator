"use client";

import { useEffect, useRef } from "react";
import { renderQrSvgString } from "@/lib/qrExport";

// Renders an SVG QR code by calling the `qrcode` package directly, replacing
// next-qrcode's <SVG> component (which did exactly this internally, via its own
// now-redundant dependency on the same underlying `qrcode` package).
export default function QrSvg({ text, options, className }) {
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    renderQrSvgString(text, options).then((svgString) => {
      if (!cancelled && containerRef.current) containerRef.current.innerHTML = svgString;
    });
    return () => {
      cancelled = true;
    };
  }, [text, options]);

  return <div ref={containerRef} className={className} />;
}
