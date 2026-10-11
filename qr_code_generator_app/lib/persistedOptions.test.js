import { describe, expect, it } from "vitest";
import { loadPersistedOptions, savePersistedOptions, OPTIONS_KEY } from "./persistedOptions";

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

describe("loadPersistedOptions", () => {
  it("returns null when nothing is stored", () => {
    expect(loadPersistedOptions(new FakeStorage())).toBeNull();
  });

  it("round-trips valid options saved earlier", () => {
    const storage = new FakeStorage();
    savePersistedOptions(storage, { errorCorrectionLevel: "Q", margin: 2, width: 512, colorDark: "#111111", colorLight: "#eeeeee" });
    expect(loadPersistedOptions(storage)).toEqual({
      errorCorrectionLevel: "Q",
      margin: 2,
      width: 512,
      colorDark: "#111111",
      colorLight: "#eeeeee",
    });
  });

  it("drops an unrecognized error-correction level instead of letting it override the documented M default", () => {
    const storage = new FakeStorage();
    storage.setItem(OPTIONS_KEY, JSON.stringify({ errorCorrectionLevel: "Z", width: -5, margin: 999, colorDark: "red" }));
    const result = loadPersistedOptions(storage);
    expect(result).not.toHaveProperty("errorCorrectionLevel");
    // Other corrupted fields are left for the caller to merge over defaults —
    // only the EC level has a display/encoding mismatch to guard against here.
    expect(result.width).toBe(-5);
  });

  it("returns null for malformed JSON instead of throwing", () => {
    const storage = new FakeStorage();
    storage.setItem(OPTIONS_KEY, "{not json");
    expect(loadPersistedOptions(storage)).toBeNull();
  });
});
