"use client";

import { useEffect, useRef } from "react";
import { Select, Option, Typography, Alert, Button } from "@material-tailwind/react";
import { hasLowContrast } from "@/lib/color";

const SIZE_OPTIONS = [128, 240, 256, 512, 1024];
const EC_LEVEL_OPTIONS = [
  { value: "L", label: "Low (L) — smallest, least recovery" },
  { value: "M", label: "Medium (M) — balanced default" },
  { value: "Q", label: "Quartile (Q)" },
  { value: "H", label: "High (H) — best with a logo" },
];

export default function CustomizationPanel({ options, onOptionChange, logo, onLogoChange }) {
  const fileInputRef = useRef(null);
  const lowContrast = hasLowContrast(options.colorDark, options.colorLight);

  // Covers not just the "Remove logo" click below but also an external clear —
  // e.g. restoring a history item that has no logo — so re-selecting the same
  // file afterward still fires a change event instead of being a no-op.
  useEffect(() => {
    if (!logo && fileInputRef.current) fileInputRef.current.value = "";
  }, [logo]);

  function handleLogoFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onLogoChange({ dataUrl: reader.result, widthRatio: 0.22 });
    reader.readAsDataURL(file);
  }

  return (
    <div className="w-72 flex flex-col gap-4">
      <Typography as="h2" variant="h6" color="blue-gray">
        Customize
      </Typography>

      <Select
        label="Error correction level"
        value={options.errorCorrectionLevel}
        onChange={(value) => onOptionChange("errorCorrectionLevel", value)}
      >
        {EC_LEVEL_OPTIONS.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            {opt.label}
          </Option>
        ))}
      </Select>

      <Select
        label="Size (px)"
        value={String(options.width)}
        onChange={(value) => onOptionChange("width", Number(value))}
      >
        {SIZE_OPTIONS.map((size) => (
          <Option key={size} value={String(size)}>
            {size}px
          </Option>
        ))}
      </Select>

      <div>
        <label htmlFor="margin" className="text-sm text-blue-gray-700">
          Margin: {options.margin}
        </label>
        <input
          id="margin"
          type="range"
          min={0}
          max={10}
          value={options.margin}
          onChange={(e) => onOptionChange("margin", Number(e.target.value))}
          className="w-full block"
        />
      </div>

      <div className="flex gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Foreground
          <input
            type="color"
            value={options.colorDark}
            onChange={(e) => onOptionChange("colorDark", e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Background
          <input
            type="color"
            value={options.colorLight}
            onChange={(e) => onOptionChange("colorLight", e.target.value)}
          />
        </label>
      </div>

      {lowContrast && (
        <Alert color="amber" variant="ghost">
          These colors are low contrast and may be hard for scanners to read.
        </Alert>
      )}

      <div>
        <label htmlFor="logo" className="block mb-1 text-sm text-blue-gray-700">
          Logo (optional)
        </label>
        <input
          id="logo"
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={handleLogoFile}
          className="text-sm"
        />
        {logo && (
          <Button
            size="sm"
            variant="text"
            color="red"
            className="mt-1"
            onClick={() => onLogoChange(null)}
          >
            Remove logo
          </Button>
        )}
      </div>
    </div>
  );
}
