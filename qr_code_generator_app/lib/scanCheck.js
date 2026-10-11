import QRCode from "qrcode";
import { hasInvertedColors } from "./color";
import { renderQrCanvas } from "./qrExport";

const MIN_CHECK_WIDTH = 300;
const MAX_CHECK_WIDTH = 1200;
const PIXELS_PER_MODULE = 4;

// Rendering too small for the code's own density (e.g. a long payload at a low
// error-correction level needs many modules) makes a perfectly scannable code
// fail this check — size the render off the actual module count instead of a
// fixed width, so the check and real-world scanning agree.
function checkRenderWidth(text, options) {
  const { size: moduleCount } = QRCode.create(text, { errorCorrectionLevel: options.errorCorrectionLevel }).modules;
  const width = (moduleCount + options.margin * 2) * PIXELS_PER_MODULE;
  return Math.min(MAX_CHECK_WIDTH, Math.max(MIN_CHECK_WIDTH, width));
}

// Returns the decoded string, null if a code was looked for but not found, or
// undefined if this API isn't usable at all (so the caller knows to fall back
// to jsQR instead of reporting a false negative).
async function detectWithBarcodeDetector(canvas) {
  if (typeof window === "undefined" || !("BarcodeDetector" in window)) return undefined;
  try {
    const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
    const results = await detector.detect(canvas);
    return results[0]?.rawValue ?? null;
  } catch {
    return undefined;
  }
}

// jsQR is only ever reached through this dynamic import, so it lands in its own
// chunk and is never part of the initial page load.
async function detectWithJsQr(canvas) {
  const { default: jsQR } = await import("jsqr");
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const result = jsQR(imageData.data, imageData.width, imageData.height);
  return result?.data ?? null;
}

// Returns null when there's nothing to check, or { ok, reason } where `reason`
// explains *why* it isn't scannable so the UI can give cause-specific advice
// instead of one generic warning.
export async function checkScannable(text, options, logo) {
  if (!text) return null;

  const width = checkRenderWidth(text, options);
  const canvas = await renderQrCanvas(text, { ...options, width }, logo);

  const viaDetector = await detectWithBarcodeDetector(canvas);
  const decoded = viaDetector !== undefined ? viaDetector : await detectWithJsQr(canvas);

  // "Found *a* code" isn't enough — compare the decoded payload against what we
  // actually encoded, otherwise a code that decodes to garbage still reads as OK.
  if (decoded !== text) return { ok: false, reason: logo ? "logo" : "unreadable" };
  if (hasInvertedColors(options.colorDark, options.colorLight)) return { ok: false, reason: "inverted" };
  return { ok: true, reason: null };
}
