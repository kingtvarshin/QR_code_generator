import { describe, expect, it } from "vitest";
import { scanStatusLabel } from "./useScanCheck";

describe("scanStatusLabel", () => {
  it("returns null when there's no result yet", () => {
    expect(scanStatusLabel(null)).toBeNull();
  });

  it("labels an ok result as Scannable", () => {
    expect(scanStatusLabel({ ok: true, reason: null })).toBe("Scannable");
  });

  it("labels a failed result as May not scan, regardless of the specific reason", () => {
    expect(scanStatusLabel({ ok: false, reason: "inverted" })).toBe("May not scan");
    expect(scanStatusLabel({ ok: false, reason: "logo" })).toBe("May not scan");
  });

  it("labels an unavailable check (ok: null) distinctly from either an actual pass or fail", () => {
    expect(scanStatusLabel({ ok: null, reason: "unavailable" })).toBe("Scan check unavailable");
  });
});
