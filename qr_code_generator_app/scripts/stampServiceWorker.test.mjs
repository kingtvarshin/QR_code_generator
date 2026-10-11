import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { stampServiceWorker } from "./stampServiceWorker.mjs";

let dir;

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "sw-stamp-test-"));
  writeFileSync(path.join(dir, "template.js"), 'const CACHE_NAME = "qr-forge-__CACHE_VERSION__";\n');
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("stampServiceWorker", () => {
  it("replaces the placeholder with the given version", () => {
    stampServiceWorker({
      templatePath: path.join(dir, "template.js"),
      outputPath: path.join(dir, "sw.js"),
      version: "abc123",
    });
    const output = readFileSync(path.join(dir, "sw.js"), "utf8");
    expect(output).toContain('"qr-forge-abc123"');
    expect(output).not.toContain("__CACHE_VERSION__");
  });

  it("produces a different cache name for a different version — this is the whole point", () => {
    const outputPath = path.join(dir, "sw.js");
    stampServiceWorker({ templatePath: path.join(dir, "template.js"), outputPath, version: "build-1" });
    const first = readFileSync(outputPath, "utf8");
    stampServiceWorker({ templatePath: path.join(dir, "template.js"), outputPath, version: "build-2" });
    const second = readFileSync(outputPath, "utf8");
    expect(first).not.toBe(second);
    expect(first).toContain("qr-forge-build-1");
    expect(second).toContain("qr-forge-build-2");
  });

  it("throws if the template is missing the placeholder, instead of silently shipping an unversioned worker", () => {
    writeFileSync(path.join(dir, "no-placeholder.js"), "const x = 1;\n");
    expect(() =>
      stampServiceWorker({
        templatePath: path.join(dir, "no-placeholder.js"),
        outputPath: path.join(dir, "sw.js"),
        version: "abc123",
      })
    ).toThrow(/placeholder/);
  });
});
