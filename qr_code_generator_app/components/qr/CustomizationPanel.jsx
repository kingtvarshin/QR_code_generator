"use client";

import { hasLowContrast, hasInvertedColors } from "@/lib/color";
import LogoDropzone from "./LogoDropzone";

const SIZE_OPTIONS = [256, 512, 1024, 2048, 4096];
const EC_LEVEL_OPTIONS = [
  { value: "L", label: "Low (L) — smallest, least recovery" },
  { value: "M", label: "Medium (M) — balanced default" },
  { value: "Q", label: "Quartile (Q)" },
  { value: "H", label: "High (H) — best with a logo" },
];

const selectClassName =
  "w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600";
const labelClassName = "block mb-1 text-sm text-slate-700";

export default function CustomizationPanel({ options, onOptionChange, logo, onLogoChange }) {
  const lowContrast = hasLowContrast(options.colorDark, options.colorLight);
  const inverted = hasInvertedColors(options.colorDark, options.colorLight);

  return (
    <div className="w-72 flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-900">Customize</h2>

      <div>
        <label htmlFor="ec-level" className={labelClassName}>
          Error correction level
        </label>
        <select
          id="ec-level"
          className={selectClassName}
          value={options.errorCorrectionLevel}
          onChange={(e) => onOptionChange("errorCorrectionLevel", e.target.value)}
        >
          {EC_LEVEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="download-size" className={labelClassName}>
          Download size (px)
        </label>
        <select
          id="download-size"
          className={selectClassName}
          value={String(options.width)}
          onChange={(e) => onOptionChange("width", Number(e.target.value))}
        >
          {SIZE_OPTIONS.map((size) => (
            <option key={size} value={String(size)}>
              {size}px
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="margin" className="text-sm text-slate-700">
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
        <div role="status" className="text-sm text-amber-800 bg-amber-50 rounded px-3 py-2">
          These colors are low contrast and may be hard for scanners to read.
        </div>
      )}
      {!lowContrast && inverted && (
        <div role="status" className="text-sm text-amber-800 bg-amber-50 rounded px-3 py-2">
          Lighter modules on a darker background can fail to scan on some readers.
        </div>
      )}

      <LogoDropzone logo={logo} onLogoChange={onLogoChange} />
    </div>
  );
}
