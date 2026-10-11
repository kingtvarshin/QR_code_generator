"use client";

import { Select, Option, Typography, Alert } from "@material-tailwind/react";
import { hasLowContrast, hasInvertedColors } from "@/lib/color";
import LogoDropzone from "./LogoDropzone";

const SIZE_OPTIONS = [256, 512, 1024, 2048, 4096];
const EC_LEVEL_OPTIONS = [
  { value: "L", label: "Low (L) — smallest, least recovery" },
  { value: "M", label: "Medium (M) — balanced default" },
  { value: "Q", label: "Quartile (Q)" },
  { value: "H", label: "High (H) — best with a logo" },
];

export default function CustomizationPanel({ options, onOptionChange, logo, onLogoChange }) {
  const lowContrast = hasLowContrast(options.colorDark, options.colorLight);
  const inverted = hasInvertedColors(options.colorDark, options.colorLight);

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
        label="Download size (px)"
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
      {!lowContrast && inverted && (
        <Alert color="amber" variant="ghost">
          Lighter modules on a darker background can fail to scan on some readers.
        </Alert>
      )}

      <LogoDropzone logo={logo} onLogoChange={onLogoChange} />
    </div>
  );
}
