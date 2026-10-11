import QRCode from "qrcode";

function slugify(value) {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "code";
}

export function buildFilename(type, summary, size, ext) {
  return `qr-${type}-${slugify(summary)}-${size}.${ext}`;
}

// Maps our flat `options` state shape to the `qrcode` package's nested options shape.
export function toQrCodeOptions(options) {
  return {
    errorCorrectionLevel: options.errorCorrectionLevel,
    margin: options.margin,
    width: options.width,
    color: {
      dark: options.colorDark,
      light: options.colorLight,
    },
  };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// "Contain" fit: scales naturalW/H down to fit inside box x box without distortion.
function computeContainedSize(naturalWidth, naturalHeight, box) {
  const scale = Math.min(box / naturalWidth, box / naturalHeight);
  return { width: naturalWidth * scale, height: naturalHeight * scale };
}

function fillRoundedRect(ctx, x, y, width, height, radius) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, width, height);
  }
}

async function compositeLogo(canvas, logo, plateColor) {
  if (!logo?.dataUrl) return canvas;
  const img = await loadImage(logo.dataUrl);
  const ctx = canvas.getContext("2d");
  const box = canvas.width * (logo.widthRatio ?? 0.22);
  const { width, height } = computeContainedSize(img.naturalWidth || img.width, img.naturalHeight || img.height, box);
  const x = (canvas.width - width) / 2;
  const y = (canvas.height - height) / 2;
  const padding = box * 0.08;

  // Backing plate (in the QR's own background color) so the logo stays legible over
  // dark modules, sized to the square bounding box rather than the logo's own aspect
  // ratio so non-square logos still get a consistent plate.
  ctx.fillStyle = plateColor;
  fillRoundedRect(ctx, (canvas.width - box) / 2 - padding, (canvas.height - box) / 2 - padding, box + padding * 2, box + padding * 2, padding);
  ctx.drawImage(img, x, y, width, height);
  return canvas;
}

export async function renderQrCanvas(text, options, logo) {
  const canvas = await QRCode.toCanvas(text, toQrCodeOptions(options));
  return compositeLogo(canvas, logo, options.colorLight);
}

export async function renderQrSvgString(text, options, logo) {
  const svgString = await QRCode.toString(text, { type: "svg", ...toQrCodeOptions(options) });
  if (!logo?.dataUrl) return svgString;

  const match = svgString.match(/viewBox="0 0 (\d+) \d+"/);
  const qrSize = match ? Number(match[1]) : options.width;
  const img = await loadImage(logo.dataUrl);
  const box = qrSize * (logo.widthRatio ?? 0.22);
  const { width, height } = computeContainedSize(img.naturalWidth || img.width, img.naturalHeight || img.height, box);
  const x = (qrSize - width) / 2;
  const y = (qrSize - height) / 2;
  const padding = box * 0.08;
  const plateSize = box + padding * 2;
  const plateOffset = (qrSize - box) / 2 - padding;

  const overlay =
    `<rect x="${plateOffset}" y="${plateOffset}" width="${plateSize}" height="${plateSize}" rx="${padding}" fill="${options.colorLight}"/>` +
    `<image href="${logo.dataUrl}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>`;

  return svgString.replace("</svg>", `${overlay}</svg>`);
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Revoking synchronously can cancel the download in Safari/Firefox/some Android
  // WebViews before they've finished reading the blob URL.
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function downloadSvg(text, options, logo, filename = "qrcode.svg") {
  const svgString = await renderQrSvgString(text, options, logo);
  downloadBlob(new Blob([svgString], { type: "image/svg+xml" }), filename);
}

export async function downloadRaster(text, options, logo, mime, filename) {
  const canvas = await renderQrCanvas(text, options, logo);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, 0.92));
  downloadBlob(blob, filename);
}

export async function downloadPng(text, options, logo, filename = "qrcode.png") {
  return downloadRaster(text, options, logo, "image/png", filename);
}

export async function downloadJpeg(text, options, logo, filename = "qrcode.jpg") {
  return downloadRaster(text, options, logo, "image/jpeg", filename);
}

export async function getPngBlob(text, options, logo) {
  const canvas = await renderQrCanvas(text, options, logo);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.92));
}

export function canShareFiles(file) {
  return typeof navigator !== "undefined" && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });
}

// Prefers the native share sheet (the real mobile workflow — "send this to
// WhatsApp/Messages/Save to Photos") and falls back to a normal download when the
// Web Share API or file sharing isn't available, or the browser denies it outright.
export async function shareOrDownloadBlob(blob, filename, title = "QR code") {
  const file = new File([blob], filename, { type: blob.type });
  if (canShareFiles(file)) {
    try {
      await navigator.share({ files: [file], title });
      return "shared";
    } catch (err) {
      if (err?.name === "AbortError") return "cancelled";
      // Any other failure (e.g. a permissions quirk) falls through to a download.
    }
  }
  downloadBlob(blob, filename);
  return "downloaded";
}

export function canCopyImages() {
  return (
    typeof navigator !== "undefined" &&
    typeof window !== "undefined" &&
    "clipboard" in navigator &&
    typeof window.ClipboardItem === "function"
  );
}

export async function copyBlobToClipboard(blob) {
  // Safari requires the ClipboardItem to wrap a Promise<Blob> (not a resolved Blob)
  // so the permission prompt doesn't block the async canvas render.
  await navigator.clipboard.write([new window.ClipboardItem({ [blob.type]: Promise.resolve(blob) })]);
}
