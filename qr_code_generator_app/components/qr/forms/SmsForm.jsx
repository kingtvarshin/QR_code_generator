"use client";

import FieldError from "./FieldError";
import { inputClass, labelClass } from "./styles";

export default function SmsForm({ fields, errors, onFieldChange }) {
  return (
    <div className="w-full flex flex-col gap-3">
      <div>
        <label htmlFor="sms-phone" className={labelClass}>
          Phone number
        </label>
        <input
          id="sms-phone"
          className={inputClass(Boolean(errors.phone))}
          value={fields.phone}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "sms-phone-error" : undefined}
          onChange={(e) => onFieldChange("phone", e.target.value)}
          placeholder="+1 555 123 4567"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
        />
        <FieldError id="sms-phone-error" message={errors.phone} />
      </div>
      <div>
        <label htmlFor="sms-message" className={labelClass}>
          Message (optional)
        </label>
        <textarea
          id="sms-message"
          className={inputClass(false)}
          value={fields.message}
          onChange={(e) => onFieldChange("message", e.target.value)}
        />
      </div>
    </div>
  );
}
