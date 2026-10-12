"use client";

import FieldError from "./FieldError";
import { inputClass, labelClass } from "./styles";

export default function PhoneForm({ fields, errors, onFieldChange }) {
  return (
    <div className="w-full">
      <label htmlFor="phone-phone" className={labelClass}>
        Phone number
      </label>
      <input
        id="phone-phone"
        className={inputClass(Boolean(errors.phone))}
        value={fields.phone}
        aria-invalid={Boolean(errors.phone)}
        aria-describedby={errors.phone ? "phone-phone-error" : undefined}
        onChange={(e) => onFieldChange("phone", e.target.value)}
        placeholder="+1 555 123 4567"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
      />
      <FieldError id="phone-phone-error" message={errors.phone} />
    </div>
  );
}
