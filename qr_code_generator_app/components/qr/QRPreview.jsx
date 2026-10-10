"use client";

import { useEffect, useRef } from "react";
import { useQRCode } from "next-qrcode";
import { Typography } from "@material-tailwind/react";
import ErrorBoundary from "./ErrorBoundary";
import { renderQrCanvas, toQrCodeOptions } from "@/lib/qrExport";

function Placeholder({ children }) {
  return (
    <div className="w-60 h-60 flex items-center justify-center text-center px-4">
      <Typography variant="small" color="gray">
        {children}
      </Typography>
    </div>
  );
}

// Renders through the same renderQrCanvas()/compositeLogo() path used for PNG/JPEG
// export, so the preview and the downloaded file always match (aspect-ratio-safe
// logo, background-colored plate) instead of relying on next-qrcode's own simpler
// logo compositing (square stretch, no plate).
function LogoCanvasPreview({ text, options, logo }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    renderQrCanvas(text, options, logo).then((rendered) => {
      if (cancelled || !canvasRef.current) return;
      const target = canvasRef.current;
      target.width = rendered.width;
      target.height = rendered.height;
      target.getContext("2d").drawImage(rendered, 0, 0);
    });
    return () => {
      cancelled = true;
    };
  }, [text, options, logo]);

  return <canvas ref={canvasRef} role="img" aria-label="QR code preview" />;
}

function RenderedQrCode({ text, options, logo }) {
  const { SVG } = useQRCode();

  if (logo?.dataUrl) {
    return <LogoCanvasPreview text={text} options={options} logo={logo} />;
  }

  return <SVG text={text} options={toQrCodeOptions(options)} />;
}

export default function QRPreview({ text, options, logo, isReady, errorMessage }) {
  if (!isReady) {
    return <Placeholder>{errorMessage || "Fill in the form to generate a QR code."}</Placeholder>;
  }

  return (
    <ErrorBoundary
      resetKey={text}
      fallback={<Placeholder>This content is too large to encode. Try a lower error-correction level or shorter input.</Placeholder>}
    >
      <RenderedQrCode text={text} options={options} logo={logo} />
    </ErrorBoundary>
  );
}
