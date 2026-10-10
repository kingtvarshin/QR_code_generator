// Shared validation + normalization helpers used by lib/qrTypes.js encoders.

export function isNonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

const URL_HOST_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

export function looksLikeUrl(value) {
  if (!isNonEmpty(value)) return false;
  const trimmed = value.trim();
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return true;
  const withoutPath = trimmed.split(/[/?#]/)[0].split(":")[0];
  return URL_HOST_RE.test(withoutPath);
}

export function normalizeUrl(value) {
  const trimmed = value.trim();
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return isNonEmpty(value) && EMAIL_RE.test(value.trim());
}

export function normalizePhoneDigits(value) {
  const trimmed = (value || "").trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  const digits = trimmed.replace(/[^\d]/g, "");
  return `${plus}${digits}`;
}

export function isValidPhone(value) {
  const normalized = normalizePhoneDigits(value);
  const digitCount = normalized.replace("+", "").length;
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
