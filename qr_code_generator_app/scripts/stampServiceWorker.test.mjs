import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { stampServiceWorker } from "./stampServiceWorker.mjs";

let dir;

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "sw-stamp-test-"));
  writeFileSync(
    path.join(dir, "template.js"),
    'const CACHE_NAME = "qr-forge-__CACHE_VERSION__";\nconst PRECACHE_URLS = __PRECACHE_URLS__;\n'
  );
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("stampServiceWorker", () => {
  it("replaces the version placeholder with the given version", () => {
    stampServiceWorker({
      templatePath: path.join(dir, "template.js"),
      outputPath: path.join(dir, "sw.js"),
      version: "abc123",
      precacheUrls: ["/"],
    });
    const output = readFileSync(path.join(dir, "sw.js"), "utf8");
    expect(output).toContain('"qr-forge-abc123"');
    expect(output).not.toContain("__CACHE_VERSION__");
  });

  it("produces a different cache name for a different version — this is the whole point", () => {
    const outputPath = path.join(dir, "sw.js");
    stampServiceWorker({ templatePath: path.join(dir, "template.js"), outputPath, version: "build-1", precacheUrls: ["/"] });
    const first = readFileSync(outputPath, "utf8");
    stampServiceWorker({ templatePath: path.join(dir, "template.js"), outputPath, version: "build-2", precacheUrls: ["/"] });
    const second = readFileSync(outputPath, "utf8");
    expect(first).not.toBe(second);
    expect(first).toContain("qr-forge-build-1");
    expect(second).toContain("qr-forge-build-2");
  });

  it("embeds the precache URL list as a JSON array, defaulting to empty when omitted", () => {
    const outputPath = path.join(dir, "sw.js");
    stampServiceWorker({
      templatePath: path.join(dir, "template.js"),
      outputPath,
      version: "abc123",
      precacheUrls: ["/", "/_next/static/chunks/a.js", "/_next/static/chunks/b.css"],
    });
    const output = readFileSync(outputPath, "utf8");
    expect(output).toContain('["/","/_next/static/chunks/a.js","/_next/static/chunks/b.css"]');
    expect(output).not.toContain("__PRECACHE_URLS__");

    stampServiceWorker({ templatePath: path.join(dir, "template.js"), outputPath, version: "abc123" });
    expect(readFileSync(outputPath, "utf8")).toContain("const PRECACHE_URLS = [];");
  });

  it("throws if the template is missing the version placeholder, instead of silently shipping an unversioned worker", () => {
    writeFileSync(path.join(dir, "no-placeholder.js"), "const PRECACHE_URLS = __PRECACHE_URLS__;\n");
    expect(() =>
      stampServiceWorker({
        templatePath: path.join(dir, "no-placeholder.js"),
        outputPath: path.join(dir, "sw.js"),
        version: "abc123",
      })
    ).toThrow(/__CACHE_VERSION__/);
  });

  it("throws if the template is missing the precache placeholder, instead of silently shipping an empty precache list", () => {
    writeFileSync(path.join(dir, "no-placeholder.js"), 'const CACHE_NAME = "qr-forge-__CACHE_VERSION__";\n');
    expect(() =>
      stampServiceWorker({
        templatePath: path.join(dir, "no-placeholder.js"),
        outputPath: path.join(dir, "sw.js"),
        version: "abc123",
      })
    ).toThrow(/__PRECACHE_URLS__/);
  });
});
