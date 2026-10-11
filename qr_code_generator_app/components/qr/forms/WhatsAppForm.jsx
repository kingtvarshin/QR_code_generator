"use client";

import FieldError from "./FieldError";
import { inputClass, labelClass } from "./styles";

export default function WhatsAppForm({ fields, errors, onFieldChange, hint }) {
  return (
    <div className="w-72 flex flex-col gap-3">
      <div>
        <label htmlFor="whatsapp-phone" className={labelClass}>
          Phone number (with country code)
        </label>
        <input
          id="whatsapp-phone"
          className={inputClass(Boolean(errors.phone))}
          value={fields.phone}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "whatsapp-phone-error" : hint ? "whatsapp-phone-hint" : undefined}
          onChange={(e) => onFieldChange("phone", e.target.value)}
          placeholder="+1 555 123 4567"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
        />
        <FieldError id="whatsapp-phone-error" message={errors.phone} />
        {!errors.phone && hint && (
          <p id="whatsapp-phone-hint" className="mt-1 text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="whatsapp-message" className={labelClass}>
          Message (optional)
        </label>
        <textarea
          id="whatsapp-message"
          className={inputClass(false)}
          value={fields.message}
          onChange={(e) => onFieldChange("message", e.target.value)}
        />
      </div>
    </div>
  );
}
