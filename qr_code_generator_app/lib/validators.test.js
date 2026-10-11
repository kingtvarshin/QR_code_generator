import { describe, expect, it } from "vitest";
import {
  escapeWifiField,
  exceedsCapacity,
  isValidEmail,
  isValidPhone,
  isValidUpiAmount,
  isValidUpiVpa,
  looksLikeUrl,
  normalizePhoneDigits,
  normalizeUrl,
  parsePhone,
  toTelUri,
} from "./validators";

describe("looksLikeUrl / normalizeUrl", () => {
  it("accepts a bare domain", () => {
    expect(looksLikeUrl("example.com")).toBe(true);
  });

  it("accepts a domain with a path", () => {
    expect(looksLikeUrl("example.com/path?x=1")).toBe(true);
  });

  it("rejects plain text with no dot", () => {
    expect(looksLikeUrl("not a url")).toBe(false);
  });

  it("accepts IDN (unicode) domains", () => {
    expect(looksLikeUrl("münchen.de")).toBe(true);
  });

  it("accepts localhost and IP literals", () => {
    expect(looksLikeUrl("localhost:3000")).toBe(true);
    expect(looksLikeUrl("127.0.0.1")).toBe(true);
    expect(looksLikeUrl("http://[::1]")).toBe(true);
  });

  it("rejects non-http(s) schemes, including ones that smuggle script URIs", () => {
    expect(looksLikeUrl("javascript://%0Aalert(1)")).toBe(false);
    expect(looksLikeUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(looksLikeUrl("file:///etc/passwd")).toBe(false);
  });

  it("normalizeUrl prepends https:// only when no scheme is present", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com");
    expect(normalizeUrl("ftp://example.com")).toBe("ftp://example.com");
  });
});

describe("isValidEmail", () => {
  it("accepts a normal address", () => {
    expect(isValidEmail("a@b.com")).toBe(true);
  });

  it("rejects addresses missing an @ or domain", () => {
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("ab.com")).toBe(false);
  });
});

describe("phone helpers", () => {
  it("normalizePhoneDigits strips formatting but keeps a leading +", () => {
    expect(normalizePhoneDigits("+1 (555) 123-4567")).toBe("+15551234567");
  });

  it("isValidPhone enforces a reasonable digit-count range", () => {
    expect(isValidPhone("555-123")).toBe(false); // 6 digits
    expect(isValidPhone("+1 555 123 4567")).toBe(true); // 11 digits
  });

  it("parsePhone splits off a trailing extension instead of gluing it to the number", () => {
    expect(parsePhone("(555) 123-4567 ext 89")).toEqual({ number: "5551234567", ext: "89" });
    expect(parsePhone("+1 555 123 4567 x89")).toEqual({ number: "+15551234567", ext: "89" });
    expect(parsePhone("555-123-4567")).toEqual({ number: "5551234567", ext: "" });
  });

  it("toTelUri appends ;ext= only when an extension is present", () => {
    expect(toTelUri("(555) 123-4567 ext 89")).toBe("tel:5551234567;ext=89");
    expect(toTelUri("+1 555 123 4567")).toBe("tel:+15551234567");
  });

  it("isValidPhone counts only the main number, not the extension", () => {
    // Main number alone is a too-short 6 digits; if the extension were glued on
    // (the old bug) this would wrongly read as a valid 10-digit number.
    expect(isValidPhone("555-123 ext 4567")).toBe(false);
  });
});

describe("escapeWifiField", () => {
  it("escapes backslash first so it doesn't double-escape other characters", () => {
    expect(escapeWifiField("a\\b")).toBe("a\\\\b");
  });

  it("escapes semicolons, commas, quotes, and colons", () => {
    expect(escapeWifiField('a;b,c"d:e')).toBe('a\\;b\\,c\\"d\\:e');
  });
});

describe("isValidUpiVpa", () => {
  it("accepts a normal VPA", () => {
    expect(isValidUpiVpa("jane.doe_1@okbank")).toBe(true);
  });

  it("rejects a VPA missing the @handle, or with a non-letter handle", () => {
    expect(isValidUpiVpa("janedoe")).toBe(false);
    expect(isValidUpiVpa("jane@123")).toBe(false);
    expect(isValidUpiVpa("")).toBe(false);
  });
});

describe("isValidUpiAmount", () => {
  it("treats empty as valid (amount is optional)", () => {
    expect(isValidUpiAmount("")).toBe(true);
  });

  it("accepts a positive amount with up to 2 decimals", () => {
    expect(isValidUpiAmount("100")).toBe(true);
    expect(isValidUpiAmount("100.5")).toBe(true);
    expect(isValidUpiAmount("100.50")).toBe(true);
  });

  it("rejects zero, negative, or more than 2 decimals", () => {
    expect(isValidUpiAmount("0")).toBe(false);
    expect(isValidUpiAmount("-5")).toBe(false);
    expect(isValidUpiAmount("10.999")).toBe(false);
  });
});

describe("exceedsCapacity", () => {
  it("is false for short strings at any level", () => {
    expect(exceedsCapacity("hello", "H")).toBe(false);
  });

  it("is true once the byte length passes the level's rough ceiling", () => {
    expect(exceedsCapacity("x".repeat(1300), "H")).toBe(true);
    expect(exceedsCapacity("x".repeat(1300), "L")).toBe(false);
  });
});
