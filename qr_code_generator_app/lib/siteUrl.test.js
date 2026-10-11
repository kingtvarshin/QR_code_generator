import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("getSiteUrl", () => {
  it("uses NEXT_PUBLIC_SITE_URL when set", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://qrforge.app";
    const { getSiteUrl } = await import("./siteUrl");
    expect(getSiteUrl()).toBe("https://qrforge.app");
  });

  it("falls back to localhost outside of production", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NODE_ENV = "development";
    const { getSiteUrl } = await import("./siteUrl");
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("throws in production when no site URL is configured", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NODE_ENV = "production";
    const { getSiteUrl } = await import("./siteUrl");
    expect(() => getSiteUrl()).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });
});
