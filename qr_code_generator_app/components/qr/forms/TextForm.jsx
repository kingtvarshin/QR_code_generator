"use client";

import { Textarea } from "@material-tailwind/react";
import FieldError from "./FieldError";

export default function TextForm({ fields, errors, onFieldChange }) {
  // Material Tailwind's Textarea forwards `ref` to its wrapping div, not the
  // underlying <textarea>, so auto-grow here is approximated from line count
  // rather than measuring scrollHeight directly.
  const rows = Math.max(3, Math.min(12, fields.text.split("\n").length + 1));

  return (
    <div className="w-72">
      <Textarea
        id="text-text"
        label="Text"
        color="blue"
        rows={rows}
        value={fields.text}
        error={Boolean(errors.text)}
        aria-invalid={Boolean(errors.text)}
        aria-describedby={errors.text ? "text-text-error" : undefined}
        onChange={(e) => onFieldChange("text", e.target.value)}
        placeholder="Anything you want to encode"
        labelProps={{ htmlFor: "text-text" }}
      />
      <FieldError id="text-text-error" message={errors.text} />
    </div>
  );
}
