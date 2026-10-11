"use client";

import FieldError from "./FieldError";
import { inputClass, labelClass } from "./styles";

export default function EmailForm({ fields, errors, onFieldChange }) {
  return (
    <div className="w-72 flex flex-col gap-3">
      <div>
        <label htmlFor="email-email" className={labelClass}>
          Email address
        </label>
        <input
          id="email-email"
          className={inputClass(Boolean(errors.email))}
          value={fields.email}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-email-error" : undefined}
          onChange={(e) => onFieldChange("email", e.target.value)}
          placeholder="name@example.com"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
        />
        <FieldError id="email-email-error" message={errors.email} />
      </div>
      <div>
        <label htmlFor="email-subject" className={labelClass}>
          Subject (optional)
        </label>
        <input
          id="email-subject"
          className={inputClass(false)}
          value={fields.subject}
          onChange={(e) => onFieldChange("subject", e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="email-body" className={labelClass}>
          Body (optional)
        </label>
        <textarea
          id="email-body"
          className={inputClass(false)}
          value={fields.body}
          onChange={(e) => onFieldChange("body", e.target.value)}
        />
      </div>
    </div>
  );
}
