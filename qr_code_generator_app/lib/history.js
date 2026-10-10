// Pure history-list logic, kept separate from localStorage I/O so it's unit-testable
// without a real browser `window`.

export const HISTORY_KEY = "qr-history:v1";
export const MAX_NON_FAVORITE_ITEMS = 50;

export function createEmptyHistory() {
  return { version: 1, items: [] };
}

export function addHistoryItem(history, item) {
  const items = [item, ...history.items.filter((existing) => existing.id !== item.id)];
  const favorites = items.filter((entry) => entry.isFavorite);
  const nonFavorites = items.filter((entry) => !entry.isFavorite).slice(0, MAX_NON_FAVORITE_ITEMS);
  const merged = [...favorites, ...nonFavorites].sort((a, b) => b.createdAt - a.createdAt);
  return { ...history, items: merged };
}

export function removeHistoryItem(history, id) {
  return { ...history, items: history.items.filter((entry) => entry.id !== id) };
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
  } catch {
    // Storage may be unavailable (private browsing, quota exceeded) — fail silently,
    // history is a convenience feature, not critical app state.
  }
}
