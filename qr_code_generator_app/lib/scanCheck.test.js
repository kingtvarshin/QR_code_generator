import { beforeEach, describe, expect, it, vi } from "vitest";
import QRCode from "qrcode";

let mockDecoded;

vi.mock("./qrExport", () => ({
  renderQrCanvas: vi.fn(async (text, options) => ({
    width: options.width,
    height: options.width,
    getContext: () => ({
      getImageData: () => ({ data: new Uint8ClampedArray(4), width: options.width, height: options.width }),
    }),
  })),
}));

const REJECT_JSQR = Symbol("reject-jsqr");

vi.mock("jsqr", () => ({
  default: vi.fn(() => {
    if (mockDecoded === REJECT_JSQR) throw new Error("chunk failed to load");
    return mockDecoded === null ? null : { data: mockDecoded };
  }),
}));

const { renderQrCanvas } = await import("./qrExport");
const { checkScannable } = await import("./scanCheck");

const baseOptions = { errorCorrectionLevel: "M", margin: 4, colorDark: "#000000", colorLight: "#ffffff" };

beforeEach(() => {
  mockDecoded = undefined;
  renderQrCanvas.mockClear();
});

describe("checkScannable", () => {
  it("returns null when there's no text to check", async () => {
    expect(await checkScannable("", baseOptions)).toBeNull();
  });

  it("reports ok when the decoded payload matches what was encoded", async () => {
    mockDecoded = "https://example.com";
    const result = await checkScannable("https://example.com", baseOptions);
    expect(result).toEqual({ ok: true, reason: null });
  });

  it("sizes the render off the actual module count, not a fixed width, so dense payloads at a low EC level still decode", async () => {
    const longText = "x".repeat(1500);
    mockDecoded = longText;
    const options = { ...baseOptions, errorCorrectionLevel: "L" };
    const result = await checkScannable(longText, options);

    expect(result).toEqual({ ok: true, reason: null });
    const { size: moduleCount } = QRCode.create(longText, { errorCorrectionLevel: "L" }).modules;
    const [, renderOptions] = renderQrCanvas.mock.calls[0];
    expect(renderOptions.width).toBeGreaterThanOrEqual((moduleCount + options.margin * 2) * 4);
  });

  it("flags inverted colors even when the payload decodes correctly", async () => {
    mockDecoded = "hello";
    const result = await checkScannable("hello", { ...baseOptions, colorDark: "#ffffff", colorLight: "#000000" });
    expect(result).toEqual({ ok: false, reason: "inverted" });
  });

  it("blames the logo when a logo is present and the payload doesn't decode back correctly", async () => {
    mockDecoded = "garbage";
    const result = await checkScannable("hello", baseOptions, { dataUrl: "data:image/png;base64,abc" });
    expect(result).toEqual({ ok: false, reason: "logo" });
  });

  it("reports a generic unreadable reason with no logo", async () => {
    mockDecoded = null;
    const result = await checkScannable("hello", baseOptions);
    expect(result).toEqual({ ok: false, reason: "unreadable" });
  });

  it("reports ok: null, reason: unavailable when jsQR itself fails to load/run, instead of throwing or looking like a scan failure", async () => {
    mockDecoded = REJECT_JSQR;
    const result = await checkScannable("hello", baseOptions);
    expect(result).toEqual({ ok: null, reason: "unavailable" });
  });
});
