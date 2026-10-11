"use client";

import { useEffect, useRef } from "react";
import ErrorBoundary from "./ErrorBoundary";
import QrSvg from "./QrSvg";
import { renderQrCanvas } from "@/lib/qrExport";

// The "size" setting is really the download/export resolution (up to 4096px) — the
// on-screen preview always renders at this fixed, modest resolution and is scaled to
// fit its box with CSS, so picking a large export size doesn't make every keystroke
// re-render a multi-megapixel canvas.
const PREVIEW_WIDTH = 240;

function Placeholder({ children }) {
  return (
    <div className="w-60 h-60 flex items-center justify-center text-center px-4">
      <p className="text-sm text-gray-500">{children}</p>
    </div>
  );
}

// Renders through the same renderQrCanvas()/compositeLogo() path used for PNG/JPEG
// export, so the preview and the downloaded file always match (aspect-ratio-safe
// logo, background-colored plate).
function LogoCanvasPreview({ text, options, logo }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    renderQrCanvas(text, { ...options, width: PREVIEW_WIDTH }, logo).then((rendered) => {
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
  if (logo?.dataUrl) {
    return <LogoCanvasPreview text={text} options={options} logo={logo} />;
  }

  return (
    <div role="img" aria-label="QR code preview">
      <QrSvg text={text} options={{ ...options, width: PREVIEW_WIDTH }} />
    </div>
  );
}

export default function QRPreview({ text, options, logo, isReady, errorMessage }) {
  if (!isReady) {
    return (
      <>
        <Placeholder>{errorMessage || "Fill in the form to generate a QR code."}</Placeholder>
        <p className="sr-only" aria-live="polite">
          {errorMessage || ""}
        </p>
      </>
    );
  }

  return (
    <ErrorBoundary
      resetKey={text}
      fallback={<Placeholder>This content is too large to encode. Try a lower error-correction level or shorter input.</Placeholder>}
    >
      <RenderedQrCode text={text} options={options} logo={logo} />
      <p className="sr-only" aria-live="polite">
        QR code updated
      </p>
    </ErrorBoundary>
  );
}
