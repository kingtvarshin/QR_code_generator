// WCAG-style relative luminance / contrast ratio, used only to warn users when their
// chosen QR foreground/background colors are too close to scan reliably.

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function channelLuminance(channel) {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

export function contrastRatio(hexA, hexB) {
  const lumA = relativeLuminance(hexA) + 0.05;
  const lumB = relativeLuminance(hexB) + 0.05;
  return lumA > lumB ? lumA / lumB : lumB / lumA;
}

// QR scanners generally need strong contrast; 4.5 mirrors WCAG AA text contrast as a
// reasonable, conservative threshold below which we warn (not block) the user.
export const LOW_CONTRAST_THRESHOLD = 4.5;

export function hasLowContrast(colorDark, colorLight) {
  return contrastRatio(colorDark, colorLight) < LOW_CONTRAST_THRESHOLD;
}

// A QR scanner expects the "dark" modules to be the darker color. If the user swaps
// them (lighter modules on a darker background), many scanners — especially older
// ZXing-based Android readers — fail to decode it even when contrast itself is fine.
export function hasInvertedColors(colorDark, colorLight) {
  return relativeLuminance(colorDark) > relativeLuminance(colorLight);
}
