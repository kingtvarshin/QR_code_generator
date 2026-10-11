import { describe, expect, it } from "vitest";
import { contrastRatio, hasInvertedColors, hasLowContrast } from "./color";

describe("hasLowContrast", () => {
  it("flags similar colors", () => {
    expect(hasLowContrast("#777777", "#888888")).toBe(true);
  });

  it("accepts black on white", () => {
    expect(hasLowContrast("#000000", "#ffffff")).toBe(false);
  });
});

describe("hasInvertedColors", () => {
  it("is false for the normal dark-on-light default", () => {
    expect(hasInvertedColors("#000000", "#ffffff")).toBe(false);
  });

  it("is true when the 'dark' color is actually lighter than the background", () => {
    expect(hasInvertedColors("#ffffff", "#000000")).toBe(true);
    expect(hasInvertedColors("#cccccc", "#333333")).toBe(true); // light gray on dark gray
  });
});

describe("contrastRatio", () => {
  it("is symmetric regardless of argument order", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(contrastRatio("#ffffff", "#000000"));
  });
});
