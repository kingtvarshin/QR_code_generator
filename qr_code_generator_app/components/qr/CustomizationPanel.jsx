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
  "w-full min-h-11 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white/80 dark:bg-slate-800/80 dark:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/15";
// Default range-input thumbs are ~12-16px — too small a hit area on touch. Sizing
// the thumb via pseudo-elements needs appearance-none on both the track and thumb.
const rangeClassName =
  "w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 appearance-none cursor-pointer " +
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 " +
  "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 " +
  "[&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full " +
  "[&::-moz-range-thumb]:bg-indigo-600 [&::-moz-range-thumb]:border-0";
const labelClassName = "block mb-1 text-sm text-slate-700 dark:text-slate-300";

export default function CustomizationPanel({ options, onOptionChange, logo, onLogoChange }) {
  const lowContrast = hasLowContrast(options.colorDark, options.colorLight);
  const inverted = hasInvertedColors(options.colorDark, options.colorLight);

  return (
    <div className="w-72 flex flex-col gap-4 rounded-2xl border border-white/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/50 backdrop-blur-md shadow-lg shadow-indigo-900/5 p-5">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Customize</h2>

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
        <label htmlFor="margin" className="text-sm text-slate-700 dark:text-slate-300">
          Margin: {options.margin}
        </label>
        <input
          id="margin"
          type="range"
          min={0}
          max={10}
          value={options.margin}
          onChange={(e) => onOptionChange("margin", Number(e.target.value))}
          className={rangeClassName}
        />
      </div>

      <div className="flex gap-4">
        <label className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
          Foreground
          <input
            type="color"
            value={options.colorDark}
            onChange={(e) => onOptionChange("colorDark", e.target.value)}
            className="rounded-md border border-slate-300 dark:border-slate-600 p-0.5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
          Background
          <input
            type="color"
            value={options.colorLight}
            onChange={(e) => onOptionChange("colorLight", e.target.value)}
            className="rounded-md border border-slate-300 dark:border-slate-600 p-0.5"
          />
        </label>
      </div>

      {lowContrast && (
        <div role="status" className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/30 rounded px-3 py-2">
          These colors are low contrast and may be hard for scanners to read.
        </div>
      )}
      {!lowContrast && inverted && (
        <div role="status" className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/30 rounded px-3 py-2">
          Lighter modules on a darker background can fail to scan on some readers.
        </div>
      )}

      <LogoDropzone logo={logo} onLogoChange={onLogoChange} />
    </div>
  );
}
