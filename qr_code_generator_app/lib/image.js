"use client";

// Downscales a data-URL image to at most maxDim x maxDim (preserving aspect ratio)
// and re-encodes as WebP, used before storing a logo in history so repeated
// full-resolution uploads don't blow up localStorage's quota.
export function downscaleImageDataUrl(dataUrl, maxDim = 128) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/webp", 0.85));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}
