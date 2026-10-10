"use client";

import { Input } from "@material-tailwind/react";
import FieldError from "./FieldError";

export default function PhoneForm({ fields, errors, onFieldChange }) {
  return (
    <div className="w-72">
      <Input
        id="phone-phone"
        label="Phone number"
        color="blue"
        value={fields.phone}
        error={Boolean(errors.phone)}
        aria-invalid={Boolean(errors.phone)}
        aria-describedby={errors.phone ? "phone-phone-error" : undefined}
        onChange={(e) => onFieldChange("phone", e.target.value)}
        placeholder="+1 555 123 4567"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        labelProps={{ htmlFor: "phone-phone" }}
      />
      <FieldError id="phone-phone-error" message={errors.phone} />
    </div>
  );
}
