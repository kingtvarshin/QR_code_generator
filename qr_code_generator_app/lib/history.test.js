import { describe, expect, it } from "vitest";
import {
  MAX_NON_FAVORITE_ITEMS,
  addHistoryItem,
  createEmptyHistory,
  loadHistory,
  removeHistoryItem,
  saveHistory,
  toggleFavorite,
} from "./history";

function item(id, overrides = {}) {
  return { id, type: "url", fields: {}, options: {}, logo: null, createdAt: id, isFavorite: false, label: id, ...overrides };
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

  it("replaces an existing item with the same id instead of duplicating", () => {
    let history = createEmptyHistory();
    history = addHistoryItem(history, item(1, { label: "first" }));
    history = addHistoryItem(history, item(1, { label: "second" }));
    expect(history.items).toHaveLength(1);
    expect(history.items[0].label).toBe("second");
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

describe("removeHistoryItem / toggleFavorite", () => {
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
});
