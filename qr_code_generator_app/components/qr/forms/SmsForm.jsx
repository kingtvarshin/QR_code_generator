"use client";

import { Input, Textarea } from "@material-tailwind/react";
import FieldError from "./FieldError";

export default function SmsForm({ fields, errors, onFieldChange }) {
  return (
    <div className="w-72 flex flex-col gap-3">
      <div>
        <Input
          id="sms-phone"
          label="Phone number"
          color="blue"
          value={fields.phone}
          error={Boolean(errors.phone)}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "sms-phone-error" : undefined}
          onChange={(e) => onFieldChange("phone", e.target.value)}
          placeholder="+1 555 123 4567"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          labelProps={{ htmlFor: "sms-phone" }}
        />
        <FieldError id="sms-phone-error" message={errors.phone} />
      </div>
      <div>
        <Textarea
          id="sms-message"
          label="Message (optional)"
          color="blue"
          value={fields.message}
          onChange={(e) => onFieldChange("message", e.target.value)}
          labelProps={{ htmlFor: "sms-message" }}
        />
      </div>
    </div>
  );
}
