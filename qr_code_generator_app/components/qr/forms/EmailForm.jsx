"use client";

import { Input, Textarea } from "@material-tailwind/react";
import FieldError from "./FieldError";

export default function EmailForm({ fields, errors, onFieldChange }) {
  return (
    <div className="w-72 flex flex-col gap-3">
      <div>
        <Input
          id="email-email"
          label="Email address"
          color="blue"
          value={fields.email}
          error={Boolean(errors.email)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-email-error" : undefined}
          onChange={(e) => onFieldChange("email", e.target.value)}
          placeholder="name@example.com"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          labelProps={{ htmlFor: "email-email" }}
        />
        <FieldError id="email-email-error" message={errors.email} />
      </div>
      <Input
        id="email-subject"
        label="Subject (optional)"
        color="blue"
        value={fields.subject}
        onChange={(e) => onFieldChange("subject", e.target.value)}
        labelProps={{ htmlFor: "email-subject" }}
      />
      <Textarea
        id="email-body"
        label="Body (optional)"
        color="blue"
        value={fields.body}
        onChange={(e) => onFieldChange("body", e.target.value)}
        labelProps={{ htmlFor: "email-body" }}
      />
    </div>
  );
}
