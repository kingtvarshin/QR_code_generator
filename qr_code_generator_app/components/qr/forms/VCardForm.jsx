"use client";

import { Input } from "@material-tailwind/react";
import FieldError from "./FieldError";

export default function VCardForm({ fields, errors, onFieldChange }) {
  return (
    <div className="w-72 flex flex-col gap-3">
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            label="First name"
            color="blue"
            value={fields.firstName}
            error={Boolean(errors.firstName)}
            onChange={(e) => onFieldChange("firstName", e.target.value)}
          />
          <FieldError message={errors.firstName} />
        </div>
        <Input
          label="Last name"
          color="blue"
          value={fields.lastName}
          onChange={(e) => onFieldChange("lastName", e.target.value)}
        />
      </div>
      <Input
        label="Organization (optional)"
        color="blue"
        value={fields.org}
        onChange={(e) => onFieldChange("org", e.target.value)}
      />
      <Input
        label="Job title (optional)"
        color="blue"
        value={fields.title}
        onChange={(e) => onFieldChange("title", e.target.value)}
      />
      <div>
        <Input
          label="Phone (optional)"
          color="blue"
          value={fields.phone}
          error={Boolean(errors.phone)}
          onChange={(e) => onFieldChange("phone", e.target.value)}
        />
        <FieldError message={errors.phone} />
      </div>
      <div>
        <Input
          label="Email (optional)"
          color="blue"
          value={fields.email}
          error={Boolean(errors.email)}
          onChange={(e) => onFieldChange("email", e.target.value)}
        />
        <FieldError message={errors.email} />
      </div>
      <Input
        label="Website (optional)"
        color="blue"
        value={fields.url}
        onChange={(e) => onFieldChange("url", e.target.value)}
      />
      <Input
        label="Address (optional)"
        color="blue"
        value={fields.address}
        onChange={(e) => onFieldChange("address", e.target.value)}
      />
    </div>
  );
}
