"use client";

import { Input } from "@material-tailwind/react";
import FieldError from "./FieldError";

export default function UrlForm({ fields, errors, onFieldChange }) {
  return (
    <div className="w-72">
      <Input
        id="url-url"
        label="Website URL"
        color="blue"
        value={fields.url}
        error={Boolean(errors.url)}
        aria-invalid={Boolean(errors.url)}
        aria-describedby={errors.url ? "url-url-error" : undefined}
        onChange={(e) => onFieldChange("url", e.target.value)}
        placeholder="example.com"
        type="url"
        inputMode="url"
        autoComplete="url"
        autoCapitalize="off"
        spellCheck={false}
        labelProps={{ htmlFor: "url-url" }}
      />
      <FieldError id="url-url-error" message={errors.url} />
    </div>
  );
}
