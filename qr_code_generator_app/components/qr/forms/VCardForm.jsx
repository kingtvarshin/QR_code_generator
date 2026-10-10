"use client";

import { Input } from "@material-tailwind/react";
import FieldError from "./FieldError";

export default function VCardForm({ fields, errors, onFieldChange }) {
  return (
    <div className="w-72 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="min-w-0">
          <Input
            id="vcard-firstName"
            label="First name"
            color="blue"
            value={fields.firstName}
            error={Boolean(errors.firstName)}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? "vcard-firstName-error" : undefined}
            onChange={(e) => onFieldChange("firstName", e.target.value)}
            autoComplete="given-name"
            labelProps={{ htmlFor: "vcard-firstName" }}
          />
          <FieldError id="vcard-firstName-error" message={errors.firstName} />
        </div>
        <Input
          id="vcard-lastName"
          label="Last name"
          color="blue"
          value={fields.lastName}
          onChange={(e) => onFieldChange("lastName", e.target.value)}
          autoComplete="family-name"
          labelProps={{ htmlFor: "vcard-lastName" }}
          containerProps={{ className: "min-w-0" }}
        />
      </div>
      <Input
        id="vcard-org"
        label="Organization (optional)"
        color="blue"
        value={fields.org}
        onChange={(e) => onFieldChange("org", e.target.value)}
        autoComplete="organization"
        labelProps={{ htmlFor: "vcard-org" }}
      />
      <Input
        id="vcard-title"
        label="Job title (optional)"
        color="blue"
        value={fields.title}
        onChange={(e) => onFieldChange("title", e.target.value)}
        autoComplete="organization-title"
        labelProps={{ htmlFor: "vcard-title" }}
      />
      <div>
        <Input
          id="vcard-phone"
          label="Phone (optional)"
          color="blue"
          value={fields.phone}
          error={Boolean(errors.phone)}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "vcard-phone-error" : undefined}
          onChange={(e) => onFieldChange("phone", e.target.value)}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          labelProps={{ htmlFor: "vcard-phone" }}
        />
        <FieldError id="vcard-phone-error" message={errors.phone} />
      </div>
      <div>
        <Input
          id="vcard-email"
          label="Email (optional)"
          color="blue"
          value={fields.email}
          error={Boolean(errors.email)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "vcard-email-error" : undefined}
          onChange={(e) => onFieldChange("email", e.target.value)}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          labelProps={{ htmlFor: "vcard-email" }}
        />
        <FieldError id="vcard-email-error" message={errors.email} />
      </div>
      <Input
        id="vcard-url"
        label="Website (optional)"
        color="blue"
        value={fields.url}
        onChange={(e) => onFieldChange("url", e.target.value)}
        type="url"
        inputMode="url"
        autoComplete="url"
        autoCapitalize="off"
        spellCheck={false}
        labelProps={{ htmlFor: "vcard-url" }}
      />
      <Input
        id="vcard-address"
        label="Address (optional)"
        color="blue"
        value={fields.address}
        onChange={(e) => onFieldChange("address", e.target.value)}
        autoComplete="street-address"
        labelProps={{ htmlFor: "vcard-address" }}
      />
    </div>
  );
}
