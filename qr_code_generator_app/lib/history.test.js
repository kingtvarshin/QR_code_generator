import { describe, expect, it } from "vitest";
import {
  MAX_NON_FAVORITE_ITEMS,
  addHistoryItem,
  clearNonFavorites,
  computeContentKey,
  createEmptyHistory,
  loadHistory,
  removeHistoryItem,
  saveHistory,
  toggleFavorite,
} from "./history";

// Distinct `fields` per id so each item is genuinely different content —
// addHistoryItem dedupes by content, so identical fields would merge.
function item(id, overrides = {}) {
  return {
    id,
    type: "url",
    fields: { url: `example-${id}.com` },
    options: {},
    logo: null,
    createdAt: id,
    isFavorite: false,
    label: id,
    ...overrides,
  };
}

class FakeStorage {
  constructor() {
    this.data = new Map();
  }
  getItem(key) {
    return this.data.has(key) ? this.data.get(key) : null;
  }
  setItem(key, value) {
    this.data.set(key, value);
  }
}

describe("addHistoryItem", () => {
  it("adds newest first", () => {
    let history = createEmptyHistory();
    history = addHistoryItem(history, item(1));
    history = addHistoryItem(history, item(2));
    expect(history.items.map((i) => i.id)).toEqual([2, 1]);
  });

  it("merges identical content (same type/fields/options/logo) into one entry", () => {
    let history = createEmptyHistory();
    history = addHistoryItem(history, { ...item(1), formats: ["png"] });
    history = addHistoryItem(history, { ...item(1), id: 2, createdAt: 2, formats: ["jpeg"] });
    history = addHistoryItem(history, { ...item(1), id: 3, createdAt: 3, formats: ["svg"] });
    expect(history.items).toHaveLength(1);
    expect(history.items[0].formats.sort()).toEqual(["jpeg", "png", "svg"]);
    expect(history.items[0].createdAt).toBe(3);
  });

  it("computeContentKey differs when fields differ and matches when they don't", () => {
    expect(computeContentKey(item(1))).not.toBe(computeContentKey(item(2)));
    expect(computeContentKey(item(1))).toBe(computeContentKey({ ...item(1), id: 999 }));
  });

  it("caps non-favorite items but keeps all favorites", () => {
    let history = createEmptyHistory();
    history = addHistoryItem(history, item(-1, { isFavorite: true, createdAt: -1 }));
    for (let i = 0; i < MAX_NON_FAVORITE_ITEMS + 10; i++) {
      history = addHistoryItem(history, item(i, { createdAt: i }));
    }
    const favorites = history.items.filter((entry) => entry.isFavorite);
    const nonFavorites = history.items.filter((entry) => !entry.isFavorite);
    expect(favorites).toHaveLength(1);
    expect(nonFavorites.length).toBeLessThanOrEqual(MAX_NON_FAVORITE_ITEMS);
  });
});

describe("removeHistoryItem / toggleFavorite / clearNonFavorites", () => {
  it("removes the matching item", () => {
    let history = createEmptyHistory();
    history = addHistoryItem(history, item(1));
    history = removeHistoryItem(history, 1);
    expect(history.items).toHaveLength(0);
  });

  it("flips isFavorite only for the matching item", () => {
    let history = createEmptyHistory();
    history = addHistoryItem(history, item(1));
    history = addHistoryItem(history, item(2));
    history = toggleFavorite(history, 1);
    expect(history.items.find((i) => i.id === 1).isFavorite).toBe(true);
    expect(history.items.find((i) => i.id === 2).isFavorite).toBe(false);
  });

  it("clearNonFavorites keeps favorites and drops everything else", () => {
    let history = createEmptyHistory();
    history = addHistoryItem(history, item(1, { isFavorite: true }));
    history = addHistoryItem(history, item(2));
    history = addHistoryItem(history, item(3));
    history = clearNonFavorites(history);
    expect(history.items.map((i) => i.id)).toEqual([1]);
  });
});

describe("loadHistory / saveHistory", () => {
  it("round-trips through a storage-like object", () => {
    const storage = new FakeStorage();
    let history = createEmptyHistory();
    history = addHistoryItem(history, item(1));
    saveHistory(storage, history);
    expect(loadHistory(storage).items).toHaveLength(1);
  });

  it("returns an empty history when storage is empty or corrupt", () => {
    const storage = new FakeStorage();
    expect(loadHistory(storage)).toEqual(createEmptyHistory());
    storage.setItem("qr-history:v1", "{not json");
    expect(loadHistory(storage)).toEqual(createEmptyHistory());
  });

  it("saveHistory returns false (instead of throwing) when storage write fails", () => {
    const fullStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    expect(saveHistory(fullStorage, createEmptyHistory())).toBe(false);
  });
});
