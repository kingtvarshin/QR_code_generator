import { describe, expect, it } from "vitest";
import { qrTypes } from "./qrTypes";

describe("url", () => {
  it("prepends https:// when no scheme is given", () => {
    expect(qrTypes.url.encode({ url: "example.com" })).toBe("https://example.com");
  });

  it("keeps an explicit scheme as-is", () => {
    expect(qrTypes.url.encode({ url: "http://example.com" })).toBe("http://example.com");
  });

  it("rejects empty input", () => {
    expect(qrTypes.url.validate({ url: "" })).toHaveProperty("url");
  });

  it("rejects strings that don't look like a domain", () => {
    expect(qrTypes.url.validate({ url: "not a url" })).toHaveProperty("url");
  });
});

describe("text", () => {
  it("passes through unicode/emoji content unchanged", () => {
    expect(qrTypes.text.encode({ text: "héllo 🎉 world" })).toBe("héllo 🎉 world");
  });
});

describe("phone", () => {
  it("encodes as a tel: URI, stripping formatting", () => {
    expect(qrTypes.phone.encode({ phone: "+1 (555) 123-4567" })).toBe("tel:+15551234567");
  });

  it("encodes a trailing extension as ;ext= instead of gluing it to the number", () => {
    expect(qrTypes.phone.encode({ phone: "(555) 123-4567 ext 89" })).toBe("tel:5551234567;ext=89");
  });

  it("rejects too-short numbers", () => {
    expect(qrTypes.phone.validate({ phone: "123" })).toHaveProperty("phone");
  });
});

describe("sms", () => {
  it("encodes as SMSTO:<phone>: with an empty message", () => {
    expect(qrTypes.sms.encode({ phone: "+15551234567", message: "" })).toBe("SMSTO:+15551234567:");
  });

  it("appends the message as plain text after the second colon", () => {
    expect(qrTypes.sms.encode({ phone: "+15551234567", message: "hi & bye" })).toBe(
      "SMSTO:+15551234567:hi & bye"
    );
  });
});

describe("email", () => {
  it("encodes a bare mailto: with no params when subject/body are empty", () => {
    expect(qrTypes.email.encode({ email: "a@b.com", subject: "", body: "" })).toBe("mailto:a@b.com");
  });

  it("percent-encodes spaces as %20 per RFC 6068, not form-encoded +", () => {
    expect(qrTypes.email.encode({ email: "a@b.com", subject: "Hi there", body: "Yo" })).toBe(
      "mailto:a@b.com?subject=Hi%20there&body=Yo"
    );
  });

  it("percent-encodes & and % in subject/body", () => {
    expect(
      qrTypes.email.encode({ email: "a@b.com", subject: "Hello world & more", body: "Line one\nLine two 100%" })
    ).toBe("mailto:a@b.com?subject=Hello%20world%20%26%20more&body=Line%20one%0D%0ALine%20two%20100%25");
  });

  it("rejects malformed addresses", () => {
    expect(qrTypes.email.validate({ email: "not-an-email" })).toHaveProperty("email");
  });
});

describe("wifi", () => {
  it("encodes a WPA network", () => {
    expect(qrTypes.wifi.encode({ ssid: "MyWifi", password: "secret1", security: "WPA", hidden: false })).toBe(
      "WIFI:T:WPA;S:MyWifi;P:secret1;H:false;;"
    );
  });

  it("escapes special characters in SSID and password", () => {
    expect(
      qrTypes.wifi.encode({ ssid: 'a;b,c"d\\e:f', password: "", security: "nopass", hidden: false })
    ).toBe('WIFI:T:nopass;S:a\\;b\\,c\\"d\\\\e\\:f;P:;H:false;;');
  });

  it("marks hidden networks", () => {
    expect(qrTypes.wifi.encode({ ssid: "s", password: "", security: "nopass", hidden: true })).toContain(
      "H:true"
    );
  });

  it("requires a password unless security is nopass", () => {
    expect(qrTypes.wifi.validate({ ssid: "s", password: "", security: "WPA" })).toHaveProperty(
      "password"
    );
    expect(qrTypes.wifi.validate({ ssid: "s", password: "", security: "nopass" })).not.toHaveProperty(
      "password"
    );
  });
});

describe("vcard", () => {
  it("uses CRLF line endings and required BEGIN/END markers", () => {
    const encoded = qrTypes.vcard.encode({ firstName: "Ada", lastName: "Lovelace" });
    expect(encoded.startsWith("BEGIN:VCARD\r\nVERSION:3.0\r\n")).toBe(true);
    expect(encoded.endsWith("END:VCARD")).toBe(true);
    expect(encoded).toContain("N:Lovelace;Ada;;;");
    expect(encoded).toContain("FN:Ada Lovelace");
  });

  it("requires at least a first or last name", () => {
    expect(qrTypes.vcard.validate({ firstName: "", lastName: "" })).toHaveProperty("firstName");
    expect(qrTypes.vcard.validate({ firstName: "Ada", lastName: "" })).not.toHaveProperty("firstName");
  });

  it("omits optional fields when absent", () => {
    const encoded = qrTypes.vcard.encode({ firstName: "Ada", lastName: "" });
    expect(encoded).not.toContain("ORG:");
    expect(encoded).not.toContain("TEL;TYPE=CELL:");
  });

  it("adds TYPE params to TEL/EMAIL/ADR and normalizes the URL", () => {
    const encoded = qrTypes.vcard.encode({
      firstName: "Ada",
      lastName: "Lovelace",
      phone: "+1 555 123 4567",
      email: "ada@example.com",
      url: "example.com",
      address: "123 Main St",
    });
    expect(encoded).toContain("TEL;TYPE=CELL:+15551234567");
    expect(encoded).toContain("EMAIL;TYPE=INTERNET:ada@example.com");
    expect(encoded).toContain("URL:https://example.com");
    expect(encoded).toContain("ADR;TYPE=WORK:;;123 Main St;;;;");
  });

  it("escapes commas, semicolons, and newlines in ORG (and other fields)", () => {
    const encoded = qrTypes.vcard.encode({ firstName: "Ada", lastName: "", org: "Acme, Inc.; R&D" });
    expect(encoded).toContain("ORG:Acme\\, Inc.\\; R&D");
  });
});
