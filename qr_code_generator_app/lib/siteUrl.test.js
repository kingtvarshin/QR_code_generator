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

  it("DEPLOY=1 rejects a localhost/127.0.0.1 site URL even though it's set", async () => {
    process.env.DEPLOY = "1";
    const { getSiteUrl } = await import("./siteUrl");
    for (const url of ["http://localhost:4000", "https://localhost", "http://127.0.0.1:3000"]) {
      process.env.NEXT_PUBLIC_SITE_URL = url;
      expect(() => getSiteUrl()).toThrow(/refusing to build for deploy/);
    }
  });

  it("DEPLOY=1 allows a real public URL", async () => {
    process.env.DEPLOY = "1";
    process.env.NEXT_PUBLIC_SITE_URL = "https://qrforge.app";
    const { getSiteUrl } = await import("./siteUrl");
    expect(getSiteUrl()).toBe("https://qrforge.app");
  });

  it("without DEPLOY=1, a localhost site URL is still accepted (e.g. npm run preview)", async () => {
    delete process.env.DEPLOY;
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:4000";
    const { getSiteUrl } = await import("./siteUrl");
    expect(getSiteUrl()).toBe("http://localhost:4000");
  });
});
