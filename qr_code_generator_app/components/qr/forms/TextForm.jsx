"use client";

import { Textarea } from "@material-tailwind/react";
import FieldError from "./FieldError";

export default function TextForm({ fields, errors, onFieldChange }) {
  return (
    <div className="w-72">
      <Textarea
        id="text-text"
        label="Text"
        color="blue"
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
