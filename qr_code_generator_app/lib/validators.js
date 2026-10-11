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

// wa.me takes bare digits including the country code — no "+", no leading 00,
// no formatting. A 10-digit number with no code is ambiguous (e.g. a number
// starting "98" reads as Iran's country code to WhatsApp, not a bare Indian
// number), so it's treated as India (+91) by default and flagged via `assumedCc`
// rather than silently sent to the wrong country.
export function normalizeWhatsAppNumber(value = "", defaultCc = "91") {
  let v = value.trim().replace(/[\s().-]/g, "");
  if (v.startsWith("00")) v = `+${v.slice(2)}`;
  const hasCc = v.startsWith("+");
  const digits = v.replace(/\D/g, "");
  if (!hasCc && digits.length === 10) return { digits: `${defaultCc}${digits}`, assumedCc: true };
  if (!hasCc) return { digits, error: "Add the country code, e.g. +91 98765 43210" };
  if (digits.length < 8 || digits.length > 15) return { digits, error: "Enter a valid phone number." };
  return { digits, assumedCc: false };
}

const UPI_VPA_RE = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

export function isValidUpiVpa(value) {
  return isNonEmpty(value) && UPI_VPA_RE.test(value.trim());
}

const UPI_AMOUNT_RE = /^\d+(\.\d{1,2})?$/;

// NPCI's default per-transaction limit for P2P UPI transfers — amounts above this
// still encode (many apps/banks enforce their own real limit), but get a
// non-blocking warning rather than being silently sent as-is.
export const UPI_SOFT_LIMIT = 100000;

// Strips thousands separators and the ₹ symbol people commonly type (e.g.
// "1,00,000" or "₹499.50") before validating/encoding, so amounts typed the way
// Indians actually type them aren't rejected.
function cleanUpiAmountInput(value) {
  return (value || "").replace(/[,\s₹]/g, "");
}

// Amount is optional — an empty value is valid (just omitted from the encoded
// URI); when present it must be a positive number with at most 2 decimals.
export function isValidUpiAmount(value) {
  if (!isNonEmpty(value)) return true;
  const clean = cleanUpiAmountInput(value);
  return UPI_AMOUNT_RE.test(clean) && Number(clean) > 0;
}

// Normalizes a valid amount to the 2-decimal form the UPI spec and most apps
// expect (e.g. "499.5" -> "499.50"), and flags amounts above UPI_SOFT_LIMIT.
export function normalizeUpiAmount(value) {
  if (!isValidUpiAmount(value)) return { value: "" };
  if (!isNonEmpty(value)) return { value: "" };
  const amount = Number(cleanUpiAmountInput(value));
  return {
    value: amount.toFixed(2),
    warn:
      amount > UPI_SOFT_LIMIT
        ? `Above ₹${UPI_SOFT_LIMIT.toLocaleString("en-IN")} — many UPI apps will reject this.`
        : null,
  };
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

export const VALID_EC_LEVELS = Object.keys(EC_LEVEL_BYTE_CAPACITY);

export function capacityForLevel(errorCorrectionLevel) {
  return EC_LEVEL_BYTE_CAPACITY[errorCorrectionLevel] ?? EC_LEVEL_BYTE_CAPACITY.M;
}

export function byteLength(text) {
  return new TextEncoder().encode(text || "").length;
}

export function exceedsCapacity(text, errorCorrectionLevel) {
  return byteLength(text) > capacityForLevel(errorCorrectionLevel);
}
