import {
  escapeVCardField,
  escapeWifiField,
  isNonEmpty,
  isValidEmail,
  isValidPhone,
  isValidUpiAmount,
  isValidUpiVpa,
  looksLikeUrl,
  normalizePhoneDigits,
  normalizeUrl,
  toTelUri,
} from "./validators";

// Each entry: { id, label, defaultFields, encode(fields) -> string, validate(fields) -> { [field]: message } }
export const qrTypes = {
  url: {
    id: "url",
    label: "URL",
    defaultFields: { url: "" },
    validate(fields) {
      const errors = {};
      if (!isNonEmpty(fields.url)) errors.url = "Enter a URL.";
      else if (!looksLikeUrl(fields.url)) errors.url = "Enter a valid URL, e.g. example.com";
      return errors;
    },
    encode(fields) {
      return normalizeUrl(fields.url.trim());
    },
    summary(fields) {
      return fields.url;
    },
  },

  text: {
    id: "text",
    label: "Text",
    defaultFields: { text: "" },
    validate(fields) {
      const errors = {};
      if (!isNonEmpty(fields.text)) errors.text = "Enter some text.";
      return errors;
    },
    encode(fields) {
      return fields.text;
    },
    summary(fields) {
      return fields.text;
    },
  },

  phone: {
    id: "phone",
    label: "Phone",
    defaultFields: { phone: "" },
    validate(fields) {
      const errors = {};
      if (!isNonEmpty(fields.phone)) errors.phone = "Enter a phone number.";
      else if (!isValidPhone(fields.phone)) errors.phone = "Enter a valid phone number.";
      return errors;
    },
    encode(fields) {
      return toTelUri(fields.phone);
    },
    summary(fields) {
      return fields.phone;
    },
  },

  sms: {
    id: "sms",
    label: "SMS",
    defaultFields: { phone: "", message: "" },
    validate(fields) {
      const errors = {};
      if (!isNonEmpty(fields.phone)) errors.phone = "Enter a phone number.";
      else if (!isValidPhone(fields.phone)) errors.phone = "Enter a valid phone number.";
      return errors;
    },
    encode(fields) {
      // SMSTO: (an Android convention, not a registered URI scheme) is read correctly
      // by more scanners across iOS and Android than "sms:...?body=", which has had
      // inconsistent "?" vs "&" handling across iOS versions.
      const phone = normalizePhoneDigits(fields.phone);
      return `SMSTO:${phone}:${fields.message || ""}`;
    },
    summary(fields) {
      return fields.phone;
    },
  },

  email: {
    id: "email",
    label: "Email",
    defaultFields: { email: "", subject: "", body: "" },
    validate(fields) {
      const errors = {};
      if (!isNonEmpty(fields.email)) errors.email = "Enter an email address.";
      else if (!isValidEmail(fields.email)) errors.email = "Enter a valid email address.";
      return errors;
    },
    encode(fields) {
      // RFC 6068 mailto: query values are percent-encoded (%20 for space), not the
      // HTML form-encoding that URLSearchParams produces (+ for space) — mail clients
      // render a literal "+" in the subject/body otherwise.
      const params = [];
      if (isNonEmpty(fields.subject)) params.push(`subject=${encodeURIComponent(fields.subject)}`);
      if (isNonEmpty(fields.body)) {
        params.push(`body=${encodeURIComponent(fields.body.replace(/\r?\n/g, "\r\n"))}`);
      }
      const query = params.join("&");
      return `mailto:${fields.email.trim()}${query ? `?${query}` : ""}`;
    },
    summary(fields) {
      return fields.email;
    },
  },

  wifi: {
    id: "wifi",
    label: "WiFi",
    defaultFields: { ssid: "", password: "", security: "WPA", hidden: false, rememberPassword: false },
    validate(fields) {
      const errors = {};
      if (!isNonEmpty(fields.ssid)) errors.ssid = "Enter a network name (SSID).";
      if (fields.security !== "nopass" && !isNonEmpty(fields.password)) {
        errors.password = "Enter a password, or choose No password.";
      }
      return errors;
    },
    encode(fields) {
      const ssid = escapeWifiField(fields.ssid);
      const security = fields.security === "nopass" ? "nopass" : fields.security;
      const password = security === "nopass" ? "" : escapeWifiField(fields.password);
      const hidden = fields.hidden ? "true" : "false";
      return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden};;`;
    },
    summary(fields) {
      return fields.ssid;
    },
  },

  vcard: {
    id: "vcard",
    label: "Contact",
    defaultFields: {
      firstName: "",
      lastName: "",
      org: "",
      title: "",
      phone: "",
      email: "",
      url: "",
      address: "",
    },
    validate(fields) {
      const errors = {};
      if (!isNonEmpty(fields.firstName) && !isNonEmpty(fields.lastName)) {
        errors.firstName = "Enter at least a first or last name.";
      }
      if (isNonEmpty(fields.email) && !isValidEmail(fields.email)) {
        errors.email = "Enter a valid email address.";
      }
      if (isNonEmpty(fields.phone) && !isValidPhone(fields.phone)) {
        errors.phone = "Enter a valid phone number.";
      }
      return errors;
    },
    encode(fields) {
      const esc = escapeVCardField;
      const lines = ["BEGIN:VCARD", "VERSION:3.0"];
      lines.push(`N:${esc(fields.lastName)};${esc(fields.firstName)};;;`);
      const fullName = [fields.firstName, fields.lastName].filter(isNonEmpty).join(" ");
      lines.push(`FN:${esc(fullName)}`);
      if (isNonEmpty(fields.org)) lines.push(`ORG:${esc(fields.org)}`);
      if (isNonEmpty(fields.title)) lines.push(`TITLE:${esc(fields.title)}`);
      if (isNonEmpty(fields.phone)) lines.push(`TEL;TYPE=CELL:${normalizePhoneDigits(fields.phone) || fields.phone}`);
      if (isNonEmpty(fields.email)) lines.push(`EMAIL;TYPE=INTERNET:${fields.email.trim()}`);
      if (isNonEmpty(fields.url)) lines.push(`URL:${normalizeUrl(fields.url)}`);
      if (isNonEmpty(fields.address)) lines.push(`ADR;TYPE=WORK:;;${esc(fields.address)};;;;`);
      lines.push("END:VCARD");
      return lines.join("\r\n");
    },
    summary(fields) {
      return [fields.firstName, fields.lastName].filter(isNonEmpty).join(" ");
    },
  },

  whatsapp: {
    id: "whatsapp",
    label: "WhatsApp",
    defaultFields: { phone: "", message: "" },
    validate(fields) {
      const errors = {};
      if (!isNonEmpty(fields.phone)) errors.phone = "Enter a phone number with country code.";
      else if (!isValidPhone(fields.phone)) errors.phone = "Enter a valid phone number.";
      return errors;
    },
    encode(fields) {
      // wa.me takes bare digits (no "+", no formatting) — the leading country
      // code is still required, just not visually marked in the output.
      const digits = normalizePhoneDigits(fields.phone).replace("+", "");
      const query = isNonEmpty(fields.message) ? `?text=${encodeURIComponent(fields.message)}` : "";
      return `https://wa.me/${digits}${query}`;
    },
    summary(fields) {
      return fields.phone;
    },
  },

  upi: {
    id: "upi",
    label: "UPI Payment",
    defaultFields: { vpa: "", payeeName: "", amount: "", note: "" },
    validate(fields) {
      const errors = {};
      if (!isNonEmpty(fields.vpa)) errors.vpa = "Enter a UPI ID (VPA).";
      else if (!isValidUpiVpa(fields.vpa)) errors.vpa = "Enter a valid UPI ID, e.g. name@bank";
      if (!isNonEmpty(fields.payeeName)) errors.payeeName = "Enter the payee name.";
      if (!isValidUpiAmount(fields.amount)) errors.amount = "Enter a valid amount (up to 2 decimals).";
      if (isNonEmpty(fields.note) && fields.note.length > 80) {
        errors.note = "Note must be 80 characters or fewer.";
      }
      return errors;
    },
    encode(fields) {
      // Params left out entirely when empty, rather than sent as pa=&pn=&... —
      // some UPI apps choke on empty query values instead of ignoring them.
      const params = [`pa=${fields.vpa.trim()}`, `pn=${encodeURIComponent(fields.payeeName.trim())}`];
      if (isNonEmpty(fields.amount)) params.push(`am=${fields.amount.trim()}`);
      params.push("cu=INR");
      if (isNonEmpty(fields.note)) params.push(`tn=${encodeURIComponent(fields.note.trim())}`);
      return `upi://pay?${params.join("&")}`;
    },
    summary(fields) {
      return fields.payeeName || fields.vpa;
    },
  },
};

export const qrTypeOrder = ["url", "text", "phone", "sms", "email", "wifi", "vcard", "whatsapp", "upi"];

export function getDefaultFieldsByType() {
  return qrTypeOrder.reduce((acc, id) => {
    acc[id] = { ...qrTypes[id].defaultFields };
    return acc;
  }, {});
}
