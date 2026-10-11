import { renderQrCanvas } from "./qrExport";

// Decoding is only a scannability *check*, not the preview — rendering at full
// export resolution (up to 4096px) would be slow for no benefit, so this always
// decodes a modest, fixed-size render.
const CHECK_WIDTH = 300;

async function detectWithBarcodeDetector(canvas) {
  if (typeof window === "undefined" || !("BarcodeDetector" in window)) return null;
  try {
    const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
    const results = await detector.detect(canvas);
    return results.length > 0;
  } catch {
    // Some browsers advertise BarcodeDetector but don't actually support the
    // "qr_code" format (or throw on canvas input) — fall back to jsQR instead
    // of reporting a false negative.
    return null;
  }
}

// jsQR is only ever reached through this dynamic import, so it lands in its own
// chunk and is never part of the initial page load.
async function detectWithJsQr(canvas) {
  const { default: jsQR } = await import("jsqr");
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return Boolean(jsQR(imageData.data, imageData.width, imageData.height));
}

// Returns true/false once decoded, or null if there's nothing to check.
export async function checkScannable(text, options, logo) {
  if (!text) return null;
  const canvas = await renderQrCanvas(text, { ...options, width: CHECK_WIDTH }, logo);

  const viaDetector = await detectWithBarcodeDetector(canvas);
  if (viaDetector !== null) return viaDetector;

  return detectWithJsQr(canvas);
}
