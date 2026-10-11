// Persists only customization *settings* (size/EC level/margin/colors), never QR
// content — kept separate from history.js, which persists generated codes.

import { VALID_EC_LEVELS } from "./validators";

export const OPTIONS_KEY = "qr-options:v1";
const PERSISTED_KEYS = ["errorCorrectionLevel", "margin", "width", "colorDark", "colorLight"];

export function loadPersistedOptions(storage) {
  try {
    const raw = storage.getItem(OPTIONS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const result = Object.fromEntries(PERSISTED_KEYS.filter((key) => key in parsed).map((key) => [key, parsed[key]]));

    // An unrecognized level would otherwise render as whichever option a <select>
    // happens to list first, while the `qrcode` library itself silently defaults
    // unknown values to M internally — drop it so the default (M) applies to both
    // the display and the actual encoding instead of letting them disagree.
    if (result.errorCorrectionLevel !== undefined && !VALID_EC_LEVELS.includes(result.errorCorrectionLevel)) {
      delete result.errorCorrectionLevel;
    }

    return result;
  } catch {
    return null;
  }
}

export function savePersistedOptions(storage, options) {
  try {
    const toSave = Object.fromEntries(PERSISTED_KEYS.map((key) => [key, options[key]]));
    storage.setItem(OPTIONS_KEY, JSON.stringify(toSave));
  } catch {
    // Best-effort only — not critical app state.
  }
}
