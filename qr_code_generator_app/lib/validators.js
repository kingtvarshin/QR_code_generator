// Shared validation + normalization helpers used by lib/qrTypes.js encoders.

export function isNonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

const HAS_SCHEME_RE = /^[a-z][a-z0-9+.-]*:\/\//i;
const ALLOWED_URL_PROTOCOLS = new Set(["http:", "https:"]);
const IP_LITERAL_RE = /^\[?[0-9a-f:.]+\]?$/i;

export function normalizeUrl(value) {
  const trimmed = value.trim();
  return HAS_SCHEME_RE.test(trimmed) ? trimmed : `https://${trimmed}`;
}

// Parses with the real URL constructor (so IDN hostnames like "münchen.de" are
// punycode-normalized for free) and allow-lists http/https — a bare "scheme://"
// prefix used to be accepted outright, which let javascript:/data:/file: URIs
// generate a working QR code.
export function looksLikeUrl(value) {
  if (!isNonEmpty(value)) return false;
  try {
    const url = new URL(normalizeUrl(value));
    if (!ALLOWED_URL_PROTOCOLS.has(url.protocol)) return false;
    const host = url.hostname;
    return host === "localhost" || host.includes(".") || IP_LITERAL_RE.test(host);
  } catch {
    return false;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return isNonEmpty(value) && EMAIL_RE.test(value.trim());
}

// Splits a trailing "ext 89" / "x89" / "#89" off the main number so extension digits
// don't get glued onto it (e.g. "(555) 123-4567 ext 89" used to become the single,
// wrong number "tel:555123456789").
export function parsePhone(value) {
  const trimmed = (value || "").trim();
  const [main, ext] = trimmed.split(/\s*(?:ext\.?|x|#)\s*/i);
  const plus = main.trim().startsWith("+") ? "+" : "";
  return {
    number: `${plus}${main.replace(/\D/g, "")}`,
    ext: (ext || "").replace(/\D/g, ""),
  };
}

export function normalizePhoneDigits(value) {
  return parsePhone(value).number;
}

// tel: URI with an extension appended per RFC 3966 (e.g. "tel:+15551234567;ext=89").
export function toTelUri(value) {
  const { number, ext } = parsePhone(value);
  return `tel:${number}${ext ? `;ext=${ext}` : ""}`;
}

export function isValidPhone(value) {
  const digitCount = parsePhone(value).number.replace("+", "").length;
  return digitCount >= 7 && digitCount <= 15;
}

// Escapes characters with special meaning inside a WIFI: URI field
// (backslash must be escaped first, before the characters it would otherwise double-escape).
export function escapeWifiField(value) {
  return (value || "").replace(/([\\;,":])/g, "\\$1");
}

// Escapes characters with special meaning inside a vCard 3.0 field value
// (RFC 2426 §5.8.4: backslash, comma, semicolon, and literal newlines).
export function escapeVCardField(value) {
  return (value || "").replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/([,;])/g, "\\$1");
}

// Rough per-error-correction-level byte capacity ceiling (QR version 40, byte mode),
// used only as a pre-render sanity check, not as an exact encoder.
const EC_LEVEL_BYTE_CAPACITY = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
};

export function exceedsCapacity(text, errorCorrectionLevel) {
  const cap = EC_LEVEL_BYTE_CAPACITY[errorCorrectionLevel] ?? EC_LEVEL_BYTE_CAPACITY.M;
  return new TextEncoder().encode(text).length > cap;
}
