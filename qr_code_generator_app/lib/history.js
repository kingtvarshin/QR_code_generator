// Pure history-list logic, kept separate from localStorage I/O so it's unit-testable
// without a real browser `window`.

export const HISTORY_KEY = "qr-history:v1";
export const MAX_NON_FAVORITE_ITEMS = 50;

export function createEmptyHistory() {
  return { version: 1, items: [] };
}

// Cheap non-cryptographic hash (djb2), used only to dedupe identical content —
// downloading PNG, then JPEG, then SVG of the same code used to create 3 rows.
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

export function computeContentKey({ type, fields, options, logo }) {
  return hashString(JSON.stringify({ type, fields, options, logoDataUrl: logo?.dataUrl }));
}

export function addHistoryItem(history, item) {
  const contentKey = item.contentKey ?? computeContentKey(item);
  const existing = history.items.find((entry) => entry.contentKey === contentKey);

  const merged = existing
    ? {
        ...existing,
        createdAt: item.createdAt,
        formats: Array.from(new Set([...(existing.formats ?? []), ...(item.formats ?? [])])),
      }
    : { ...item, contentKey, formats: item.formats ?? [] };

  const items = [merged, ...history.items.filter((entry) => entry.contentKey !== contentKey)];
  const favorites = items.filter((entry) => entry.isFavorite);
  const nonFavorites = items.filter((entry) => !entry.isFavorite).slice(0, MAX_NON_FAVORITE_ITEMS);
  const result = [...favorites, ...nonFavorites].sort((a, b) => b.createdAt - a.createdAt);
  return { ...history, items: result };
}

export function removeHistoryItem(history, id) {
  return { ...history, items: history.items.filter((entry) => entry.id !== id) };
}

// Clears everything except favorites, which stay protected the same way they're
// exempt from the non-favorite cap.
export function clearNonFavorites(history) {
  return { ...history, items: history.items.filter((entry) => entry.isFavorite) };
}

export function toggleFavorite(history, id) {
  return {
    ...history,
    items: history.items.map((entry) =>
      entry.id === id ? { ...entry, isFavorite: !entry.isFavorite } : entry
    ),
  };
}

export function loadHistory(storage) {
  try {
    const raw = storage.getItem(HISTORY_KEY);
    if (!raw) return createEmptyHistory();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return createEmptyHistory();
    return parsed;
  } catch {
    return createEmptyHistory();
  }
}

export function saveHistory(storage, history) {
  try {
    storage.setItem(HISTORY_KEY, JSON.stringify(history));
    return true;
  } catch {
    // Storage may be unavailable or full (private browsing, quota exceeded) —
    // report failure so the caller can surface it, rather than failing silently.
    return false;
  }
}
