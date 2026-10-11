"use client";

import FieldError from "./FieldError";
import { inputClass, labelClass } from "./styles";

export default function UrlForm({ fields, errors, onFieldChange }) {
  return (
    <div className="w-72">
      <label htmlFor="url-url" className={labelClass}>
        Website URL
      </label>
      <input
        id="url-url"
        className={inputClass(Boolean(errors.url))}
        value={fields.url}
        aria-invalid={Boolean(errors.url)}
        aria-describedby={errors.url ? "url-url-error" : undefined}
        onChange={(e) => onFieldChange("url", e.target.value)}
        placeholder="example.com"
        type="url"
        inputMode="url"
        autoComplete="url"
        autoCapitalize="off"
        spellCheck={false}
      />
      <FieldError id="url-url-error" message={errors.url} />
    </div>
  );
}
