"use client";

import FieldError from "./FieldError";
import { inputClass, labelClass } from "./styles";

export default function TextForm({ fields, errors, onFieldChange }) {
  const rows = Math.max(3, Math.min(12, fields.text.split("\n").length + 1));

  return (
    <div className="w-full">
      <label htmlFor="text-text" className={labelClass}>
        Text
      </label>
      <textarea
        id="text-text"
        className={inputClass(Boolean(errors.text))}
        rows={rows}
        value={fields.text}
        aria-invalid={Boolean(errors.text)}
        aria-describedby={errors.text ? "text-text-error" : undefined}
        onChange={(e) => onFieldChange("text", e.target.value)}
        placeholder="Anything you want to encode"
      />
      <FieldError id="text-text-error" message={errors.text} />
    </div>
  );
}
