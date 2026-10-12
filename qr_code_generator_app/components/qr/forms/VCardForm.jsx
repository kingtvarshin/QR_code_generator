"use client";

import FieldError from "./FieldError";
import { inputClass, labelClass } from "./styles";

export default function VCardForm({ fields, errors, onFieldChange }) {
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="min-w-0">
          <label htmlFor="vcard-firstName" className={labelClass}>
            First name
          </label>
          <input
            id="vcard-firstName"
            className={inputClass(Boolean(errors.firstName))}
            value={fields.firstName}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? "vcard-firstName-error" : undefined}
            onChange={(e) => onFieldChange("firstName", e.target.value)}
            autoComplete="given-name"
          />
          <FieldError id="vcard-firstName-error" message={errors.firstName} />
        </div>
        <div className="min-w-0">
          <label htmlFor="vcard-lastName" className={labelClass}>
            Last name
          </label>
          <input
            id="vcard-lastName"
            className={inputClass(false)}
            value={fields.lastName}
            onChange={(e) => onFieldChange("lastName", e.target.value)}
            autoComplete="family-name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="vcard-org" className={labelClass}>
          Organization (optional)
        </label>
        <input
          id="vcard-org"
          className={inputClass(false)}
          value={fields.org}
          onChange={(e) => onFieldChange("org", e.target.value)}
          autoComplete="organization"
        />
      </div>

      <div>
        <label htmlFor="vcard-title" className={labelClass}>
          Job title (optional)
        </label>
        <input
          id="vcard-title"
          className={inputClass(false)}
          value={fields.title}
          onChange={(e) => onFieldChange("title", e.target.value)}
          autoComplete="organization-title"
        />
      </div>

      <div>
        <label htmlFor="vcard-phone" className={labelClass}>
          Phone (optional)
        </label>
        <input
          id="vcard-phone"
          className={inputClass(Boolean(errors.phone))}
          value={fields.phone}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "vcard-phone-error" : undefined}
          onChange={(e) => onFieldChange("phone", e.target.value)}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
        />
        <FieldError id="vcard-phone-error" message={errors.phone} />
      </div>

      <div>
        <label htmlFor="vcard-email" className={labelClass}>
          Email (optional)
        </label>
        <input
          id="vcard-email"
          className={inputClass(Boolean(errors.email))}
          value={fields.email}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "vcard-email-error" : undefined}
          onChange={(e) => onFieldChange("email", e.target.value)}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
        />
        <FieldError id="vcard-email-error" message={errors.email} />
      </div>

      <div>
        <label htmlFor="vcard-url" className={labelClass}>
          Website (optional)
        </label>
        <input
          id="vcard-url"
          className={inputClass(false)}
          value={fields.url}
          onChange={(e) => onFieldChange("url", e.target.value)}
          type="url"
          inputMode="url"
          autoComplete="url"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>

      <div>
        <label htmlFor="vcard-address" className={labelClass}>
          Address (optional)
        </label>
        <input
          id="vcard-address"
          className={inputClass(false)}
          value={fields.address}
          onChange={(e) => onFieldChange("address", e.target.value)}
          autoComplete="street-address"
        />
      </div>
    </div>
  );
}
